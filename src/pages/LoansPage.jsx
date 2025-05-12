// src/pages/LoansPage.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Loader, PlusCircle } from 'lucide-react';

const statusColors = {
  'Pending': '#9E9E9E',
  'Active': '#2196F3',
  'Fully Paid': '#4CAF50',
  'Overdue': '#FF9800',
  'Defaulted': '#F44336',
  'Rejected': '#607D8B'
};

const LoansPage = () => {
  const navigate = useNavigate();
  const { session, supabase } = useContext(AuthContext);
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
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

  useEffect(() => {
    if (session) {
      fetchLoansAndStats();
    }
  }, [session]);

  useEffect(() => {
    filterAndSortLoans();
  }, [loans, searchTerm, statusFilter, sortBy, sortDirection]);

  const fetchLoansAndStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch loans with client names
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select(`
          *,
          client_id (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (loansError) throw loansError;
      setLoans(loansData || []);

      // Fetch dashboard statistics
      const statsData = await fetchDashboardStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching loans and stats:', err);
      setError('Failed to load loans and statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Get counts for different loan statuses
      const { data: statusCounts, error: statusError } = await supabase
        .from('loans')
        .select('status, count(*)')
        .group('status');
        
      if (statusError) throw statusError;
      
      // Loan status counts with type conversion
      const activeCount = parseInt(statusCounts.find(s => s.status === 'Active')?.count || 0);
      const fullyPaidCount = parseInt(statusCounts.find(s => s.status === 'Fully Paid')?.count || 0);
      const overdueCount = parseInt(statusCounts.find(s => s.status === 'Overdue')?.count || 0);
      
      // Total disbursed amount
      const { data: disbursements, error: disbursementError } = await supabase
        .from('loan_disbursements')
        .select('amount');
        
      if (disbursementError) throw disbursementError;
      
      const totalDisbursed = disbursements.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      
      // This month's calculations
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      // This month's disbursements
      const { data: thisMonthDisbursements, error: thisMonthDisbError } = await supabase
        .from('loan_disbursements')
        .select('amount')
        .gte('disbursement_date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('disbursement_date', lastDayOfMonth.toISOString().split('T')[0]);
        
      if (thisMonthDisbError) throw thisMonthDisbError;
      
      const thisMonthDisbursed = thisMonthDisbursements.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      
      // New clients this month
      const { data: newClients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .gte('created_at', firstDayOfMonth.toISOString().split('T')[0])
        .lte('created_at', lastDayOfMonth.toISOString().split('T')[0]);
        
      if (clientsError) throw clientsError;
      
      // Fetch this month's collections and overdue amounts
      const { data: thisMonthCollections, error: collectionsError } = await supabase
        .from('loan_repayments')
        .select('amount')
        .gte('payment_date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('payment_date', lastDayOfMonth.toISOString().split('T')[0]);
      
      if (collectionsError) throw collectionsError;
      
      const thisMonthCollection = thisMonthCollections.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      
      // Overdue loans this month
      const { data: overdueLoansThisMonth, error: overdueError } = await supabase
        .from('loans')
        .select('principal_amount')
        .eq('status', 'Overdue')
        .gte('created_at', firstDayOfMonth.toISOString().split('T')[0])
        .lte('created_at', lastDayOfMonth.toISOString().split('T')[0]);
      
      if (overdueError) throw overdueError;
      
      const overdueThisMonth = overdueLoansThisMonth.reduce((sum, item) => sum + parseFloat(item.principal_amount), 0);
      
      return {
        activeLoans: activeCount,
        totalDisbursed: totalDisbursed,
        fullyRepaid: fullyPaidCount,
        overdueLoans: overdueCount,
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

  const filterAndSortLoans = () => {
    let result = [...loans];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(loan => loan.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(loan => {
        const clientName = `${loan.client_id?.first_name || ''} ${loan.client_id?.last_name || ''}`.toLowerCase();
        return (
          clientName.includes(searchLower) ||
          (loan.loan_number && loan.loan_number.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valA, valB;
      
      switch (sortBy) {
        case 'client_name':
          valA = `${a.client_id?.first_name || ''} ${a.client_id?.last_name || ''}`.toLowerCase();
          valB = `${b.client_id?.first_name || ''} ${b.client_id?.last_name || ''}`.toLowerCase();
          break;
        case 'loan_amount':
          valA = a.principal_amount || 0;
          valB = b.principal_amount || 0;
          break;
        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;
        case 'disbursement_date':
          valA = a.disbursement_date || '';
          valB = b.disbursement_date || '';
          break;
        default: // created_at
          valA = a.created_at || '';
          valB = b.created_at || '';
      }
      
      if (sortDirection === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
    
    setFilteredLoans(result);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle direction if same field is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set default direction
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (value) => {
    // Format number as TZS currency
    return new Intl.NumberFormat('en-TZ').format(value || 0);
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

  // Loading and error states
  if (loading) {
    return (
      <div className="loading-container">
        <Loader size={48} className="spin" />
        <p>Loading loans and statistics...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="content-title">Loan Management</h2>
        <Link 
          to="/new-loan" 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <PlusCircle size={20} style={{ marginRight: '8px' }} /> New Loan
        </Link>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
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
      
      {/* Search and Filter */}
      <div style={{ display: 'flex', marginBottom: '1rem', gap: '1rem' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search by client name or loan number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button 
            onClick={() => setSearchTerm('')}
            className="btn btn-secondary"
          >
            {searchTerm ? 'Clear' : 'Search'}
          </button>
        </div>
        
        <div style={{ minWidth: '180px' }}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{
              padding: '0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              width: '100%',
              backgroundColor: 'white',
              color: 'var(--text-color)',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1rem'
            }}
          >
            <option value="all">All Statuses</option>
            {Object.keys(statusColors).map(status => (
              <option 
                key={status} 
                value={status}
                style={{ 
                  backgroundColor: statusColors[status],
                  color: 'white'
                }}
              >
                {status}
              </option>
            ))}
          </select>
        </div>
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
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-results">
                  {loans.length > 0 ? 'No loans found matching your search criteria' : 'No loans available'}
                </td>
                </tr>
            ) : (
              filteredLoans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.loan_number || 'N/A'}</td>
                  <td>
                    {loan.client_id 
                      ? `${loan.client_id.first_name} ${loan.client_id.last_name}` 
                      : 'Unknown Client'}
                  </td>
                  <td>{formatCurrency(loan.principal_amount)}</td>
                  <td>{loan.disbursement_date ? new Date(loan.disbursement_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span 
                      className={getStatusClass(loan.status)}
                      style={{ 
                        backgroundColor: statusColors[loan.status] || '#9E9E9E',
                        color: 'white'
                      }}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => navigate(`/loan-details/${loan.id}`)}
                        className="btn btn-sm btn-info"
                      >
                        View
                      </button>
                      {loan.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleLoanAcceptance(loan.id)}
                            className="btn btn-sm btn-success"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleLoanRejection(loan.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoansPage;