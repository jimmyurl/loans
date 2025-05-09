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
      
      // Fetch pending loans (loans with status 'Approved' but not disbursed)
      const { data: pendingLoans, error: pendingError } = await supabase
        .from('loans')
        .select(`
          id,
          loan_number,
          client_id,
          principal_amount,
          clients:client_id(first_name, last_name),
          status,
          approval_date,
          term_months
        `)
        .eq('status', 'Approved')
        .not('id', 'in', 
          supabase.from('loan_disbursements').select('loan_id')
        );

      if (pendingError) throw pendingError;

      // Format pending loans data
      const formattedPending = pendingLoans.map(loan => ({
        id: loan.loan_number,
        clientName: `${loan.clients.first_name} ${loan.clients.last_name}`,
        amount: loan.principal_amount,
        approvalDate: loan.approval_date,
        loanTerm: `${loan.term_months} Months`,
        status: loan.status,
        loanId: loan.id // Store the actual loan ID for disbursement
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
        id: disbursement.loans.loan_number,
        clientName: `${disbursement.loans.clients.first_name} ${disbursement.loans.clients.last_name}`,
        amount: disbursement.amount,
        disbursementDate: disbursement.disbursement_date,
        disbursedBy: disbursement.users.email.split('@')[0], // Just show username part
        method: disbursement.method,
        transactionReference: disbursement.transaction_reference,
        disbursementId: disbursement.id // Store disbursement ID for receipt
      }));

      setRecentDisbursements(formattedRecent);

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

  const handleViewReceipt = (disbursementId) => {
    const disbursement = recentDisbursements.find(d => d.disbursementId === disbursementId);
    
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
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare disbursement data
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
        disbursementData.transaction_reference = referenceNumber;
        disbursementData.notes = `Bank: ${bankName}, Account: ${accountNumber}\n${disbursementNotes}`;
      } else if (disbursementMethod === 'mobile_money') {
        disbursementData.transaction_reference = transactionId;
        disbursementData.notes = `Provider: ${mobileProvider}, Number: ${mobileNumber}\n${disbursementNotes}`;
      } else if (disbursementMethod === 'check') {
        disbursementData.transaction_reference = checkNumber;
        disbursementData.notes = `Check #: ${checkNumber}, Bank: ${bankDrawn}, Date: ${checkDate}\n${disbursementNotes}`;
      }
      
      // Update loan status to 'Active'
      const { error: loanError } = await supabase
        .from('loans')
        .update({ status: 'Active' })
        .eq('id', selectedLoan.loanId);
      
      if (loanError) throw loanError;
      
      // Create disbursement record
      const { data, error: disbursementError } = await supabase
        .from('loan_disbursements')
        .insert([disbursementData])
        .select();
      
      if (disbursementError) throw disbursementError;
      
      // Close modal and refresh data
      closeModal();
      fetchDisbursements();
      
      // Show receipt for the new disbursement
      handleViewReceipt(data[0].id);
      
    } catch (error) {
      console.error('Error processing disbursement:', error);
      setError('Failed to process disbursement. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowDisbursementModal(false);
    setShowReceiptModal(false);
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

  // ... (rest of the component remains the same, just replace the mock data references with the real data)

  return (
    <div>
      {/* The JSX structure remains the same as in your original file */}
      {/* Just make sure to update the data references where needed */}
    </div>
  );
};

export default Disbursements;