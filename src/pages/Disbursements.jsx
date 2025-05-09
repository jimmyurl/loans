// src/pages/Disbursements.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Disbursements = () => {
  const navigate = useNavigate();
  const { supabase } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('pending-disbursements');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDisbursements, setPendingDisbursements] = useState([]);
  const [recentDisbursements, setRecentDisbursements] = useState([]);
  const [pendingFilter, setPendingFilter] = useState('all');
  const [recentFilter, setRecentFilter] = useState('month');
  const [searchPending, setSearchPending] = useState('');
  const [searchRecent, setSearchRecent] = useState('');
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [disbursementMethod, setDisbursementMethod] = useState('');

  // Form fields for disbursement
  const [disbursementDate, setDisbursementDate] = useState('');
  const [disbursementNotes, setDisbursementNotes] = useState('');
  
  // Bank transfer details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  
  // Mobile money details
  const [mobileProvider, setMobileProvider] = useState('mpesa');
  const [mobileNumber, setMobileNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  // Check details
  const [checkNumber, setCheckNumber] = useState('');
  const [checkDate, setCheckDate] = useState('');
  const [bankDrawn, setBankDrawn] = useState('');

  // Receipt details
  const [receiptDetails, setReceiptDetails] = useState({
    receiptNumber: '',
    date: '',
    loanId: '',
    clientName: '',
    amount: '',
    method: '',
    reference: '',
    officer: ''
  });

  useEffect(() => {
    fetchDisbursements();
  }, [pendingFilter, recentFilter]);

  const fetchDisbursements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - in a real app, you would fetch from your API/database
      const pendingData = [
        {
          id: 'L-2025-042',
          clientName: 'Maria Josephat',
          amount: 1200000,
          approvalDate: '2025-05-02',
          loanTerm: '12 Months',
          status: 'Approved'
        },
        {
          id: 'L-2025-043',
          clientName: 'Emmanuel Peter',
          amount: 800000,
          approvalDate: '2025-05-03',
          loanTerm: '6 Months',
          status: 'Approved'
        }
      ];
      
      const recentData = [
        {
          id: 'L-2025-040',
          clientName: 'Sarah Mbwana',
          amount: 500000,
          disbursementDate: '2025-05-01',
          disbursedBy: 'John Makori',
          method: 'Mobile Money'
        },
        {
          id: 'L-2025-041',
          clientName: 'Thomas Kimaro',
          amount: 2000000,
          disbursementDate: '2025-05-01',
          disbursedBy: 'John Makori',
          method: 'Bank Transfer'
        }
      ];
      
      setPendingDisbursements(pendingData);
      setRecentDisbursements(recentData);
    } catch (err) {
      console.error('Error fetching disbursements:', err);
      setError('Failed to load disbursements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDisburseLoan = (loanId) => {
    const loan = pendingDisbursements.find(loan => loan.id === loanId);
    setSelectedLoan(loan);
    setDisbursementDate(new Date().toISOString().split('T')[0]); // Set current date as default
    setShowDisbursementModal(true);
  };

  const handleViewReceipt = (loanId) => {
    const loan = recentDisbursements.find(loan => loan.id === loanId);
    
    setReceiptDetails({
      receiptNumber: `R-${Date.now().toString().slice(-6)}`,
      date: loan.disbursementDate,
      loanId: loan.id,
      clientName: loan.clientName,
      amount: formatCurrency(loan.amount),
      method: loan.method,
      reference: 'TX-123456', // Mock data
      officer: loan.disbursedBy
    });
    
    setShowReceiptModal(true);
  };

  const handleDisbursementMethodChange = (e) => {
    setDisbursementMethod(e.target.value);
  };

  const handlePendingFilterChange = (e) => {
    setPendingFilter(e.target.value);
  };
  
  const handleRecentFilterChange = (e) => {
    setRecentFilter(e.target.value);
  };

  const handleProcessDisbursement = (e) => {
    e.preventDefault();
    console.log('Processing disbursement for:', selectedLoan.id);
    // Implement actual disbursement logic here
    
    // Close modal after processing
    setShowDisbursementModal(false);
    
    // Reset form values
    setDisbursementMethod('');
    setDisbursementDate('');
    setDisbursementNotes('');
    setBankName('');
    setAccountNumber('');
    setReferenceNumber('');
    setMobileProvider('mpesa');
    setMobileNumber('');
    setTransactionId('');
    setCheckNumber('');
    setCheckDate('');
    setBankDrawn('');
  };

  const closeModal = () => {
    setShowDisbursementModal(false);
    setShowReceiptModal(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Loan Disbursements</h2>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'pending-disbursements' ? 'active' : ''}`} 
          onClick={() => handleTabChange('pending-disbursements')}
        >
          Pending Disbursements
        </button>
        <button 
          className={`tab-button ${activeTab === 'recent-disbursements' ? 'active' : ''}`} 
          onClick={() => handleTabChange('recent-disbursements')}
        >
          Recent Disbursements
        </button>
      </div>
      
      {activeTab === 'pending-disbursements' && (
        <div id="pending-disbursements" className="subtab-content active">
          <div className="action-bar">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search by client name or loan ID"
                value={searchPending}
                onChange={(e) => setSearchPending(e.target.value)}
              />
              <button>Search</button>
            </div>
            <div className="filter-options">
              <select 
                value={pendingFilter} 
                onChange={handlePendingFilterChange}
              >
                <option value="all">All Pending Loans</option>
                <option value="today">Today's Approvals</option>
                <option value="week">This Week's Approvals</option>
              </select>
            </div>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Client Name</th>
                  <th>Amount (TZS)</th>
                  <th>Approval Date</th>
                  <th>Loan Term</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem 0' }}>
                      Loading disbursements...
                    </td>
                  </tr>
                ) : pendingDisbursements.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem 0' }}>
                      No pending disbursements found.
                    </td>
                  </tr>
                ) : (
                  pendingDisbursements.map(loan => (
                    <tr key={loan.id}>
                      <td>{loan.id}</td>
                      <td>{loan.clientName}</td>
                      <td>{formatCurrency(loan.amount)}</td>
                      <td>{formatDate(loan.approvalDate)}</td>
                      <td>{loan.loanTerm}</td>
                      <td><span className="status-tag pending">{loan.status}</span></td>
                      <td>
                        <button 
                          className="action-button disburse-button"
                          onClick={() => handleDisburseLoan(loan.id)}
                        >
                          Disburse
                        </button>
                        <button className="action-button view-button">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'recent-disbursements' && (
        <div id="recent-disbursements" className="subtab-content">
          <div className="action-bar">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search by client name or loan ID"
                value={searchRecent}
                onChange={(e) => setSearchRecent(e.target.value)}
              />
              <button>Search</button>
            </div>
            <div className="filter-options">
              <select 
                value={recentFilter} 
                onChange={handleRecentFilterChange}
              >
                <option value="all">All Disbursements</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <button className="secondary-button">Export to Excel</button>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Client Name</th>
                  <th>Amount (TZS)</th>
                  <th>Disbursement Date</th>
                  <th>Disbursed By</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem 0' }}>
                      Loading disbursements...
                    </td>
                  </tr>
                ) : recentDisbursements.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem 0' }}>
                      No recent disbursements found.
                    </td>
                  </tr>
                ) : (
                  recentDisbursements.map(loan => (
                    <tr key={loan.id}>
                      <td>{loan.id}</td>
                      <td>{loan.clientName}</td>
                      <td>{formatCurrency(loan.amount)}</td>
                      <td>{formatDate(loan.disbursementDate)}</td>
                      <td>{loan.disbursedBy}</td>
                      <td>{loan.method}</td>
                      <td>
                        <button className="action-button view-button">View</button>
                        <button 
                          className="action-button print-button"
                          onClick={() => handleViewReceipt(loan.id)}
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Disbursement Modal */}
      {showDisbursementModal && selectedLoan && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <h3>Process Loan Disbursement</h3>
            
            <div className="loan-summary">
              <div className="summary-item">
                <span className="summary-label">Client:</span>
                <span className="summary-value">{selectedLoan.clientName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Loan ID:</span>
                <span className="summary-value">{selectedLoan.id}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Amount:</span>
                <span className="summary-value">{formatCurrency(selectedLoan.amount)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Term:</span>
                <span className="summary-value">{selectedLoan.loanTerm}</span>
              </div>
            </div>
            
            <form id="disbursement-form" onSubmit={handleProcessDisbursement}>
              <div className="form-group">
                <label htmlFor="disbursement-date">Disbursement Date:</label>
                <input 
                  type="date" 
                  id="disbursement-date" 
                  value={disbursementDate}
                  onChange={(e) => setDisbursementDate(e.target.value)}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="disbursement-method">Disbursement Method:</label>
                <select 
                  id="disbursement-method" 
                  value={disbursementMethod}
                  onChange={handleDisbursementMethodChange}
                  required
                >
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="check">Check</option>
                </select>
              </div>
              
              {disbursementMethod === 'bank_transfer' && (
                <div className="form-group payment-details">
                  <label htmlFor="bank-name">Bank Name:</label>
                  <input 
                    type="text" 
                    id="bank-name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                  
                  <label htmlFor="account-number">Account Number:</label>
                  <input 
                    type="text" 
                    id="account-number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                  
                  <label htmlFor="reference-number">Reference Number:</label>
                  <input 
                    type="text" 
                    id="reference-number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>
              )}
              
              {disbursementMethod === 'mobile_money' && (
                <div className="form-group payment-details">
                  <label htmlFor="mobile-provider">Mobile Provider:</label>
                  <select 
                    id="mobile-provider"
                    value={mobileProvider}
                    onChange={(e) => setMobileProvider(e.target.value)}
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="tigopesa">Tigo Pesa</option>
                    <option value="airtelmoney">Airtel Money</option>
                  </select>
                  
                  <label htmlFor="mobile-number">Mobile Number:</label>
                  <input 
                    type="tel" 
                    id="mobile-number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                  
                  <label htmlFor="transaction-id">Transaction ID:</label>
                  <input 
                    type="text" 
                    id="transaction-id"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              )}
              
              {disbursementMethod === 'check' && (
                <div className="form-group payment-details">
                  <label htmlFor="check-number">Check Number:</label>
                  <input 
                    type="text" 
                    id="check-number"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                  />
                  
                  <label htmlFor="check-date">Check Date:</label>
                  <input 
                    type="date" 
                    id="check-date"
                    value={checkDate}
                    onChange={(e) => setCheckDate(e.target.value)}
                  />
                  
                  <label htmlFor="bank-drawn">Bank Drawn On:</label>
                  <input 
                    type="text" 
                    id="bank-drawn"
                    value={bankDrawn}
                    onChange={(e) => setBankDrawn(e.target.value)}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="disbursement-notes">Notes:</label>
                <textarea 
                  id="disbursement-notes" 
                  rows="3"
                  value={disbursementNotes}
                  onChange={(e) => setDisbursementNotes(e.target.value)}
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="button secondary-button" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button primary-button"
                >
                  Process Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <h3>Disbursement Receipt</h3>
            
            <div id="receipt-content">
              <div className="receipt-header">
                <div className="company-logo">ASSE Microfinance</div>
                <div className="receipt-title">Loan Disbursement Receipt</div>
              </div>
              
              <div className="receipt-details">
                <div className="receipt-row">
                  <span className="receipt-label">Receipt No:</span>
                  <span className="receipt-value">{receiptDetails.receiptNumber}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Date:</span>
                  <span className="receipt-value">{formatDate(receiptDetails.date)}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Loan ID:</span>
                  <span className="receipt-value">{receiptDetails.loanId}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Client Name:</span>
                  <span className="receipt-value">{receiptDetails.clientName}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Amount:</span>
                  <span className="receipt-value">{receiptDetails.amount}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Disbursement Method:</span>
                  <span className="receipt-value">{receiptDetails.method}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Transaction Reference:</span>
                  <span className="receipt-value">{receiptDetails.reference}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Disbursed By:</span>
                  <span className="receipt-value">{receiptDetails.officer}</span>
                </div>
              </div>
              
              <div className="receipt-signatures">
                <div className="signature-block">
                  <div className="signature-line">________________</div>
                  <div className="signature-name">Officer Signature</div>
                </div>
                <div className="signature-block">
                  <div className="signature-line">________________</div>
                  <div className="signature-name">Client Signature</div>
                </div>
              </div>
              
              <div className="receipt-footer">
                <p>This is an electronic receipt. Thank you for working with ASSE Microfinance.</p>
              </div>
            </div>
            
            <div className="receipt-actions">
              <button className="button secondary-button">Download PDF</button>
              <button className="button primary-button">Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disbursements;