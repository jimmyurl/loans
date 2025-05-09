// src/pages/Reports.jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Reports = () => {
  const navigate = useNavigate();
  const { supabase } = useContext(AuthContext);
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportType || !dateFrom || !dateTo) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Implementation for generating and downloading a report
      console.log(`Generate ${reportType} report from ${dateFrom} to ${dateTo} in ${reportFormat} format`);
      
      // In a real application, you would call an API endpoint to generate the report
      // const response = await api.generateReport(reportType, dateFrom, dateTo, reportFormat);
      // window.location.href = response.downloadUrl;
      
      setSuccess('Report generated successfully. Downloading now...');
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Generate Reports</h2>
      </div>
      
      {error && (
        <div className="alert alert-error">
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
      
      <div className="report-preview">
        {/* Report preview will be shown here */}
      </div>
    </div>
  );
};

export default Reports;