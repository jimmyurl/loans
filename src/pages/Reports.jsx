// src/pages/Reports.jsx
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Reports = () => {
  const navigate = useNavigate();
  const { supabase, session } = useContext(AuthContext);
  
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
  const [generatedReports, setGeneratedReports] = useState([]);
  
  // Dropdown Options
  const [branches, setBranches] = useState([]);

  // Get user from session
  const user = session?.user;

  // Fetch user profile and branches on component mount
  useEffect(() => {
    const fetchUserProfileAndBranches = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
        }

        const role = profileData?.role || 'loan_officer';
        setUserRole(role);
        setIsAdmin(role === 'admin');

        // Fetch branches for filtering
        const { data: branchData, error: branchError } = await supabase
          .from('system_branches')
          .select('branch_id, branch_name');

        if (branchError) {
          console.error('Branch error:', branchError);
        }

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
        
        let query = supabase
          .from('loans')
          .select(`
            *,
            client_id(
              id,
              first_name,
              last_name,
              phone_number,
              email
            )
          `);

        if (dateFrom && dateTo) {
          query = query.gte('created_at', dateFrom)
                       .lte('created_at', dateTo);
        }

        if (loanStatus) {
          query = query.eq('status', loanStatus);
        }

        if (selectedBranch && isAdmin) {
          query = query.eq('branch', selectedBranch);
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

  // Fetch generated reports
  useEffect(() => {
    const fetchGeneratedReports = async () => {
      if (!user) return;

      try {
        let query = supabase
          .from('generated_reports')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching generated reports:', error);
          return;
        }

        setGeneratedReports(data || []);
      } catch (err) {
        console.error('Error fetching generated reports:', err);
      }
    };

    fetchGeneratedReports();
  }, [user, supabase]);

  // Generate CSV content
  const generateCSV = (data, reportType) => {
    if (!data || data.length === 0) return '';

    const headers = [
      'Loan Number',
      'Client Name',
      'Phone Number',
      'Principal Amount (TZS)',
      'Interest Rate (%)',
      'Status',
      'Disbursement Date',
      'Created Date'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(loan => [
        loan.loan_number || '',
        formatClientName(loan.client_id),
        loan.client_id?.phone_number || '',
        loan.principal_amount || 0,
        loan.interest_rate || 0,
        loan.status || '',
        loan.disbursement_date ? new Date(loan.disbursement_date).toLocaleDateString() : '',
        loan.created_at ? new Date(loan.created_at).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    return csvContent;
  };

  // Generate report based on type
  const generateReportData = (data, reportType) => {
    switch (reportType) {
      case 'loan-summary':
        return {
          title: 'Loan Summary Report',
          data: data,
          summary: {
            totalLoans: data.length,
            totalPrincipal: data.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0),
            activeLoans: data.filter(loan => loan.status === 'Active').length,
            overdueLoans: data.filter(loan => loan.status === 'Overdue').length
          }
        };
      
      case 'disbursement':
        const disbursedLoans = data.filter(loan => loan.disbursement_date);
        return {
          title: 'Disbursement Report',
          data: disbursedLoans,
          summary: {
            totalDisbursements: disbursedLoans.length,
            totalAmount: disbursedLoans.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0)
          }
        };
      
      case 'overdue':
        const overdueLoans = data.filter(loan => loan.status === 'Overdue');
        return {
          title: 'Overdue Loans Report',
          data: overdueLoans,
          summary: {
            totalOverdue: overdueLoans.length,
            totalOverdueAmount: overdueLoans.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0)
          }
        };
      
      case 'portfolio':
        return {
          title: 'Portfolio Analysis Report',
          data: data,
          summary: {
            totalPortfolio: data.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0),
            statusBreakdown: {
              active: data.filter(loan => loan.status === 'Active').length,
              pending: data.filter(loan => loan.status === 'Pending').length,
              overdue: data.filter(loan => loan.status === 'Overdue').length,
              fullyPaid: data.filter(loan => loan.status === 'Fully Paid').length
            }
          }
        };
      
      default:
        return {
          title: 'General Report',
          data: data,
          summary: { totalRecords: data.length }
        };
    }
  };

  // Download CSV file
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate JSON report for PDF/Excel processing
  const generateJSONReport = (reportData) => {
    return JSON.stringify(reportData, null, 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportType || !dateFrom || !dateTo) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Get filtered data for the report
      let filteredData = [...reports];
      
      // Apply additional filters based on report type
      if (reportType === 'disbursement') {
        filteredData = filteredData.filter(loan => loan.disbursement_date);
      } else if (reportType === 'overdue') {
        filteredData = filteredData.filter(loan => loan.status === 'Overdue');
      } else if (reportType === 'repayment') {
        filteredData = filteredData.filter(loan => 
          loan.status === 'Fully Paid' || loan.status === 'Active'
        );
      }

      // Generate report data
      const reportData = generateReportData(filteredData, reportType);
      
      // Create filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportType}-report-${timestamp}`;

      // Handle different formats
      if (reportFormat === 'csv') {
        const csvContent = generateCSV(reportData.data, reportType);
        downloadCSV(csvContent, `${filename}.csv`);
      } else if (reportFormat === 'excel') {
        // For Excel, we'll generate CSV for now (you can enhance this with a library like xlsx)
        const csvContent = generateCSV(reportData.data, reportType);
        downloadCSV(csvContent, `${filename}.csv`);
        setSuccess('Report generated as CSV (Excel format requires additional setup)');
      } else if (reportFormat === 'pdf') {
        // For PDF, we'll generate JSON for now (you can enhance this with a library like jsPDF)
        const jsonReport = generateJSONReport(reportData);
        const blob = new Blob([jsonReport], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.json`;
        link.click();
        setSuccess('Report data generated as JSON (PDF format requires additional setup)');
      }

      // Save report metadata to database
      const reportMetadata = {
        report_type: reportType,
        date_from: dateFrom,
        date_to: dateTo,
        format: reportFormat,
        loan_status: loanStatus,
        branch: selectedBranch,
        created_by: user.id,
        status: 'completed',
        filename: `${filename}.${reportFormat === 'csv' ? 'csv' : reportFormat === 'excel' ? 'csv' : 'json'}`,
        record_count: reportData.data.length
      };

      // Insert report metadata
      const { error: insertError } = await supabase
        .from('generated_reports')
        .insert([reportMetadata]);

      if (insertError) {
        console.error('Error saving report metadata:', insertError);
      }

      // Refresh generated reports list
      const { data: updatedReports } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      setGeneratedReports(updatedReports || []);
      
      if (!success) {
        setSuccess(`Report generated successfully! ${reportData.data.length} records processed.`);
      }
      
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Utility function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-TZ').format(amount || 0);
  };

  // Format client name
  const formatClientName = (client) => {
    return client 
      ? `${client.first_name} ${client.last_name}` 
      : 'N/A';
  };

  // Show loading state if no user session
  if (!user) {
    return (
      <div className="container-fluid">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="content-title">Reports</h2>
      
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
                      <option value="csv">CSV</option>
                      <option value="excel">Excel (CSV)</option>
                      <option value="pdf">PDF (JSON)</option>
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

            {/* Generated Reports History */}
            <div className="card mt-3">
              <div className="card-header">
                <h4>Report History</h4>
              </div>
              <div className="card-body">
                {generatedReports.length === 0 ? (
                  <p className="text-muted">No reports generated yet.</p>
                ) : (
                  <div className="list-group">
                    {generatedReports.slice(0, 5).map((report) => (
                      <div key={report.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{report.report_type}</h6>
                            <p className="mb-1 text-muted small">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                            <small className="text-muted">
                              {report.record_count} records
                            </small>
                          </div>
                          <span className={`badge ${
                            report.status === 'completed' ? 'bg-success' : 
                            report.status === 'pending' ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                          <th>Principal (TZS)</th>
                          <th>Status</th>
                          <th>Disbursement Date</th>
                          <th>Created Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((loan) => (
                          <tr key={loan.id}>
                            <td>{loan.loan_number}</td>
                            <td>
                              {formatClientName(loan.client_id)}
                              {loan.client_id?.phone_number && (
                                <div className="text-muted small">
                                  {loan.client_id.phone_number}
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
                            <td>{loan.disbursement_date ? new Date(loan.disbursement_date).toLocaleDateString() : 'Pending'}</td>
                            <td>{loan.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A'}</td>
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
    </>
  );
};

export default Reports;