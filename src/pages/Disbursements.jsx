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
  const [isExporting, setIsExporting] = useState(false);

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

  // Cash details
  const [cashReceiptNumber, setCashReceiptNumber] = useState('');

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
          term_months,
          created_at
        `)
        .eq('status', 'Approved')
        .is('disbursement_date', null);
      
      if (pendingError) throw pendingError;
      
      // Initialize filteredPendingLoans with all pending loans first
      let filteredPendingLoans = [...pendingLoans];
      const now = new Date();
      
      // Then apply filters if needed
      if (pendingFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filteredPendingLoans = pendingLoans.filter(loan => 
          loan.created_at && loan.created_at.startsWith(today)
        );
      } else if (pendingFilter === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
        filteredPendingLoans = pendingLoans.filter(loan => 
          loan.created_at && loan.created_at >= weekAgo
        );
      }
  
      // Format pending loans data
      const formattedPending = filteredPendingLoans.map(loan => ({
        id: loan.loan_number,
        clientName: `${loan.clients.first_name} ${loan.clients.last_name}`,
        amount: loan.principal_amount,
        approvalDate: loan.created_at,  // Using created_at instead of approval_date
        loanTerm: `${loan.term_months} Months`,
        status: loan.status,
        loanId: loan.id
      }));
  
      setPendingDisbursements(formattedPending);
  
      // Rest of your function remains the same...
      // [Keep all the recent disbursements code here]
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

  const handleViewLoan = (loanId) => {
    // Navigate to loan details page
    navigate(`/loans/${loanId}`);
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
      officer: disbursement.disbursedBy,
      notes: disbursement.notes
    });
    
    setShowReceiptModal(true);
  };

  const handleDisbursementMethodChange = (e) => {
    setDisbursementMethod(e.target.value);
    
    // Reset all method-specific fields when changing methods
    setBankName('');
    setAccountNumber('');
    setReferenceNumber('');
    setMobileNumber('');
    setTransactionId('');
    setCheckNumber('');
    setCheckDate('');
    setBankDrawn('');
    setCashReceiptNumber('');
  };

  const handlePendingFilterChange = (e) => {
    setPendingFilter(e.target.value);
  };
  
  const handleRecentFilterChange = (e) => {
    setRecentFilter(e.target.value);
  };

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // In a real application, this would generate an Excel file
      // For this example, we'll just simulate the export process
      
      setTimeout(() => {
        alert('Disbursements data exported successfully!');
        setIsExporting(false);
      }, 1500);
      
      // In a real implementation, you'd use a library like xlsx or exceljs
      // Example with xlsx:
      // import * as XLSX from 'xlsx';
      // const worksheet = XLSX.utils.json_to_sheet(recentDisbursements);
      // const workbook = XLSX.utils.book_new();
      // XLSX.utils.book_append_sheet(workbook, worksheet, "Disbursements");
      // XLSX.writeFile(workbook, "Disbursements_Report.xlsx");
      
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(`Failed to export data: ${err.message}`);
      setIsExporting(false);
    }
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
        processed_by: user.id,
        processed_at: new Date().toISOString()
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
      } else if (disbursementMethod === 'cash') {
        if (!cashReceiptNumber) {
          throw new Error('Please enter a cash receipt number');
        }
        disbursementData.transaction_reference = cashReceiptNumber;
        disbursementData.notes = `Cash Receipt #: ${cashReceiptNumber}\n${disbursementNotes}`;
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
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'alert alert-success';
      successMessage.textContent = 'Loan disbursed successfully!';
      document.getElementById('disbursements-section').prepend(successMessage);
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 3000);
      
      // Show receipt
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
    setCashReceiptNumber('');
  };

  const filteredPending = pendingDisbursements.filter(loan => {
    const matchesSearch = loan.clientName.toLowerCase().includes(searchPending.toLowerCase()) || 
                         loan.id.toLowerCase().includes(searchPending.toLowerCase());
    return matchesSearch;
  });

  const filteredRecent = recentDisbursements.filter(disbursement => {
    const matchesSearch = disbursement.clientName.toLowerCase().includes(searchRecent.toLowerCase()) || 
                         disbursement.id.toLowerCase().includes(searchRecent.toLowerCase()) ||
                         (disbursement.transactionReference && 
                          disbursement.transactionReference.toLowerCase().includes(searchRecent.toLowerCase()));
    return matchesSearch;
  });

  // Handle print receipt
  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Disbursement Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ddd;
              padding: 20px;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
            }
            .company-logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .receipt-title {
              font-size: 18px;
              text-transform: uppercase;
            }
            .receipt-details {
              margin-bottom: 30px;
            }
            .receipt-row {
              display: flex;
              margin-bottom: 10px;
            }
            .receipt-label {
              font-weight: bold;
              width: 180px;
              flex-shrink: 0;
            }
            .receipt-value {
              flex-grow: 1;
            }
            .receipt-footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .signatures {
              margin-top: 70px;
              display: flex;
              justify-content: space-between;
            }
            .signature-line {
              width: 45%;
              border-top: 1px solid #333;
              padding-top: 5px;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <div class="company-logo">ASSE Microfinance</div>
              <div class="receipt-title">Loan Disbursement Receipt</div>
            </div>
            
            <div class="receipt-details">
              <div class="receipt-row">
                <span class="receipt-label">Receipt No:</span>
                <span class="receipt-value">${receiptDetails.receiptNumber}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Date:</span>
                <span class="receipt-value">${formatDate(receiptDetails.date)}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Loan ID:</span>
                <span class="receipt-value">${receiptDetails.loanId}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Client Name:</span>
                <span class="receipt-value">${receiptDetails.clientName}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Amount:</span>
                <span class="receipt-value">${receiptDetails.amount}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Disbursement Method:</span>
                <span class="receipt-value">${receiptDetails.method.replace('_', ' ')}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Transaction Reference:</span>
                <span class="receipt-value">${receiptDetails.reference}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Disbursed By:</span>
                <span class="receipt-value">${receiptDetails.officer}</span>
              </div>
              ${receiptDetails.notes ? `
              <div class="receipt-row">
                <span class="receipt-label">Notes:</span>
                <span class="receipt-value">${receiptDetails.notes}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="signatures">
              <div class="signature-line">Client Signature</div>
              <div class="signature-line">Officer Signature</div>
            </div>
            
            <div class="receipt-footer">
              <p>This is an official receipt for the disbursement of loan funds.</p>
              <p>ASSE Microfinance | P.O. Box 12345, Dar es Salaam, Tanzania | info@assemicrofinance.co.tz</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Print Receipt</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.open();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Automatically trigger print after content loads
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      };
    }
  };

  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="content">
      <div id="disbursements-section" className="tab-content active">
        <h2>Loan Disbursements</h2>
        
        {error && (
          <div id="alert-container" className="alert alert-error">
            {error}
            <span className="close-alert" onClick={dismissError}>&times;</span>
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
              <div className="pending-count">
                <span>{filteredPending.length} loans pending disbursement</span>
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
                            <button 
                              className="action-button view-button"
                              onClick={() => handleViewLoan(loan.loanId)}
                            >
                              View
                            </button>
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
                  placeholder="Search by client name, loan ID or reference"
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
              <button 
                id="export-disbursements" 
                className="secondary-button"
                onClick={handleExportToExcel}
                disabled={isExporting || filteredRecent.length === 0}
              >
                {isExporting ? 'Exporting...' : 'Export to Excel'}
              </button>
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
                      <th>Reference</th>
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
                          <td>{disbursement.transactionReference || 'N/A'}</td>
                          <td>
                            <button 
                              className="action-button view-button"
                              onClick={() => handleViewLoan(disbursement.id)}
                            >
                              View
                            </button>
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
                        <td colSpan="8" className="text-center">No recent disbursements found</td>
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
              </div>
              
              <form id="disbursement-form" onSubmit={handleProcessDisbursement}>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                  <label htmlFor="disbursement-date">Disbursement Date:</label>
                  <input 
                    type="date" 
                    id="disbursement-date" 
                    required
                    value={disbursementDate}
                    onChange={(e) => setDisbursementDate(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="disbursement-method">Disbursement Method:</label>
                  <select 
                    id="disbursement-method" 
                    required
                    value={disbursementMethod}
                    onChange={handleDisbursementMethodChange}
                  >
                    <option value="">Select Method</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                
                {/* Bank Transfer Fields */}
                {disbursementMethod === 'bank_transfer' && (
                  <div className="method-fields">
                    <div className="form-group">
                      <label htmlFor="bank-name">Bank Name:</label>
                      <input 
                        type="text" 
                        id="bank-name" 
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="account-number">Account Number:</label>
                      <input 
                        type="text" 
                        id="account-number" 
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="reference-number">Reference Number:</label>
                      <input 
                        type="text" 
                        id="reference-number" 
                        required
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                {/* Mobile Money Fields */}
                {disbursementMethod === 'mobile_money' && (
                  <div className="method-fields">
                    <div className="form-group">
                      <label htmlFor="mobile-provider">Provider:</label>
                      <select 
                        id="mobile-provider" 
                        required
                        value={mobileProvider}
                        onChange={(e) => setMobileProvider(e.target.value)}
                      >
                        <option value="mpesa">M-Pesa</option>
                        <option value="tigopesa">Tigo Pesa</option>
                        <option value="airtelmoney">Airtel Money</option>
                        <option value="halotel">Halotel Money</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="mobile-number">Mobile Number:</label>
                      <input 
                        type="text" 
                        id="mobile-number" 
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="e.g. 255712345678"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="transaction-id">Transaction ID:</label>
                      <input 
                        type="text" 
                        id="transaction-id" 
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                {/* Check Fields */}
                {disbursementMethod === 'check' && (
                  <div className="method-fields">
                    <div className="form-group">
                      <label htmlFor="check-number">Check Number:</label>
                      <input 
                        type="text" 
                        id="check-number" 
                        required
                        value={checkNumber}
                        onChange={(e) => setCheckNumber(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="check-date">Check Date:</label>
                      <input 
                        type="date" 
                        id="check-date" 
                        required
                        value={checkDate}
                        onChange={(e) => setCheckDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="bank-drawn">Bank Drawn:</label>
                      <input 
                        type="text" 
                        id="bank-drawn" 
                        required
                        value={bankDrawn}
                        onChange={(e) => setBankDrawn(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                {/* Cash Fields */}
                {disbursementMethod === 'cash' && (
                  <div className="method-fields">
                    <div className="form-group">
                      <label htmlFor="cash-receipt">Receipt Number:</label>
                      <input 
                        type="text" 
                        id="cash-receipt" 
                        required
                        value={cashReceiptNumber}
                        onChange={(e) => setCashReceiptNumber(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="disbursement-notes">Notes:</label>
                  <textarea 
                    id="disbursement-notes"
                    value={disbursementNotes}
                    onChange={(e) => setDisbursementNotes(e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="button-group">
                  <button type="button" className="cancel-button" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="submit-button" disabled={loading}>
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
              
              <div className="receipt-container">
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
                    <span className="receipt-value">{receiptDetails.method.replace('_', ' ')}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Transaction Reference:</span>
                    <span className="receipt-value">{receiptDetails.reference}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Disbursed By:</span>
                    <span className="receipt-value">{receiptDetails.officer}</span>
                  </div>
                  {receiptDetails.notes && (
                    <div className="receipt-row">
                      <span className="receipt-label">Notes:</span>
                      <span className="receipt-value">{receiptDetails.notes}</span>
                    </div>
                  )}
                </div>
                
                <div className="button-group">
                  <button className="secondary-button" onClick={printReceipt}>Print Receipt</button>
                  <button className="cancel-button" onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Disbursements;