// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AuthContext } from '../App';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Users, CreditCard, Calendar, FileText, Loader } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';



const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xfihpvkbzppaejluyqoq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaWhwdmtienBwYWVqbHV5cW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NDQzMzgsImV4cCI6MjA0NDEyMDMzOH0.U30_ovXdjGrovUZhBeVbeXtX-Xg29BPNZF9mhz7USfM';
const supabase = createClient(supabaseUrl, supabaseKey);
// Quick navigation links definition


const quickNavLinks = [
  { 
    to: "/new-loan", 
    icon: <PlusCircle size={24} />, 
    title: "Create New Loan", 
    description: "Process a new loan application" 
  },
  { 
    to: "/new-client", 
    icon: <Users size={24} />, 
    title: "Register Client", 
    description: "Add a new client to the system" 
  },
  { 
    to: "/disbursements", 
    icon: <CreditCard size={24} />, 
    title: "Disbursements", 
    description: "Manage loan disbursements" 
  },
  { 
    to: "/repayments", 
    icon: <Calendar size={24} />, 
    title: "Repayments", 
    description: "Record loan repayments" 
  },
  { 
    to: "/reports", 
    icon: <FileText size={24} />, 
    title: "Reports", 
    description: "Generate financial reports" 
  }
];

// Define loan status colors
const statusColors = {
  'Pending': '#9E9E9E',
  'Active': '#2196F3',
  'Fully Paid': '#4CAF50',
  'Overdue': '#FF9800',
  'Defaulted': '#F44336',
  'Rejected': '#607D8B'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [alertMessage, setAlertMessage] = useState({ text: "Loading dashboard data...", type: "info" });
  
  // Dashboard metrics
  const [stats, setStats] = useState({
    activeLoans: 0,
    totalDisbursed: 0,
    fullyRepaid: 0,
    overdueLoans: 0,
    newClientsThisMonth: 0,
    thisMonthDisbursement: 0,
    thisMonthCollection: 0,
    overdueThisMonth: 0,
  });
  
  // Charts data
  const [chartData, setChartData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [session]);

  // Update filtered loans when search term or loans change
  useEffect(() => {
    handleSearch();
  }, [searchTerm, loans]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    if (!session?.user) {
      setAlertMessage({ text: "Please log in to view the dashboard.", type: "warning" });
      setIsLoading(false);
      return;
    }
    
    try {
      // Fetch recent loans with client information
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select(`
          id, 
          loan_number, 
          principal_amount, 
          disbursement_date, 
          status,
          client_id(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (loansError) throw loansError;
      
      // Transform the loan data
      const formattedLoans = loansData.map(loan => ({
        id: loan.id,
        loanNumber: loan.loan_number,
        clientName: `${loan.client_id.first_name} ${loan.client_id.last_name}`,
        clientId: loan.client_id.id,
        amount: loan.principal_amount,
        date: loan.disbursement_date,
        status: loan.status
      }));
      
      setLoans(formattedLoans);
      setFilteredLoans(formattedLoans);
      
      // Fetch loan status counts for the pie chart
      const { data: statusCounts, error: statusError } = await supabase
        .from('loans')
        .select('status, count(*)')
        .group('status');
        
      if (statusError) throw statusError;
      
      // Format status data for pie chart
      const formattedStatusData = statusCounts.map(item => ({
        name: item.status,
        value: parseInt(item.count),
        color: statusColors[item.status] || '#999'
      }));
      
      setStatusData(formattedStatusData);
      
      // Fetch monthly loan data for the line chart (last 4 months)
      const monthlyData = await fetchMonthlyLoanData();
      setChartData(monthlyData);
      
      // Fetch dashboard summary statistics
      const dashboardStats = await fetchDashboardStats();
      setStats(dashboardStats);
      
      // Check for overdue loans that need attention
      const overdueCount = statusCounts.find(s => s.status === 'Overdue')?.count || 0;
      
      if (overdueCount > 0) {
        setAlertMessage({ 
          text: `Welcome to the dashboard! You have ${overdueCount} overdue loan collections to follow up today.`, 
          type: "info" 
        });
      } else {
        setAlertMessage({ text: "Welcome to the dashboard! All loans are currently in good standing.", type: "success" });
      }
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setAlertMessage({ text: "Failed to load dashboard data. Please try again later.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fetch the last 4 months of loan data
  const fetchMonthlyLoanData = async () => {
    try {
      const months = [];
      const today = new Date();
      const result = [];
      
      // Get the last 4 months
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        
        const monthName = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JavaScript months are 0-based
        
        const startDate = `<span class="math-inline">\{year\}\-</span>{month.toString().padStart(2, '0')}-01`;
        let endDate;
        
        if (i === 0) { // Current month
          endDate = today.toISOString().split('T')[0]; // Today's date
        } else {
          const lastDay = new Date(year, month, 0).getDate();
          endDate = `<span class="math-inline">\{year\}\-</span>{month.toString().padStart(2, '0')}-${lastDay}`;
        }
        
        // Get total disbursed amount for the month from loan_disbursements table
        const { data: disbursements, error: disbursementError } = await supabase
          .from('loan_disbursements')
          .select('amount')
          .gte('disbursement_date', startDate)
          .lte('disbursement_date', endDate);
          
        if (disbursementError) throw disbursementError;
        
        const disbursedAmount = disbursements.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        
        // For repayments, we would need a loan_repayments table
        // Since that's not available in the schema you shared, we'll estimate based on active loans
        // In a real implementation, replace this with actual repayment data
        
        // Estimate repayments (this is placeholder logic)
        const { data: activeLoans, error: loansError } = await supabase
          .from('loans')
          .select('principal_amount, interest_rate, term_months, disbursement_date')
          .lt('disbursement_date', endDate)
          .in('status', ['Active', 'Fully Paid']);
          
        if (loansError) throw loansError;
        
        // Simple estimation of repayments based on loan terms
        // In reality, you would use actual repayment data from a repayments table
        const estimatedRepaid = activeLoans.reduce((total, loan) => {
          if (!loan.disbursement_date) return total;
          
          const startDate = new Date(loan.disbursement_date);
          const currentDate = new Date(endDate);
          
          // Calculate months between disbursement and current month
          const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                            (currentDate.getMonth() - startDate.getMonth());
          
          if (monthsDiff <= 0) return total;
          
          // Simple monthly payment calculation (principal + interest / term)
          const monthlyPayment = loan.principal_amount * (1 + loan.interest_rate / 100) / loan.term_months;
          
          // Only count payments that would have been made in this period
          const paymentsInPeriod = Math.min(monthsDiff, loan.term_months);
          
          return total + (monthlyPayment * paymentsInPeriod);
        }, 0);
        
        result.push({
          month: monthName,
          disbursed: disbursedAmount,
          repaid: estimatedRepaid
        });
      }
      
      return result;
      
    } catch (error) {
      console.error("Error fetching monthly loan data:", error);
      return [];
    }
  };

  // Fetch summary statistics for the dashboard
  const fetchDashboardStats = async () => {
    try {
      // Get counts for different loan statuses
      const { data: statusCounts, error: statusError } = await supabase
        .from('loans')
        .select('status, count(*)')
        .group('status');
        
      if (statusError) throw statusError;
      
      // Find counts for each status
      const activeCount = statusCounts.find(s => s.status === 'Active')?.count || 0;
      const fullyPaidCount = statusCounts.find(s => s.status === 'Fully Paid')?.count || 0;
      const overdueCount = statusCounts.find(s => s.status === 'Overdue')?.count || 0;
      
      // Get total disbursed amount from loan_disbursements
      const { data: disbursements, error: disbursementError } = await supabase
        .from('loan_disbursements')
        .select('amount');
        
      if (disbursementError) throw disbursementError;
      
      const totalDisbursed = disbursements.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      
      // Get this month's data
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const currentDay = today.toISOString().split('T')[0];
      
      // This month's disbursements
      const { data: thisMonthDisbursements, error: thisMonthDisbError } = await supabase
        .from('loan_disbursements')
        .select('amount')
        .gte('disbursement_date', firstDayOfMonth)
        .lte('disbursement_date', currentDay);
        
      if (thisMonthDisbError) throw thisMonthDisbError;
      
      const thisMonthDisbursed = thisMonthDisbursements.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      
      // New clients this month
      const { data: newClients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .gte('created_at', firstDayOfMonth)
        .lte('created_at', currentDay);
        
      if (clientsError) throw clientsError;
      
      // For this month's collection and overdue, we would need actual repayment data
      // These are placeholders - replace with actual implementation when you have a repayments table
      
      // Simple estimation of this month's collection
      // In reality, replace with actual repayment data
      const thisMonthCollection = thisMonthDisbursed * 0.15; // Arbitrary percentage for demo
      
      // Overdue this month
      const overdueThisMonth = thisMonthDisbursed * 0.05; // Arbitrary percentage for demo
      
      return {
        activeLoans: parseInt(activeCount),
        totalDisbursed: totalDisbursed,
        fullyRepaid: parseInt(fullyPaidCount),
        overdueLoans: parseInt(overdueCount),
        newClientsThisMonth: newClients.length,
        thisMonthDisbursement: thisMonthDisbursed,
        thisMonthCollection: thisMonthCollection,
        overdueThisMonth: overdueThisMonth
      };
      
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        activeLoans: 0,
        totalDisbursed: 0,
        fullyRepaid: 0,
        overdueLoans: 0,
        newClientsThisMonth: 0,
        thisMonthDisbursement: 0,
        thisMonthCollection: 0,
        overdueThisMonth: 0
      };
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredLoans(loans);
      return;
    }
    
    const filtered = loans.filter(loan => 
      loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredLoans(filtered);
    
    if (filtered.length === 0 && loans.length > 0) {
      setAlertMessage({ text: "No loans found matching your search criteria.", type: "warning" });
    } else if (alertMessage?.text === "No loans found matching your search criteria.") {
      setAlertMessage(null);
    }
  };

  const formatCurrency = (value) => {
    // Format number as TZS currency
    return new Intl.NumberFormat('en-TZ').format(value);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'status-badge active';
      case 'Overdue': return 'status-badge overdue';
      case 'Fully Paid': return 'status-badge fully-paid';
      case 'Pending': return 'status-badge pending';
      case 'Defaulted': return 'status-badge defaulted';
      case 'Rejected': return 'status-badge rejected';
      default: return 'status-badge';
    }
  };

  return (
    <>
      <h2 className="content-title">Dashboard</h2>
      
      {/* Alerts */}
      {alertMessage && (
        <div className={`alert alert-${alertMessage.type}`}>
          {alertMessage.text}
        </div>
      )}
      
      {isLoading ? (
        <div className="loading-container">
          <Loader size={48} className="spin" />
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Quick Navigation Section */}
          <div className="quick-nav-section">
            <h3 className="section-title">Quick Navigation</h3>
            <div className="quick-nav-links" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '2rem' }}>
              {quickNavLinks.map((link, index) => (
                <Link 
                  key={index} 
                  to={link.to} 
                  className="quick-nav-card" 
                  style={{
                    flex: '1 0 200px',
                    maxWidth: 'calc(33.333% - 10px)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{ marginRight: '12px', color: '#2196F3' }}>
                    {link.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#333' }}>{link.title}</h4>
                    <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#666' }}>{link.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Active Loans</h3>
              <p>{stats.activeLoans}</p>
            </div>
            
            <div className="stat-card">
              <h3>Total Disbursed (TZS)</h3>
              <p>{formatCurrency(stats.totalDisbursed)}</p>
            </div>
            
            <div className="stat-card success">
              <h3>Fully Repaid Loans</h3>
              <p>{stats.fullyRepaid}</p>
            </div>
            
            <div className="stat-card danger">
              <h3>Overdue Loans</h3>
              <p>{stats.overdueLoans}</p>
            </div>
          </div>
          
          {/* Chart Row */}
          <div className="charts-container" style={{ display: 'flex', gap: '20px', marginBottom: '2rem' }}>
            {/* Line Chart */}
            <div className="chart-container" style={{ flex: '2', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
              <h3 className="chart-title">Loan Performance</h3>
              <div className="chart">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`TZS ${formatCurrency(value)}`, undefined]} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="disbursed" 
                      stroke="#004D40" 
                      name="Disbursed"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="repaid" 
                      stroke="#4CAF50" 
                      name="Repaid"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Pie Chart */}
            <div className="chart-container" style={{ flex: '1', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
              <h3 className="chart-title">Loan Status Distribution</h3>
              <div className="chart">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Loans']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Recent Loans */}
          <div className="section-container">
            <h2 className="section-title">Recent Loans</h2>
            
            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by client name or loan number"
                className="search-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <button 
                onClick={handleSearch}
                className="btn btn-primary"
              >
                Search
              </button>
              <Link 
                to="/loans" 
                className="btn btn-secondary" 
                style={{ marginLeft: '10px' }}
              >
                View All Loans
              </Link>
            </div>
            
            {/* Loans Table */}
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Loan Number</th>
                    <th>Client Name</th>
                    <th>Amount (TZS)</th>
                    <th>Disbursement Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                      <tr key={loan.id}>
                        <td>{loan.loanNumber}</td>
                        <td>
                          <Link to={`/clients/${loan.clientId}`} className="client-link" style={{ color: '#2196F3', textDecoration: 'none' }}>
                            {loan.clientName}
                          </Link>
                        </td>
                        <td>{formatCurrency(loan.amount)}</td>
                        <td>{loan.date ? new Date(loan.date).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className={getStatusClass(loan.status)}>
                            {loan.status}
                          </span>
                        </td>
                        <td>
                          <Link to={`/loans/${loan.id}`} className="btn btn-view">View</Link>
                          <Link to={`/loans/edit/${loan.id}`} className="btn btn-edit">Edit</Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        {loans.length > 0 ? 'No loans found matching your search criteria' : 'No loans available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="summary-section" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Monthly Summary</h2>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>New Clients This Month</h3>
                <p>{stats.newClientsThisMonth}</p>
              </div>
              
              <div className="stat-card success">
                <h3>This Month Disbursement</h3>
                <p>{formatCurrency(stats.thisMonthDisbursement)}</p>
              </div>
              
              <div className="stat-card">
                <h3>This Month Collection</h3>
                <p>{formatCurrency(stats.thisMonthCollection)}</p>
              </div>
              
              <div className="stat-card danger">
                <h3>Overdue This Month</h3>
                <p>{formatCurrency(stats.overdueThisMonth)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;