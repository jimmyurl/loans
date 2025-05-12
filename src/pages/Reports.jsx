// src/pages/Reports.jsx
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Reports = () => {
  const navigate = useNavigate();
  const { supabase, user } = useContext(AuthContext);
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // New state for reports list
  const [reports, setReports] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user role and reports on component mount
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // TODO: Implement proper role checking 
      // This is a placeholder - replace with actual role verification
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        setIsAdmin(userData.role === 'admin');
      } catch (err) {
        console.error('Error checking user role:', err);
        setError('Failed to verify user role');
      }
    };

    checkUserRole();
  }, [user, navigate, supabase]);

  // Fetch reports based on user role
  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;

      try {
        setLoading(true);
        let query = supabase.from('reports').select('*');

        // If not an admin, filter reports by current user
        if (!isAdmin) {
          query = query.eq('created_by', user.id);
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

    fetchReports();
  }, [user, isAdmin, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportType || !dateFrom || !dateTo) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Insert report generation record
      const { data, error } = await supabase
        .from('reports')
        .insert({
          report_type: reportType,
          date_from: dateFrom,
          date_to: dateTo,
          format: reportFormat,
          created_by: user.id,
          status: 'pending' // You might want to handle report generation asynchronously
        })
        .select();

      if (error) throw error;
      
      // In a real application, you would trigger report generation 
      // through a backend service or background job
      console.log('Report record created:', data);
      
      setSuccess('Report request submitted successfully.');
      
      // Refresh reports list
      const updatedReports = await supabase
        .from('reports')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      setReports(updatedReports.data || []);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to download a generated report
  const downloadReport = async (reportId) => {
    try {
      // TODO: Implement actual report download logic
      // This would typically involve calling a backend endpoint
      // that generates and returns the report file
      console.log(`Downloading report ${reportId}`);
      
      // Update report status
      await supabase
        .from('reports')
        .update({ status: 'downloaded' })
        .eq('id', reportId);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report');
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Generate Reports</h2>
          </div>
          
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
            <div className="form-group">
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
                <option value="client">Client Report</option>
                <option value="overdue">Overdue Loans</option>
              </select>
            </div>
            
            <div className="form-group">
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
            
            <div className="form-group">
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
            
            <div className="form-group">
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
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </form>
        </div>
        
        <div className="col-md-6">
          <h3>Generated Reports</h3>
          {loading ? (
            <p>Loading reports...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date Range</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.report_type}</td>
                    <td>{`${report.date_from} to ${report.date_to}`}</td>
                    <td>{report.format}</td>
                    <td>{report.status}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => downloadReport(report.id)}
                        disabled={report.status !== 'completed'}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;