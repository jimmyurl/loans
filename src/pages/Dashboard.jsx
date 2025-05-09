// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AuthContext } from '../App';
import { Link } from 'react-router-dom';
import { PlusCircle, Users, CreditCard, Calendar, FileText } from 'lucide-react';

// Sample data for demonstration purposes
const sampleLoanData = [
  { id: "L-2025-001", clientName: "Maria Kimaro", amount: 1200000, date: "2025-04-01", status: "Active" },
  { id: "L-2025-002", clientName: "John Massawe", amount: 850000, date: "2025-04-03", status: "Overdue" },
  { id: "L-2025-003", clientName: "Grace Mwakasege", amount: 2500000, date: "2025-04-05", status: "Active" },
  { id: "L-2025-004", clientName: "Emmanuel Shirima", amount: 1500000, date: "2025-04-10", status: "Active" },
  { id: "L-2025-005", clientName: "Fatma Hussein", amount: 3000000, date: "2025-04-12", status: "Fully Paid" },
];

const chartData = [
  { month: 'Jan', disbursed: 8500000, repaid: 7200000 },
  { month: 'Feb', disbursed: 12000000, repaid: 9800000 },
  { month: 'Mar', disbursed: 15500000, repaid: 11000000 },
  { month: 'Apr', disbursed: 20450000, repaid: 13200000 },
];

// Loan status distribution data for pie chart
const statusData = [
  { name: 'Active', value: 145, color: '#2196F3' },
  { name: 'Overdue', value: 15, color: '#FF9800' },
  { name: 'Fully Paid', value: 48, color: '#4CAF50' },
  { name: 'Defaulted', value: 7, color: '#F44336' }
];

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

const Dashboard = () => {
  const [activeLoans, setActiveLoans] = useState(145);
  const [totalDisbursed, setTotalDisbursed] = useState("56,450,000");
  const [fullyRepaid, setFullyRepaid] = useState(48);
  const [overdueLoans, setOverdueLoans] = useState(15);
  const [loans, setLoans] = useState(sampleLoanData);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState({ text: "Welcome to the dashboard! You have 2 overdue loan collections to follow up today.", type: "info" });
  const { session } = useContext(AuthContext);
  
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setLoans(sampleLoanData);
      return;
    }
    
    const filtered = sampleLoanData.filter(loan => 
      loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      loan.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setLoans(filtered);
    
    if (filtered.length === 0) {
      setAlertMessage({ text: "No loans found matching your search criteria.", type: "warning" });
    } else {
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
      case 'Fully Paid': return 'status-badge fully paid';
      default: return 'status-badge';
    }
  };

  // Handle View button click for a loan
  const handleViewLoan = (loanId) => {
    // Navigate to the loan details page
    window.location.href = `/loans/${loanId}`;
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
          <p>{activeLoans}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Disbursed (TZS)</h3>
          <p>{totalDisbursed}</p>
        </div>
        
        <div className="stat-card success">
          <h3>Fully Repaid Loans</h3>
          <p>{fullyRepaid}</p>
        </div>
        
        <div className="stat-card danger">
          <h3>Overdue Loans</h3>
          <p>{overdueLoans}</p>
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
            placeholder="Search by client name or loan ID"
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
                <th>Loan ID</th>
                <th>Client Name</th>
                <th>Amount (TZS)</th>
                <th>Disbursement Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.id}</td>
                    <td>
                      <Link to={`/clients/${loan.clientName.replace(/\s+/g, '-').toLowerCase()}`} className="client-link" style={{ color: '#2196F3', textDecoration: 'none' }}>
                        {loan.clientName}
                      </Link>
                    </td>
                    <td>{formatCurrency(loan.amount)}</td>
                    <td>{new Date(loan.date).toLocaleDateString()}</td>
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
                    No loans found matching your search criteria
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
            <p>12</p>
          </div>
          
          <div className="stat-card success">
            <h3>This Month Disbursement</h3>
            <p>16,450,000</p>
          </div>
          
          <div className="stat-card">
            <h3>This Month Collection</h3>
            <p>8,760,000</p>
          </div>
          
          <div className="stat-card danger">
            <h3>Overdue This Month</h3>
            <p>1,250,000</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;