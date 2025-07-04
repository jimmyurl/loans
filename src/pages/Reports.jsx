// src/pages/Reports.jsx
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Reports = () => {
  const navigate = useNavigate();
  const { supabase, user } = useContext(AuthContext);
  
  // Report Generation States
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [loanStatus, setLoanStatus] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  
  // Page Management States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Reports and User Role States
  const [reports, setReports] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  // Dropdown Options
  const [branches, setBranches] = useState([]);

  // Fetch user profile and branches on component mount
  useEffect(() => {
    const fetchUserProfileAndBranches = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        const role = profileData?.role || 'loan_officer';
        setUserRole(role);
        setIsAdmin(role === 'admin');

        // Fetch branches for filtering
        const { data: branchData, error: branchError } = await supabase
          .from('system_branches')
          .select('branch_id, branch_name');

        if (branchError) throw branchError;

        setBranches(branchData || []);
      } catch (err) {
        console.error('Error fetching user profile or branches:', err);
        setError('Failed to load user information');
      }
    };

    fetchUserProfileAndBranches();
  }, [user, navigate, supabase]);

  // Fetch reports based on user role and filters
  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Base query for comprehensive loan reporting
        let query = supabase
          .from('loans')
          .select(`
            *,
            client:clients(
              id,
              first_name,
              last_name,
              phone_number,
              email
            ),
            created_by:user_profiles(
              user_id,
              full_name,
              username,
              branch,
              email
            )
          `);

        // Apply date range filter if dates are provided
        if (dateFrom && dateTo) {
          query = query.gte('created_at', dateFrom)
                       .lte('created_at', dateTo);
        }

        // Apply status filter if selected
        if (loanStatus) {
          query = query.eq('status', loanStatus);
        }

        // Apply branch filter if selected
        if (selectedBranch) {
          query = query.eq('created_by.branch', selectedBranch);
        }

        // If not an admin, filter loans by current user's branch
        if (!isAdmin) {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('branch')
            .eq('user_id', user.id)
            .single();

          query = query.eq('created_by.branch', userProfile?.branch);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        setReports(data || []);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReports();
    }
  }, [user, isAdmin, supabase, dateFrom, dateTo, loanStatus, selectedBranch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportType || !dateFrom || !dateTo) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare report generation parameters
      const reportParams = {
        report_type: reportType,
        date_from: dateFrom,
        date_to: dateTo,
        format: reportFormat,
        loan_status: loanStatus,
        branch: selectedBranch || (isAdmin ? null : userRole?.branch),
        created_by: user.id,
        status: 'pending'
      };

      // Trigger report generation 
      // TODO: Implement actual report generation logic
      console.log('Report Generation Parameters:', reportParams);
      
      // Simulated report generation success
      setSuccess('Report request submitted successfully. Generation in progress...');
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Utility function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount || 0);
  };

  // Format client name
  const formatClientName = (client) => {
    return client 
      ? `${client.first_name} ${client.last_name}` 
      : 'N/A';
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h3>Generate Loan Reports</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="report-type">Report Type</label>
                  <select 
                    id="report-type" 
                    className="form-control"
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)}
                    required
                  >
                    <option value="">-- Select Report Type --</option>
                    <option value="loan-summary">Loan Summary</option>
                    <option value="disbursement">Disbursements</option>
                    <option value="repayment">Repayments</option>
                    <option value="overdue">Overdue Loans</option>
                    <option value="portfolio">Portfolio Analysis</option>
                  </select>
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="report-date-from">From Date</label>
                  <input 
                    type="date" 
                    id="report-date-from" 
                    className="form-control"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="report-date-to">To Date</label>
                  <input 
                    type="date" 
                    id="report-date-to" 
                    className="form-control"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="loan-status">Loan Status</label>
                  <select 
                    id="loan-status" 
                    className="form-control"
                    value={loanStatus}
                    onChange={(e) => setLoanStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Fully Paid">Fully Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Defaulted">Defaulted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                
                {isAdmin && (
                  <div className="form-group mb-3">
                    <label htmlFor="branch-select">Branch</label>
                    <select
                      id="branch-select"
                      className="form-control"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                      <option value="">All Branches</option>
                      {branches.map((branch) => (
                        <option 
                          key={branch.branch_id} 
                          value={branch.branch_id}
                        >
                          {branch.branch_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="form-group mb-3">
                  <label htmlFor="report-format">Format</label>
                  <select 
                    id="report-format" 
                    className="form-control"
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value)}
                    required
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3>Loan Reports</h3>
              {isAdmin && (
                <span className="badge bg-info">Admin View</span>
              )}
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Loan Number</th>
                        <th>Client</th>
                        <th>Principal</th>
                        <th>Status</th>
                        <th>Disbursement Date</th>
                        {isAdmin && (
                          <>
                            <th>Created By</th>
                            <th>Branch</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((loan) => (
                        <tr key={loan.id}>
                          <td>{loan.loan_number}</td>
                          <td>
                            {formatClientName(loan.client)}
                            {loan.client?.phone_number && (
                              <div className="text-muted small">
                                {loan.client.phone_number}
                              </div>
                            )}
                          </td>
                          <td>{formatCurrency(loan.principal_amount)}</td>
                          <td>
                            <span className={`badge ${
                              loan.status === 'Active' ? 'bg-success' :
                              loan.status === 'Overdue' ? 'bg-danger' :
                              loan.status === 'Pending' ? 'bg-warning' :
                              loan.status === 'Fully Paid' ? 'bg-info' :
                              'bg-secondary'
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                          <td>{loan.disbursement_date || 'Pending'}</td>
                          {isAdmin && (
                            <>
                              <td>
                                {loan.created_by?.full_name || loan.created_by?.username || 'Unknown'}
                              </td>
                              <td>{loan.created_by?.branch || 'N/A'}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reports.length === 0 && (
                    <div className="alert alert-info text-center">
                      No loans found matching the selected criteria.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;