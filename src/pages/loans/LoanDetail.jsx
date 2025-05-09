// src/pages/loans/LoanDetail.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../App';

const LoanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { supabase } = useContext(AuthContext);
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch loan with client details
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select(`
          *,
          clients:client_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            address
          )
        `)
        .eq('id', id)
        .single();
      
      if (loanError) throw loanError;
      setLoan(loanData);
      
      // Fetch payment history
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('loan_id', id)
        .order('payment_date', { ascending: false });
      
      if (paymentError) throw paymentError;
      setPayments(paymentData || []);

    } catch (err) {
      console.error('Error fetching loan details:', err);
      setError('Failed to load loan details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-badge';
      case 'approved': return 'status-badge active';
      case 'disbursed': return 'status-badge active';
      case 'active': return 'status-badge active';
      case 'overdue': return 'status-badge overdue';
      case 'defaulted': return 'status-badge defaulted';
      case 'paid': return 'status-badge fully paid';
      case 'closed': return 'status-badge';
      case 'rejected': return 'status-badge defaulted';
      default: return 'status-badge';
    }
  };

  // Calculate metrics
  const calculateLoanMetrics = () => {
    if (!loan) return {};
    
    // Total amount paid
    const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Outstanding principal
    const outstandingPrincipal = loan.loan_amount - totalPaid;
    
    // Remaining interest (simplified calculation)
    const totalInterest = (loan.loan_amount * (loan.interest_rate / 100) * (loan.term / 12));
    const paidPortion = totalPaid / (loan.loan_amount + totalInterest);
    const remainingInterest = totalInterest * (1 - paidPortion);
    
    return {
      totalPaid,
      outstandingPrincipal: outstandingPrincipal > 0 ? outstandingPrincipal : 0,
      remainingInterest: remainingInterest > 0 ? remainingInterest : 0,
      totalRepayable: loan.loan_amount + totalInterest
    };
  };

  const metrics = calculateLoanMetrics();

  const handleMarkAsDisbursed = async () => {
    if (!loan || loan.status !== 'approved') return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('loans')
        .update({ 
          status: 'active',
          disbursement_date: today
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh loan data
      fetchLoanDetails();
    } catch (err) {
      console.error('Error updating loan status:', err);
      setError('Failed to update loan status.');
    }
  };

  const handleRecordPayment = () => {
    // Navigate to payment recording page (implement separately)
    navigate(`/repayments/new?loan_id=${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-600 text-lg">Loading loan details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <button onClick={() => navigate('/loans')} className="btn btn-secondary ml-4">
          Back to Loans
        </button>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="alert alert-warning">
        Loan not found.
        <button onClick={() => navigate('/loans')} className="btn btn-secondary ml-4">
          Back to Loans
        </button>
      </div>
    );
  }

  return (
    <div className="loan-detail-page">
      <div className="action-header">
        <button onClick={() => navigate('/loans')} className="btn btn-secondary">
          ← Back to Loans
        </button>
        
        <div className="action-buttons">
          {loan.status === 'approved' && (
            <button onClick={handleMarkAsDisbursed} className="btn btn-primary">
              Mark as Disbursed
            </button>
          )}
          
          {(loan.status === 'active' || loan.status === 'overdue') && (
            <button onClick={handleRecordPayment} className="btn btn-primary">
              Record Payment
            </button>
          )}
          
          {(loan.status === 'pending' || loan.status === 'approved') && (
            <Link to={`/loans/edit/${id}`} className="btn btn-secondary">
              Edit Loan
            </Link>
          )}
        </div>
      </div>

      <div className="loan-detail-header">
        <h2>Loan #{loan.id}</h2>
        <span className={getStatusBadgeClass(loan.status)}>
          {loan.status?.toUpperCase()}
        </span>
      </div>

      <div className="loan-overview-grid">
        <div className="loan-metrics-card">
          <h3>Loan Overview</h3>
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Principal Amount</span>
              <span className="metric-value">{formatCurrency(loan.loan_amount)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Interest Rate</span>
              <span className="metric-value">{loan.interest_rate}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Term</span>
              <span className="metric-value">{loan.term} months</span>
            </div>
            <div className="metric">
              <span className="metric-label">Disbursement Date</span>
              <span className="metric-value">{formatDate(loan.disbursement_date)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">End Date</span>
              <span className="metric-value">
                {loan.disbursement_date 
                  ? formatDate(new Date(new Date(loan.disbursement_date).setMonth(
                      new Date(loan.disbursement_date).getMonth() + loan.term
                    ))) 
                  : '-'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Purpose</span>
              <span className="metric-value">{loan.purpose || '-'}</span>
            </div>
          </div>
        </div>

        <div className="loan-metrics-card">
          <h3>Payment Status</h3>
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Total Repayable</span>
              <span className="metric-value">{formatCurrency(metrics.totalRepayable)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Total Paid</span>
              <span className="metric-value">{formatCurrency(metrics.totalPaid)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Outstanding Principal</span>
              <span className="metric-value">{formatCurrency(metrics.outstandingPrincipal)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Remaining Interest</span>
              <span className="metric-value">{formatCurrency(metrics.remainingInterest)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Total Outstanding</span>
              <span className="metric-value">{formatCurrency(metrics.outstandingPrincipal + metrics.remainingInterest)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Next Payment Due</span>
              <span className="metric-value">{loan.next_payment_date ? formatDate(loan.next_payment_date) : '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="client-info-card">
        <h3>Client Information</h3>
        {loan.clients ? (
          <div className="client-details-grid">
            <div className="client-detail">
              <span className="detail-label">Name</span>
              <span className="detail-value">{`${loan.clients.first_name} ${loan.clients.last_name}`}</span>
            </div>
            <div className="client-detail">
              <span className="detail-label">Email</span>
              <span className="detail-value">{loan.clients.email || '-'}</span>
            </div>
            <div className="client-detail">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{loan.clients.phone || '-'}</span>
            </div>
            <div className="client-detail">
              <span className="detail-label">Address</span>
              <span className="detail-value">{loan.clients.address || '-'}</span>
            </div>
          </div>
        ) : (
          <p>Client information not available</p>
        )}
      </div>

      <div className="payment-history-section">
        <h3>Payment History</h3>
        {payments.length > 0 ? (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Reference</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{formatDate(payment.payment_date)}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>{payment.payment_method || '-'}</td>
                    <td>{payment.reference_number || '-'}</td>
                    <td>{payment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data-message">No payment records found.</p>
        )}
      </div>

      {loan.notes && (
        <div className="loan-notes-section">
          <h3>Notes</h3>
          <div className="notes-content">
            {loan.notes}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDetail;