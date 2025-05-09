// src/pages/LoansPage.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const LoansPage = () => {
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Loan Management</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/new-loan')}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <span style={{ marginRight: '8px' }}>+</span> New Loan
        </button>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', marginBottom: '1rem', gap: '1rem' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search by client name, purpose, or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button onClick={() => setSearchTerm('')}>
            {searchTerm ? 'Clear' : 'Search'}
          </button>
        </div>
        
        <div style={{ minWidth: '180px' }}>
          <select 
            value={statusFilter} 
            onChange={handleFilterChange}
            style={{ 
              padding: '0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              width: '100%'
            }}
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
      
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                Loan ID {sortBy === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('client_name')} style={{ cursor: 'pointer' }}>
                Client Name {sortBy === 'client_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('loan_amount')} style={{ cursor: 'pointer' }}>
                Amount {sortBy === 'loan_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('interest_rate')} style={{ cursor: 'pointer' }}>
                Interest {sortBy === 'interest_rate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('disbursement_date')} style={{ cursor: 'pointer' }}>
                Disbursement Date {sortBy === 'disbursement_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  Loading loans...
                </td>
              </tr>
            ) : filteredLoans.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  No loans found. {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : ''}
                </td>
              </tr>
            ) : (
              filteredLoans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.id}</td>
                  <td>
                    {loan.clients ? `${loan.clients.first_name} ${loan.clients.last_name}` : 'Unknown Client'}
                  </td>
                  <td>{formatCurrency(loan.loan_amount)}</td>
                  <td>{loan.interest_rate}%</td>
                  <td>{formatDate(loan.disbursement_date)}</td>
                  <td>
                    <span className={getStatusBadgeClass(loan.status)}>
                      {loan.status ? loan.status.replace('_', ' ') : 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/loans/${loan.id}`} className="btn btn-view">
                      View
                    </Link>
                    {(loan.status === 'pending' || loan.status === 'approved') && (
                      <Link to={`/loans/${loan.id}/edit`} className="btn btn-edit">
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
      
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Quick Stats</h3>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Active Loans</h3>
            <p>{loans.filter(loan => loan.status === 'active' || loan.status === 'disbursed').length}</p>
          </div>
          <div className="stat-card success">
            <h3>Fully Paid Loans</h3>
            <p>{loans.filter(loan => loan.status === 'paid').length}</p>
          </div>
          <div className="stat-card danger">
            <h3>Overdue Loans</h3>
            <p>{loans.filter(loan => loan.status === 'overdue' || loan.status === 'defaulted').length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Portfolio</h3>
            <p>
              {formatCurrency(
                loans
                  .filter(loan => ['active', 'disbursed', 'overdue'].includes(loan.status))
                  .reduce((sum, loan) => sum + (loan.loan_amount || 0), 0)
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoansPage;