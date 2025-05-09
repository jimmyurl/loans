// src/pages/loans/LoanList.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';

const LoanList = () => {
  const navigate = useNavigate();
  const { supabase } = useContext(AuthContext);
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    filterAndSortLoans();
  }, [loans, searchTerm, statusFilter, sortBy, sortDirection]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch loans with client names
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          clients:client_id (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLoans(data || []);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError('Failed to load loans. Please try again later.');
    } finally {
      setLoading(false);
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
        const clientName = `${loan.clients?.first_name || ''} ${loan.clients?.last_name || ''}`.toLowerCase();
        return (
          clientName.includes(searchLower) ||
          (loan.purpose && loan.purpose.toLowerCase().includes(searchLower)) ||
          (loan.id && loan.id.toString().includes(searchLower))
        );
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valA, valB;
      
      switch (sortBy) {
        case 'client_name':
          valA = `${a.clients?.first_name || ''} ${a.clients?.last_name || ''}`.toLowerCase();
          valB = `${b.clients?.first_name || ''} ${b.clients?.last_name || ''}`.toLowerCase();
          break;
        case 'loan_amount':
          valA = a.loan_amount || 0;
          valB = b.loan_amount || 0;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-badge';
      case 'approved': return 'status-badge active';
      case 'disbursed': return 'status-badge active';
      case 'active': return 'status-badge active';
      case 'overdue': return 'status-badge overdue';
      case 'defaulted': return 'status-badge defaulted';
      case 'paid': return 'status-badge fully paid';
      case 'closed': return 'status-badge';
      case 'rejected': return 'status-badge defaulted';
      default: return 'status-badge';
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  return (
    <div className="loan-list-container">
      <div className="filters-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by client name, purpose, or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">
              Clear
            </button>
          )}
        </div>
        
        <div className="status-filter">
          <select 
            value={statusFilter} 
            onChange={handleFilterChange}
            className="status-select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disbursed">Disbursed</option>
            <option value="active">Active</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
            <option value="defaulted">Defaulted</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="table-responsive">
        <table className="loans-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable-header">
                Loan ID {sortBy === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('client_name')} className="sortable-header">
                Client Name {sortBy === 'client_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('loan_amount')} className="sortable-header">
                Amount {sortBy === 'loan_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('interest_rate')} className="sortable-header">
                Interest {sortBy === 'interest_rate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('disbursement_date')} className="sortable-header">
                Disbursement Date {sortBy === 'disbursement_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable-header">
                Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-message">
                  Loading loans...
                </td>
              </tr>
            ) : filteredLoans.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data-message">
                  No loans found. {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : ''}
                </td>
              </tr>
            ) : (
              filteredLoans.map(loan => (
                <tr key={loan.id} className="loan-row">
                  <td>{loan.id}</td>
                  <td>
                    {loan.clients ? `${loan.clients.first_name} ${loan.clients.last_name}` : 'Unknown Client'}
                  </td>
                  <td>{formatCurrency(loan.loan_amount)}</td>
                  <td>{loan.interest_rate}%</td>
                  <td>{formatDate(loan.disbursement_date)}</td>
                  <td>
                    <span className={getStatusBadgeClass(loan.status)}>
                      {loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1) : 'Unknown'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <Link to={`/loans/${loan.id}`} className="btn btn-view">
                      View
                    </Link>
                    {(loan.status === 'pending' || loan.status === 'approved') && (
                      <Link to={`/loans/edit/${loan.id}`} className="btn btn-edit">
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="loan-stats">
        <div className="stats-summary">
          <div className="stat-card">
            <h4>Active Loans</h4>
            <p className="stat-value">{loans.filter(loan => 
              loan.status === 'active' || loan.status === 'disbursed').length}</p>
          </div>
          <div className="stat-card">
            <h4>Overdue Loans</h4>
            <p className="stat-value danger">{loans.filter(loan => 
              loan.status === 'overdue' || loan.status === 'defaulted').length}</p>
          </div>
          <div className="stat-card">
            <h4>Fully Paid</h4>
            <p className="stat-value success">{loans.filter(loan => 
              loan.status === 'paid').length}</p>
          </div>
          <div className="stat-card">
            <h4>Total Portfolio</h4>
            <p className="stat-value">
              {formatCurrency(
                loans
                  .filter(loan => ['active', 'disbursed', 'overdue'].includes(loan.status))
                  .reduce((sum, loan) => sum + (loan.loan_amount || 0), 0)
              )}
            </p>
          </div>
        </div>
      </div>
      
      <div className="create-new-loan">
        <button 
          className="btn btn-primary create-loan-btn" 
          onClick={() => navigate('/new-loan')}
        >
          + Create New Loan
        </button>
      </div>
    </div>
  );
};

export default LoanList;