import React, { useState, useEffect } from 'react';

const Repayments = () => {
  const [activeTab, setActiveTab] = useState('due-repayments');
  const [activeSubTab, setActiveSubTab] = useState('due-repayments');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('standard');
  const [messageText, setMessageText] = useState('');

  // Form values
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentAmount: '',
    paymentMethod: '',
    bankName: '',
    accountNumber: '',
    referenceNumber: '',
    mobileProvider: 'mpesa',
    mobileNumber: '',
    transactionId: '',
    checkNumber: '',
    checkDate: '',
    bankDrawn: '',
    notes: ''
  });

  // Mock data
  const dueRepayments = [
    {
      id: 'L-2025-038',
      clientName: 'Grace Mwangi',
      dueDate: '05-05-2025',
      installmentAmount: '120,000',
      outstandingBalance: '480,000',
      status: 'due',
      statusText: 'Due Today'
    },
    {
      id: 'L-2025-039',
      clientName: 'John Ochieng',
      dueDate: '05-05-2025',
      installmentAmount: '150,000',
      outstandingBalance: '750,000',
      status: 'due',
      statusText: 'Due Today'
    }
  ];

  const recentRepayments = [
    {
      id: 'L-2025-035',
      clientName: 'Faith Wambui',
      paymentDate: '04-05-2025',
      amountPaid: '100,000',
      paymentMethod: 'Mobile Money',
      collectedBy: 'Sarah Okello'
    },
    {
      id: 'L-2025-037',
      clientName: 'Daniel Mwenda',
      paymentDate: '03-05-2025',
      amountPaid: '200,000',
      paymentMethod: 'Cash',
      collectedBy: 'John Makori'
    }
  ];

  const overdueRepayments = [
    {
      id: 'L-2025-032',
      clientName: 'Patrick Ngigi',
      dueDate: '28-04-2025',
      daysOverdue: 7,
      amountDue: '150,000',
      penalty: '7,500'
    },
    {
      id: 'L-2025-030',
      clientName: 'Beatrice Auma',
      dueDate: '20-04-2025',
      daysOverdue: 15,
      amountDue: '180,000',
      penalty: '27,000'
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveSubTab(tabId);
  };

  const handleCollectPayment = (repayment) => {
    setSelectedRepayment(repayment);
    setPaymentForm(prev => ({
      ...prev,
      paymentAmount: repayment.installmentAmount || repayment.amountDue || ''
    }));
    setShowPaymentModal(true);
  };

  const handleViewReceipt = (repayment) => {
    setSelectedRepayment(repayment);
    setShowReceiptModal(true);
  };

  const handleSendSms = (repayment) => {
    setSelectedRepayment(repayment);
    const defaultMessage = `Dear ${repayment.clientName}, your loan payment of ${repayment.amountDue} is now ${repayment.daysOverdue} days overdue. Please make payment as soon as possible to avoid additional penalties. ASSE Microfinance.`;
    setMessageText(defaultMessage);
    setShowSmsModal(true);
  };

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    setPaymentForm(prev => ({ ...prev, paymentMethod: method }));
  };

  const handleMessageTemplateChange = (e) => {
    const template = e.target.value;
    setMessageTemplate(template);
    
    let templateText = '';
    
    if (template === 'gentle') {
      templateText = `Dear ${selectedRepayment?.clientName}, this is a friendly reminder that your loan payment of ${selectedRepayment?.amountDue} was due on ${selectedRepayment?.dueDate}. Please contact us if you need assistance. ASSE Microfinance.`;
    } else if (template === 'standard') {
      templateText = `Dear ${selectedRepayment?.clientName}, your loan payment of ${selectedRepayment?.amountDue} is now ${selectedRepayment?.daysOverdue} days overdue. Please make payment as soon as possible to avoid additional penalties. ASSE Microfinance.`;
    } else if (template === 'urgent') {
      templateText = `URGENT: Dear ${selectedRepayment?.clientName}, your loan payment of ${selectedRepayment?.amountDue} is ${selectedRepayment?.daysOverdue} days overdue. Please settle your account immediately to avoid further actions. Contact us at 0712462029. ASSE Microfinance.`;
    }
    
    setMessageText(templateText);
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    console.log('Processing payment:', paymentForm);
    setShowPaymentModal(false);
  };

  const handleSendSmsSubmit = (e) => {
    e.preventDefault();
    console.log('Sending SMS:', { recipient: selectedRepayment.clientName, message: messageText });
    setShowSmsModal(false);
  };

  return (
    <div className="container">
      <div className="main-content">
        <div className="content">
          <div id="repayments-section" className="tab-content active">
            <h2>Loan Repayments</h2>
            <div id="alert-container"></div>
            
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeSubTab === 'due-repayments' ? 'active' : ''}`} 
                onClick={() => handleTabChange('due-repayments')}
                data-tab="due-repayments"
              >
                Due Repayments
              </button>
              <button 
                className={`tab-button ${activeSubTab === 'recent-repayments' ? 'active' : ''}`}
                onClick={() => handleTabChange('recent-repayments')}
                data-tab="recent-repayments"
              >
                Recent Repayments
              </button>
              <button 
                className={`tab-button ${activeSubTab === 'overdue-repayments' ? 'active' : ''}`}
                onClick={() => handleTabChange('overdue-repayments')}
                data-tab="overdue-repayments"
              >
                Overdue Repayments
              </button>
            </div>
            
            {/* Due Repayments Tab */}
            <div id="due-repayments" className={`subtab-content ${activeSubTab === 'due-repayments' ? 'active' : ''}`}>
              <div className="action-bar">
                <div className="search-bar">
                  <input type="text" id="search-due" placeholder="Search by client name or loan ID" />
                  <button>Search</button>
                </div>
                <div className="filter-options">
                  <select id="filter-due">
                    <option value="all">All Due Repayments</option>
                    <option value="today" selected>Due Today</option>
                    <option value="week">Due This Week</option>
                    <option value="month">Due This Month</option>
                  </select>
                </div>
              </div>
              
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Loan ID</th>
                      <th>Client Name</th>
                      <th>Due Date</th>
                      <th>Installment Amount (TZS)</th>
                      <th>Outstanding Balance</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="due-repayments-body">
                    {dueRepayments.map((repayment) => (
                      <tr key={repayment.id}>
                        <td>{repayment.id}</td>
                        <td>{repayment.clientName}</td>
                        <td>{repayment.dueDate}</td>
                        <td>{repayment.installmentAmount}</td>
                        <td>{repayment.outstandingBalance}</td>
                        <td><span className="status-tag due">{repayment.statusText}</span></td>
                        <td>
                          <button 
                            className="action-button collect-button"
                            onClick={() => handleCollectPayment(repayment)}
                          >
                            Collect Payment
                          </button>
                          <button className="action-button view-button">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Recent Repayments Tab */}
            <div id="recent-repayments" className={`subtab-content ${activeSubTab === 'recent-repayments' ? 'active' : ''}`}>
              <div className="action-bar">
                <div className="search-bar">
                  <input type="text" id="search-recent" placeholder="Search by client name or loan ID" />
                  <button>Search</button>
                </div>
                <div className="filter-options">
                  <select id="filter-recent">
                    <option value="all">All Repayments</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month" selected>This Month</option>
                  </select>
                </div>
                <button id="export-repayments" className="secondary-button">Export to Excel</button>
              </div>
              
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Loan ID</th>
                      <th>Client Name</th>
                      <th>Payment Date</th>
                      <th>Amount Paid (TZS)</th>
                      <th>Payment Method</th>
                      <th>Collected By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="recent-repayments-body">
                    {recentRepayments.map((repayment) => (
                      <tr key={repayment.id}>
                        <td>{repayment.id}</td>
                        <td>{repayment.clientName}</td>
                        <td>{repayment.paymentDate}</td>
                        <td>{repayment.amountPaid}</td>
                        <td>{repayment.paymentMethod}</td>
                        <td>{repayment.collectedBy}</td>
                        <td>
                          <button className="action-button view-button">View</button>
                          <button 
                            className="action-button print-button"
                            onClick={() => handleViewReceipt(repayment)}
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Overdue Repayments Tab */}
            <div id="overdue-repayments" className={`subtab-content ${activeSubTab === 'overdue-repayments' ? 'active' : ''}`}>
              <div className="action-bar">
                <div className="search-bar">
                  <input type="text" id="search-overdue" placeholder="Search by client name or loan ID" />
                  <button>Search</button>
                </div>
                <div className="filter-options">
                  <select id="filter-overdue">
                    <option value="all">All Overdue</option>
                    <option value="1-7">1-7 Days</option>
                    <option value="8-30">8-30 Days</option>
                    <option value="30+">Over 30 Days</option>
                  </select>
                </div>
                <button id="generate-notices" className="secondary-button">Generate Notices</button>
              </div>
              
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Loan ID</th>
                      <th>Client Name</th>
                      <th>Due Date</th>
                      <th>Days Overdue</th>
                      <th>Amount Due (TZS)</th>
                      <th>Penalty (TZS)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="overdue-repayments-body">
                    {overdueRepayments.map((repayment) => (
                      <tr key={repayment.id}>
                        <td>{repayment.id}</td>
                        <td>{repayment.clientName}</td>
                        <td>{repayment.dueDate}</td>
                        <td>{repayment.daysOverdue}</td>
                        <td>{repayment.amountDue}</td>
                        <td>{repayment.penalty}</td>
                        <td>
                          <button 
                            className="action-button collect-button"
                            onClick={() => handleCollectPayment(repayment)}
                          >
                            Collect Payment
                          </button>
                          <button 
                            className="action-button message-button"
                            onClick={() => handleSendSms(repayment)}
                          >
                            Send SMS
                          </button>
                          <button className="action-button view-button">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Payment Collection Modal */}
            {showPaymentModal && (
              <div id="payment-modal" className="modal">
                <div className="modal-content">
                  <span className="close-modal" onClick={() => setShowPaymentModal(false)}>&times;</span>
                  <h3>Collect Loan Repayment</h3>
                  
                  <div className="loan-summary">
                    <div className="summary-item">
                      <span className="summary-label">Client:</span>
                      <span className="summary-value" id="modal-client-name">{selectedRepayment?.clientName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Loan ID:</span>
                      <span className="summary-value" id="modal-loan-id">{selectedRepayment?.id}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Amount Due:</span>
                      <span className="summary-value" id="modal-amount-due">{selectedRepayment?.installmentAmount || selectedRepayment?.amountDue}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Due Date:</span>
                      <span className="summary-value" id="modal-due-date">{selectedRepayment?.dueDate}</span>
                    </div>
                    {selectedRepayment?.penalty && (
                      <div className="summary-item">
                        <span className="summary-label">Penalties:</span>
                        <span className="summary-value" id="modal-penalties">{selectedRepayment?.penalty}</span>
                      </div>
                    )}
                    <div className="summary-item">
                      <span className="summary-label">Total Due:</span>
                      <span className="summary-value" id="modal-total-due">
                        {selectedRepayment?.penalty ? 
                          `${selectedRepayment.installmentAmount || selectedRepayment.amountDue} + ${selectedRepayment.penalty}` : 
                          selectedRepayment?.installmentAmount || selectedRepayment?.amountDue}
                      </span>
                    </div>
                  </div>
                  
                  <form id="payment-form" onSubmit={handleProcessPayment}>
                    <div className="form-group">
                      <label htmlFor="payment-date">Payment Date:</label>
                      <input 
                        type="date" 
                        id="payment-date" 
                        name="paymentDate"
                        value={paymentForm.paymentDate}
                        onChange={handlePaymentFormChange}
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="payment-amount">Amount Paid (TZS):</label>
                      <input 
                        type="number" 
                        id="payment-amount" 
                        name="paymentAmount"
                        value={paymentForm.paymentAmount}
                        onChange={handlePaymentFormChange}
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="payment-method">Payment Method:</label>
                      <select 
                        id="payment-method" 
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                        required
                      >
                        <option value="">Select Method</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="check">Check</option>
                      </select>
                    </div>
                    
                    {paymentMethod === 'bank_transfer' && (
                      <div className="form-group payment-details" id="bank-details">
                        <label htmlFor="bank-name">Bank Name:</label>
                        <input 
                          type="text" 
                          id="bank-name" 
                          name="bankName"
                          value={paymentForm.bankName}
                          onChange={handlePaymentFormChange}
                        />
                        
                        <label htmlFor="account-number">Account Number:</label>
                        <input 
                          type="text" 
                          id="account-number" 
                          name="accountNumber"
                          value={paymentForm.accountNumber}
                          onChange={handlePaymentFormChange}
                        />
                        
                        <label htmlFor="reference-number">Reference Number:</label>
                        <input 
                          type="text" 
                          id="reference-number" 
                          name="referenceNumber"
                          value={paymentForm.referenceNumber}
                          onChange={handlePaymentFormChange}
                        />
                      </div>
                    )}
                    
                    {paymentMethod === 'mobile_money' && (
                      <div className="form-group payment-details" id="mobile-details">
                        <label htmlFor="mobile-provider">Mobile Provider:</label>
                        <select 
                          id="mobile-provider" 
                          name="mobileProvider"
                          value={paymentForm.mobileProvider}
                          onChange={handlePaymentFormChange}
                        >
                          <option value="mpesa">M-Pesa</option>
                          <option value="tigopesa">Tigo Pesa</option>
                          <option value="airtelmoney">Airtel Money</option>
                        </select>
                        
                        <label htmlFor="mobile-number">Mobile Number:</label>
                        <input 
                          type="tel" 
                          id="mobile-number" 
                          name="mobileNumber"
                          value={paymentForm.mobileNumber}
                          onChange={handlePaymentFormChange}
                        />
                        
                        <label htmlFor="transaction-id">Transaction ID:</label>
                        <input 
                          type="text" 
                          id="transaction-id" 
                          name="transactionId"
                          value={paymentForm.transactionId}
                          onChange={handlePaymentFormChange}
                        />
                      </div>
                    )}
                    
                    {paymentMethod === 'check' && (
                      <div className="form-group payment-details" id="check-details">
                        <label htmlFor="check-number">Check Number:</label>
                        <input 
                          type="text" 
                          id="check-number" 
                          name="checkNumber"
                          value={paymentForm.checkNumber}
                          onChange={handlePaymentFormChange}
                        />
                        
                        <label htmlFor="check-date">Check Date:</label>
                        <input 
                          type="date" 
                          id="check-date" 
                          name="checkDate"
                          value={paymentForm.checkDate}
                          onChange={handlePaymentFormChange}
                        />
                        
                        <label htmlFor="bank-drawn">Bank Drawn On:</label>
                        <input 
                          type="text" 
                          id="bank-drawn" 
                          name="bankDrawn"
                          value={paymentForm.bankDrawn}
                          onChange={handlePaymentFormChange}
                        />
                      </div>
                    )}
                    
                    <div className="form-group">
                      <label htmlFor="payment-notes">Notes:</label>
                      <textarea 
                        id="payment-notes" 
                        rows="3" 
                        name="notes"
                        value={paymentForm.notes}
                        onChange={handlePaymentFormChange}
                      ></textarea>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="button secondary-button" 
                        id="cancel-payment"
                        onClick={() => setShowPaymentModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="button primary-button" 
                        id="process-payment"
                      >
                        Process Payment
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
                  <span className="close-modal" onClick={() => setShowReceiptModal(false)}>&times;</span>
                  <h3>Payment Receipt</h3>
                  
                  <div id="receipt-content">
                    <div className="receipt-header">
                      <div className="company-logo">ASSE Microfinance</div>
                      <div className="receipt-title">Loan Repayment Receipt</div>
                    </div>
                    
                    <div className="receipt-details">
                      <div className="receipt-row">
                        <span className="receipt-label">Receipt No:</span>
                        <span className="receipt-value" id="receipt-number">RCP-{selectedRepayment?.id}-{Math.floor(Math.random() * 1000)}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Date:</span>
                        <span className="receipt-value" id="receipt-date">{selectedRepayment?.paymentDate}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Loan ID:</span>
                        <span className="receipt-value" id="receipt-loan-id">{selectedRepayment?.id}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Client Name:</span>
                        <span className="receipt-value" id="receipt-client-name">{selectedRepayment?.clientName}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Amount Paid:</span>
                        <span className="receipt-value" id="receipt-amount">{selectedRepayment?.amountPaid}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Payment Method:</span>
                        <span className="receipt-value" id="receipt-method">{selectedRepayment?.paymentMethod}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Transaction Reference:</span>
                        <span className="receipt-value" id="receipt-reference">REF-{Math.floor(Math.random() * 10000)}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="receipt-label">Collected By:</span>
                        <span className="receipt-value" id="receipt-officer">{selectedRepayment?.collectedBy}</span>
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
                    <button className="button secondary-button" id="download-receipt">Download PDF</button>
                    <button 
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
            
            {/* SMS Modal */}
            {showSmsModal && (
              <div id="sms-modal" className="modal">
                <div className="modal-content">
                  <span className="close-modal" onClick={() => setShowSmsModal(false)}>&times;</span>
                  <h3>Send Payment Reminder</h3>
                  
                  <div className="client-info">
                    <div className="info-item">
                      <span className="info-label">Client:</span>
                      <span className="info-value" id="sms-client-name">{selectedRepayment?.clientName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value" id="sms-client-phone">+255 7XX XXX XXX</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Amount Due:</span>
                      <span className="info-value" id="sms-amount-due">{selectedRepayment?.amountDue}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Days Overdue:</span>
                      <span className="info-value" id="sms-days-overdue">{selectedRepayment?.daysOverdue}</span>
                    </div>
                  </div>
                  
                  <form id="sms-form" onSubmit={handleSendSmsSubmit}>
                    <div className="form-group">
                      <label htmlFor="message-template">Message Template:</label>
                      <select 
                        id="message-template" 
                        value={messageTemplate}
                        onChange={handleMessageTemplateChange}
                      >
                        <option value="gentle">Gentle Reminder</option>
                        <option value="standard" selected>Standard Reminder</option>
                        <option value="urgent">Urgent Reminder</option>
                        <option value="custom">Custom Message</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="message-text">Message:</label>
                      <textarea 
                        id="message-text" 
                        rows="5" 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                      ></textarea>
                      <div className="character-count">
                        <span id="character-count">{messageText.length}</span>/160 characters
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="button secondary-button" 
                        id="cancel-sms"
                        onClick={() => setShowSmsModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="button primary-button" 
                        id="send-sms"
                      >
                        Send SMS
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Repayments;