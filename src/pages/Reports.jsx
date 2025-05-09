import React, { useState, useContext } from 'react';
import { AlertContext } from '../context/AlertContext';
import Layout from '../components/Layout';

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  const { setAlert } = useContext(AlertContext);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!reportType || !dateFrom || !dateTo) {
      setAlert({
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      return;
    }
    
    // Implementation for generating and downloading a report
    console.log(`Generate ${reportType} report from ${dateFrom} to ${dateTo} in ${reportFormat} format`);
    setAlert({
      type: 'success',
      message: 'Report generated successfully. Downloading now...'
    });
    
    // In a real application, you would call an API endpoint to generate the report
    // const response = await api.generateReport(reportType, dateFrom, dateTo, reportFormat);
    // window.location.href = response.downloadUrl;
  };

  return (
    <Layout>
      <div className="container">
        <div className="main-content">
          <div className="sidebar">
            <h3>Quick Actions</h3>
            <ul>
              <li><a href="/">Dashboard</a></li>
              <li><a href="/loans/new">New Loan</a></li>
              <li><a href="/clients/new">New Client</a></li>
              <li><a href="/disbursements">Disbursements</a></li>
              <li><a href="/repayments">Repayments</a></li>
              <li><a href="/reports" className="active">Generate Reports</a></li>
            </ul>
          </div>
          
          <div className="content">
            <div id="alert-container"></div>
            <h2>Generate Reports</h2>
            
            <form id="report-form" onSubmit={handleSubmit}>
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
              
              <button type="submit" className="btn btn-primary">Generate Report</button>
            </form>
            
            <div id="report-preview" className="report-preview">
              {/* Report preview will be shown here */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;