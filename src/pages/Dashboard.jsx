import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';

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

const Dashboard = () => {
  const [activeLoans, setActiveLoans] = useState(145);
  const [totalDisbursed, setTotalDisbursed] = useState("56,450,000");
  const [fullyRepaid, setFullyRepaid] = useState(48);
  const [overdueLoans, setOverdueLoans] = useState(15);
  const [loans, setLoans] = useState(sampleLoanData);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [user, setUser] = useState(null);
  
  // Simulate loading user data from session storage
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('auth');
    if (storedAuth) {
      try {
        const userData = JSON.parse(storedAuth);
        setUser(userData.user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    sessionStorage.removeItem('auth');
    // Redirect to login page
    window.location.href = '/';
  };

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
  };

  const formatCurrency = (value) => {
    // Format number as TZS currency
    return new Intl.NumberFormat('en-TZ').format(value);
  };

  return (
    <div className="flex-col min-h-screen">
      {/* Header */}
      <header>
        <div className="container">
          <div className="logo">
            ASSE <span>Microfinance</span>
          </div>
          
          <nav>
            <ul>
              <li><a href="/dashboard" className="active">Dashboard</a></li>
              <li><a href="/loans">Loans</a></li>
              <li><a href="/clients">Clients</a></li>
              <li><a href="/reports">Reports</a></li>
              <li><a href="/settings">Settings</a></li>
            </ul>
          </nav>
          
          <div className="user-menu">
            <span className="user-email">{user?.email || 'User'}</span>
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              <LogOut size={16} className="logout-icon" />
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="container">
        <div className="main-content">
          {/* Sidebar */}
          <div className="sidebar">
            <h3>Quick Actions</h3>
            <ul>
              <li>
                <a href="/dashboard" className="active">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/new-loan">
                  New Loan
                </a>
              </li>
              <li>
                <a href="/new-client">
                  New Client
                </a>
              </li>
              <li>
                <a href="/disbursements">
                  Disbursements
                </a>
              </li>
              <li>
                <a href="/repayments">
                  Repayments
                </a>
              </li>
              <li>
                <a href="/reports">
                  Generate Reports
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {e.preventDefault(); handleLogout();}}
                  className="logout-btn"
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
          
          {/* Main Content */}
          <div className="content">
            <h2>Dashboard</h2>
            
            {/* Alerts */}
            {alertMessage && (
              <div className={`alert ${
                alertMessage.type === 'error' ? 'alert-error' :
                alertMessage.type === 'success' ? 'alert-success' :
                'alert-info'
              }`}>
                {alertMessage.text}
              </div>
            )}
            
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
            
            {/* Chart */}
            <div className="chart-container">
              <h3>Loan Performance</h3>
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`TZS ${formatCurrency(value)}`, undefined]} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="disbursed" 
                      stroke="var(--primary-color)" 
                      name="Disbursed"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="repaid" 
                      stroke="var(--success-color)" 
                      name="Repaid"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Recent Loans */}
            <h2>Recent Loans</h2>
            
            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by client name or loan ID"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <button onClick={handleSearch}>
                Search
              </button>
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
                        <td>{loan.clientName}</td>
                        <td>{formatCurrency(loan.amount)}</td>
                        <td>{new Date(loan.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${loan.status.toLowerCase()}`}>
                            {loan.status}
                          </span>
                        </td>
                        <td>
                          <a href={`/loans/${loan.id}`} className="btn-view">View</a>
                          <a href={`/loans/${loan.id}/edit`} className="btn-edit">Edit</a>
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
        </div>
      </div>
      
      {/* Footer */}
      <footer>
        <div className="container">
          © 2025 ASSE Microfinance. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;