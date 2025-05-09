// src/pages/ClientsPage.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const ClientsPage = () => {
  const navigate = useNavigate();
  const { supabase } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('last_name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterAndSortClients();
  }, [clients, searchTerm, businessTypeFilter, sortBy, sortDirection]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch clients with their loan counts
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');
      
      if (clientsError) throw clientsError;
      
      // Fetch loan counts for each client
      const clientIds = clientsData.map(client => client.id);
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('client_id, status')
        .in('client_id', clientIds);
      
      if (loansError) throw loansError;
      
      // Calculate loan metrics for each client
      const clientsWithLoans = clientsData.map(client => {
        const clientLoans = loansData.filter(loan => loan.client_id === client.id);
        const activeLoans = clientLoans.filter(loan => 
          ['active', 'disbursed', 'overdue'].includes(loan.status)
        ).length;
        const completedLoans = clientLoans.filter(loan => loan.status === 'paid').length;
        
        return {
          ...client,
          total_loans: clientLoans.length,
          active_loans: activeLoans,
          completed_loans: completedLoans
        };
      });
      
      setClients(clientsWithLoans);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortClients = () => {
    let result = [...clients];
    
    // Apply business type filter
    if (businessTypeFilter !== 'all') {
      result = result.filter(client => client.business_type === businessTypeFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(client => {
        const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
        const businessName = (client.business_name || '').toLowerCase();
        const phone = (client.phone || '').toLowerCase();
        
        return (
          fullName.includes(searchLower) ||
          businessName.includes(searchLower) ||
          phone.includes(searchLower) ||
          (client.id && client.id.toString().includes(searchLower))
        );
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valA, valB;
      
      switch (sortBy) {
        case 'first_name':
          valA = (a.first_name || '').toLowerCase();
          valB = (b.first_name || '').toLowerCase();
          break;
        case 'last_name':
          valA = (a.last_name || '').toLowerCase();
          valB = (b.last_name || '').toLowerCase();
          break;
        case 'business_name':
          valA = (a.business_name || '').toLowerCase();
          valB = (b.business_name || '').toLowerCase();
          break;
        case 'city':
          valA = (a.city || '').toLowerCase();
          valB = (b.city || '').toLowerCase();
          break;
        case 'total_loans':
          valA = a.total_loans || 0;
          valB = b.total_loans || 0;
          break;
        case 'active_loans':
          valA = a.active_loans || 0;
          valB = b.active_loans || 0;
          break;
        default:
          valA = (a.last_name || '').toLowerCase();
          valB = (b.last_name || '').toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
    
    setFilteredClients(result);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setBusinessTypeFilter(e.target.value);
  };

  const getBusinessTypes = () => {
    const types = new Set();
    clients.forEach(client => {
      if (client.business_type) {
        types.add(client.business_type);
      }
    });
    return Array.from(types);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Client Management</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/new-client')}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <span style={{ marginRight: '8px' }}>+</span> Register New Client
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
            placeholder="Search by name, business, phone..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button onClick={() => setSearchTerm('')}>
            {searchTerm ? 'Clear' : 'Search'}
          </button>
        </div>
        
        <div style={{ minWidth: '200px' }}>
          <select 
            value={businessTypeFilter} 
            onChange={handleFilterChange}
            style={{ 
              padding: '0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              width: '100%'
            }}
          >
            <option value="all">All Business Types</option>
            {getBusinessTypes().map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                ID {sortBy === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('last_name')} style={{ cursor: 'pointer' }}>
                Name {sortBy === 'last_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('business_name')} style={{ cursor: 'pointer' }}>
                Business {sortBy === 'business_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Phone</th>
              <th onClick={() => handleSort('city')} style={{ cursor: 'pointer' }}>
                City {sortBy === 'city' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('total_loans')} style={{ cursor: 'pointer' }}>
                Total Loans {sortBy === 'total_loans' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('active_loans')} style={{ cursor: 'pointer' }}>
                Active Loans {sortBy === 'active_loans' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  Loading clients...
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  No clients found. {searchTerm || businessTypeFilter !== 'all' ? 'Try adjusting your search or filters.' : ''}
                </td>
              </tr>
            ) : (
              filteredClients.map(client => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{`${client.first_name} ${client.last_name}`}</td>
                  <td>{client.business_name || '-'}</td>
                  <td>{client.phone || '-'}</td>
                  <td>{client.city || '-'}</td>
                  <td>{client.total_loans || 0}</td>
                  <td>{client.active_loans || 0}</td>
                  <td>
                    <Link to={`/clients/${client.id}`} className="btn btn-view">
                      View
                    </Link>
                    <Link to={`/clients/${client.id}/edit`} className="btn btn-edit">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Client Statistics</h3>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Clients</h3>
            <p>{clients.length}</p>
          </div>
          <div className="stat-card">
            <h3>Clients with Active Loans</h3>
            <p>{clients.filter(client => client.active_loans > 0).length}</p>
          </div>
          <div className="stat-card success">
            <h3>Clients with Completed Loans</h3>
            <p>{clients.filter(client => client.completed_loans > 0).length}</p>
          </div>
          <div className="stat-card">
            <h3>New Clients This Month</h3>
            <p>
              {clients.filter(client => {
                const createdDate = new Date(client.created_at);
                const today = new Date();
                return createdDate.getMonth() === today.getMonth() && 
                       createdDate.getFullYear() === today.getFullYear();
              }).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;