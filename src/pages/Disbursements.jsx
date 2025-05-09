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
      
      // First, get all loan IDs that have disbursements
      const { data: disbursedLoans, error: disbursedError } = await supabase
        .from('loan_disbursements')
        .select('loan_id');
      
      if (disbursedError) throw disbursedError;
      
      const disbursedLoanIds = disbursedLoans.map(d => d.loan_id);
      
      // Fetch pending loans (loans with status 'Approved' and no disbursement_date)
      const { data: pendingLoans, error: pendingError } = await supabase
        .from('loans')
        .select(`
          id,
          loan_number,
          client_id,
          principal_amount,
          clients:client_id(first_name, last_name),
          status,
          disbursement_date,
          term_months
        `)
        .eq('status', 'Approved')
        .is('disbursement_date', null);
      
      if (pendingError) throw pendingError;
  
      // Format pending loans data
      const formattedPending = pendingLoans.map(loan => ({
        id: loan.loan_number,
        clientName: `${loan.clients.first_name} ${loan.clients.last_name}`,
        amount: loan.principal_amount,
        approvalDate: loan.disbursement_date,
        loanTerm: `${loan.term_months} Months`,
        status: loan.status,
        loanId: loan.id
      }));
  
      setPendingDisbursements(formattedPending);

      // Fetch recent disbursements based on filter
      let recentQuery = supabase
        .from('loan_disbursements')
        .select(`
          id,
          loan_id,
          amount,
          disbursement_date,
          method,
          transaction_reference,
          notes,
          processed_at,
          processed_by,
          loans:loan_id(loan_number, client_id, clients:client_id(first_name, last_name)),
          users:processed_by(email)
        `)
        .order('disbursement_date', { ascending: false });

      // Apply date filters
      const now = new Date();
      switch(recentFilter) {
        case 'today':
          recentQuery = recentQuery.gte('disbursement_date', now.toISOString().split('T')[0]);
          break;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          recentQuery = recentQuery.gte('disbursement_date', weekAgo.toISOString().split('T')[0]);
          break;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          recentQuery = recentQuery.gte('disbursement_date', monthAgo.toISOString().split('T')[0]);
          break;
        // 'all' case - no filter needed
      }

      const { data: recentData, error: recentError } = await recentQuery;

      if (recentError) throw recentError;

      // Format recent disbursements data
      const formattedRecent = recentData.map(disbursement => ({
        id: disbursement.loans?.loan_number || 'N/A',
        clientName: disbursement.loans?.clients 
          ? `${disbursement.loans.clients.first_name} ${disbursement.loans.clients.last_name}`
          : 'Unknown Client',
        amount: disbursement.amount,
        disbursementDate: disbursement.disbursement_date,
        disbursedBy: disbursement.users?.email ? disbursement.users.email.split('@')[0] : 'System',
        method: disbursement.method,
        transactionReference: disbursement.transaction_reference,
        disbursementId: disbursement.id
      }));

      setRecentDisbursements(formattedRecent);

    } catch (err) {
      console.error('Error fetching disbursements:', err);
      setError(`Failed to load disbursements: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
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
    if (!loan) return;
    
    setSelectedLoan(loan);
    setDisbursementDate(new Date().toISOString().split('T')[0]);
    setShowDisbursementModal(true);
  };

  const handleViewReceipt = (disbursementId) => {
    const disbursement = recentDisbursements.find(d => d.disbursementId === disbursementId);
    if (!disbursement) return;
    
    setReceiptDetails({
      receiptNumber: `R-${disbursementId.toString().padStart(6, '0')}`,
      date: disbursement.disbursementDate,
      loanId: disbursement.id,
      clientName: disbursement.clientName,
      amount: formatCurrency(disbursement.amount),
      method: disbursement.method,
      reference: disbursement.transactionReference || 'N/A',
      officer: disbursement.disbursedBy
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

  const handleProcessDisbursement = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const disbursementData = {
        loan_id: selectedLoan.loanId,
        amount: selectedLoan.amount,
        disbursement_date: disbursementDate,
        method: disbursementMethod,
        notes: disbursementNotes,
        processed_by: user.id
      };
      
      // Add method-specific details
      if (disbursementMethod === 'bank_transfer') {
        if (!bankName || !accountNumber || !referenceNumber) {
          throw new Error('Please fill all bank transfer details');
        }
        disbursementData.transaction_reference = referenceNumber;
        disbursementData.notes = `Bank: ${bankName}, Account: ${accountNumber}\n${disbursementNotes}`;
      } else if (disbursementMethod === 'mobile_money') {
        if (!mobileNumber || !transactionId) {
          throw new Error('Please fill all mobile money details');
        }
        disbursementData.transaction_reference = transactionId;
        disbursementData.notes = `Provider: ${mobileProvider}, Number: ${mobileNumber}\n${disbursementNotes}`;
      } else if (disbursementMethod === 'check') {
        if (!checkNumber || !checkDate || !bankDrawn) {
          throw new Error('Please fill all check details');
        }
        disbursementData.transaction_reference = checkNumber;
        disbursementData.notes = `Check #: ${checkNumber}, Bank: ${bankDrawn}, Date: ${checkDate}\n${disbursementNotes}`;
      } else {
        throw new Error('Please select a disbursement method');
      }
      
      // Update loan status to 'Active'
      const { error: loanError } = await supabase
        .from('loans')
        .update({ 
          status: 'Active',
          disbursement_date: disbursementDate
        })
        .eq('id', selectedLoan.loanId);
      
      if (loanError) throw loanError;
      
      // Create disbursement record
      const { data, error: disbursementError } = await supabase
        .from('loan_disbursements')
        .insert([disbursementData])
        .select();
      
      if (disbursementError) throw disbursementError;
      
      closeModal();
      await fetchDisbursements();
      handleViewReceipt(data[0].id);
      
    } catch (error) {
      console.error('Error processing disbursement:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowDisbursementModal(false);
    setShowReceiptModal(false);
    setError(null);
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

  const filteredPending = pendingDisbursements.filter(loan => {
    const matchesSearch = loan.clientName.toLowerCase().includes(searchPending.toLowerCase()) || 
                         loan.id.toLowerCase().includes(searchPending.toLowerCase());
    return matchesSearch;
  });

  const filteredRecent = recentDisbursements.filter(disbursement => {
    const matchesSearch = disbursement.clientName.toLowerCase().includes(searchRecent.toLowerCase()) || 
                         disbursement.id.toLowerCase().includes(searchRecent.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <header>
        <div className="container">
          <div className="logo">
            ASSE <span>Microfinance</span>
          </div>
          <nav>
            <ul>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/loans" className="active">Loans</a></li>
              <li><a href="/clients">Clients</a></li>
              <li><a href="/reports">Reports</a></li>
              <li><a href="/settings">Settings</a></li>
            </ul>
          </nav>
        </div>
      </header>
      
      <div className="container">
        <div className="main-content">
          <div className="sidebar">
            <h3>Quick Actions</h3>
            <ul>
              <li><a href="/dashboard" id="dashboard-link">Dashboard</a></li>
              <li><a href="/new-loan" id="new-loan-link">New Loan</a></li>
              <li><a href="/new-client" id="new-client-link">New Client</a></li>
              <li><a href="/disbursements" className="active" id="disbursement-link">Disbursements</a></li>
              <li><a href="/repayments" id="repayment-link">Repayments</a></li>
              <li><a href="/reports" id="reports-link">Generate Reports</a></li>
            </ul>
          </div>
          
          <div className="content">
            <div id="disbursements-section" className="tab-content active">
              <h2>Loan Disbursements</h2>
              
              {error && (
                <div id="alert-container" className="alert alert-error">
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
                        id="search-pending" 
                        placeholder="Search by client name or loan ID"
                        value={searchPending}
                        onChange={(e) => setSearchPending(e.target.value)}
                      />
                      <button>Search</button>
                    </div>
                    <div className="filter-options">
                      <select 
                        id="filter-pending"
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
                    {loading ? (
                      <div className="loading-spinner">Loading...</div>
                    ) : (
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
                        <tbody id="pending-disbursements-body">
                          {filteredPending.length > 0 ? (
                            filteredPending.map((loan) => (
                              <tr key={loan.id}>
                                <td>{loan.id}</td>
                                <td>{loan.clientName}</td>
                                <td>{formatCurrency(loan.amount)}</td>
                                <td>{formatDate(loan.approvalDate) || "Pending"}</td>
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
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center">No pending disbursements found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'recent-disbursements' && (
                <div id="recent-disbursements" className="subtab-content active">
                  <div className="action-bar">
                    <div className="search-bar">
                      <input 
                        type="text" 
                        id="search-recent" 
                        placeholder="Search by client name or loan ID"
                        value={searchRecent}
                        onChange={(e) => setSearchRecent(e.target.value)}
                      />
                      <button>Search</button>
                    </div>
                    <div className="filter-options">
                      <select 
                        id="filter-recent"
                        value={recentFilter}
                        onChange={handleRecentFilterChange}
                      >
                        <option value="all">All Disbursements</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                    <button id="export-disbursements" className="secondary-button">Export to Excel</button>
                  </div>
                  
                  <div className="table-responsive">
                    {loading ? (
                      <div className="loading-spinner">Loading...</div>
                    ) : (
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
                        <tbody id="recent-disbursements-body">
                          {filteredRecent.length > 0 ? (
                            filteredRecent.map((disbursement) => (
                              <tr key={disbursement.id}>
                                <td>{disbursement.id}</td>
                                <td>{disbursement.clientName}</td>
                                <td>{formatCurrency(disbursement.amount)}</td>
                                <td>{formatDate(disbursement.disbursementDate)}</td>
                                <td>{disbursement.disbursedBy}</td>
                                <td>{disbursement.method.replace('_', ' ')}</td>
                                <td>
                                  <button className="action-button view-button">View</button>
                                  <button 
                                    className="action-button print-button"
                                    onClick={() => handleViewReceipt(disbursement.disbursementId)}
                                  >
                                    Receipt
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center">No recent disbursements found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
              
              {/* Disbursement Modal */}
              {showDisbursementModal && selectedLoan && (
                <div id="disbursement-modal" className="modal">
                  <div className="modal-content">
                    <span className="close-modal" onClick={closeModal}>&times;</span>
                    <h3>Process Loan Disbursement</h3>
                    
                    <div className="loan-summary">
                      <div className="summary-item">
                        <span className="summary-label">Client:</span>
                        <span className="summary-value" id="modal-client-name">{selectedLoan.clientName}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Loan ID:</span>
                        <span className="summary-value" id="modal-loan-id">{selectedLoan.id}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Amount:</span>
                        <span className="summary-value" id="modal-loan-amount">{formatCurrency(selectedLoan.amount)}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Term:</span>
                        <span className="summary-value" id="modal-loan-term">{selectedLoan.loanTerm}</span>
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
                        <div className="form-group payment-details" id="bank-details">
                          <label htmlFor="bank-name">Bank Name:</label>
                          <input 
                            type="text" 
                            id="bank-name"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)} 
                            required
                          />
                          
                          <label htmlFor="account-number">Account Number:</label>
                          <input 
                            type="text" 
                            id="account-number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            required
                          />
                          
                          <label htmlFor="reference-number">Reference Number:</label>
                          <input 
                            type="text" 
                            id="reference-number"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            required
                          />
                        </div>
                      )}
                      
                      {disbursementMethod === 'mobile_money' && (
                        <div className="form-group payment-details" id="mobile-details">
                          <label htmlFor="mobile-provider">Mobile Provider:</label>
                          <select 
                            id="mobile-provider"
                            value={mobileProvider}
                            onChange={(e) => setMobileProvider(e.target.value)}
                            required
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
                            required
                          />
                          
                          <label htmlFor="transaction-id">Transaction ID:</label>
                          <input 
                            type="text" 
                            id="transaction-id"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            required
                          />
                        </div>
                      )}
                      
                      {disbursementMethod === 'check' && (
                        <div className="form-group payment-details" id="check-details">
                          <label htmlFor="check-number">Check Number:</label>
                          <input 
                            type="text" 
                            id="check-number"
                            value={checkNumber}
                            onChange={(e) => setCheckNumber(e.target.value)}
                            required
                          />
                          
                          <label htmlFor="check-date">Check Date:</label>
                          <input 
                            type="date" 
                            id="check-date"
                            value={checkDate}
                            onChange={(e) => setCheckDate(e.target.value)}
                            required
                          />
                          
                          <label htmlFor="bank-drawn">Bank Drawn On:</label>
                          <input 
                            type="text" 
                            id="bank-drawn"
                            value={bankDrawn}
                            onChange={(e) => setBankDrawn(e.target.value)}
                            required
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
                          id="cancel-disbursement"
                          onClick={closeModal}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="button primary-button" 
                          id="process-disbursement"
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Process Disbursement'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {/* Receipt Modal */}
              {showReceiptModal && (
                <div id="receipt-modal" className="modal">
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
                          <span className="receipt-value" id="receipt-number">{receiptDetails.receiptNumber}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Date:</span>
                          <span className="receipt-value" id="receipt-date">{formatDate(receiptDetails.date)}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Loan ID:</span>
                          <span className="receipt-value" id="receipt-loan-id">{receiptDetails.loanId}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Client Name:</span>
                          <span className="receipt-value" id="receipt-client-name">{receiptDetails.clientName}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Amount:</span>
                          <span className="receipt-value" id="receipt-amount">{receiptDetails.amount}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Disbursement Method:</span>
                          <span className="receipt-value" id="receipt-method">{receiptDetails.method.replace('_', ' ')}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Transaction Reference:</span>
                          <span className="receipt-value" id="receipt-reference">{receiptDetails.reference}</span>
                          </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Disbursed By:</span>
                          <span className="receipt-value" id="receipt-officer">{receiptDetails.officer}</span>
                        </div>
                      </div>
                      
                      <div className="receipt-footer">
                        <p>This is an official receipt for the disbursement of loan funds.</p>
                        <p>ASSE Microfinance | P.O. Box 12345, Dar es Salaam, Tanzania | info@assemicrofinance.co.tz</p>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="button secondary-button" 
                        id="close-receipt"
                        onClick={closeModal}
                      >
                        Close
                      </button>
                      <button 
                        type="button" 
                        className="button primary-button" 
                        id="print-receipt"
                        onClick={() => window.print()}
                      >
                        Print Receipt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Disbursements;