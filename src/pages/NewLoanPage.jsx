import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const NewLoanPage = () => {
  const navigate = useNavigate();
  const { supabase } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    loan_amount: '',
    interest_rate: '',
    term_length: '',
    term_unit: 'months',
    purpose: '',
    disbursement_date: '',
    repayment_date: '',
    repayment_schedule: 'monthly',
    collateral_type: '',
    collateral_value: '',
    collateral_details: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [totalRepaymentAmount, setTotalRepaymentAmount] = useState(0);
  const [monthlyRepaymentAmount, setMonthlyRepaymentAmount] = useState(0);

  // Fetch client list when component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  // Calculate total repayment amount and monthly payment
  useEffect(() => {
    const amount = parseFloat(formData.loan_amount);
    const rate = parseFloat(formData.interest_rate);
    const termLength = parseInt(formData.term_length);
    const termUnit = formData.term_unit;
    
    if (!isNaN(amount) && !isNaN(rate) && !isNaN(termLength) && termUnit) {
      // Calculate total repayment amount (simple interest)
      const calculatedAmount = amount + (amount * (rate / 100));
      setTotalRepaymentAmount(calculatedAmount.toFixed(2));
      
      // Calculate monthly payment based on repayment schedule
      if (formData.repayment_schedule && (formData.repayment_schedule === 'monthly' || formData.repayment_schedule === 'quarterly' || formData.repayment_schedule === 'annually')) {
        const termInMonths = convertToMonths(termLength, termUnit);
        
        let paymentFrequency;
        switch (formData.repayment_schedule) {
          case 'monthly':
            paymentFrequency = termInMonths;
            break;
          case 'quarterly':
            paymentFrequency = Math.ceil(termInMonths / 3);
            break;
          case 'annually':
            paymentFrequency = Math.ceil(termInMonths / 12);
            break;
          default:
            paymentFrequency = termInMonths;
        }
        
        if (paymentFrequency > 0) {
          const paymentAmount = calculatedAmount / paymentFrequency;
          setMonthlyRepaymentAmount(paymentAmount.toFixed(2));
        } else {
          setMonthlyRepaymentAmount(0);
        }
      } else {
        setMonthlyRepaymentAmount(0);
      }
    } else {
      setTotalRepaymentAmount(0);
      setMonthlyRepaymentAmount(0);
    }
  }, [formData.loan_amount, formData.interest_rate, formData.term_length, formData.term_unit, formData.repayment_schedule]);

  // Calculate repayment date based on disbursement date and term
  useEffect(() => {
    if (formData.disbursement_date && formData.term_length && formData.term_unit) {
      const disbursementDate = new Date(formData.disbursement_date);
      const termLength = parseInt(formData.term_length);
      let repaymentDate = new Date(disbursementDate);

      switch (formData.term_unit) {
        case 'days':
          repaymentDate.setDate(repaymentDate.getDate() + termLength);
          break;
        case 'weeks':
          repaymentDate.setDate(repaymentDate.getDate() + (termLength * 7));
          break;
        case 'months':
          repaymentDate.setMonth(repaymentDate.getMonth() + termLength);
          break;
        case 'years':
          repaymentDate.setFullYear(repaymentDate.getFullYear() + termLength);
          break;
        default:
          break;
      }

      const formattedDate = repaymentDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, repayment_date: formattedDate }));
    }
  }, [formData.disbursement_date, formData.term_length, formData.term_unit]);

  // Filter clients based on search term
  useEffect(() => {
    if (clientSearchTerm) {
      const filtered = clients.filter(client =>
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(clientSearchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [clientSearchTerm, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
      setFilteredClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Clear error for this field when it's changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleClientSearch = (e) => {
    const value = e.target.value;
    setClientSearchTerm(value);
    setFormData(prev => ({ ...prev, client_name: value, client_id: '' }));
    setShowClientDropdown(value.length > 0);
  };

  const selectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      client_id: client.id,
      client_name: `${client.first_name} ${client.last_name}`
    }));
    setClientSearchTerm(`${client.first_name} ${client.last_name}`);
    setShowClientDropdown(false);
  };

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.form-group')) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.client_id) newErrors.client_id = 'Please select a client';
    if (!formData.loan_amount) {
      newErrors.loan_amount = 'Please enter the loan amount';
    } else if (isNaN(formData.loan_amount) || Number(formData.loan_amount) <= 0) {
      newErrors.loan_amount = 'Please enter a valid positive number';
    }

    if (!formData.interest_rate) {
      newErrors.interest_rate = 'Please enter the interest rate';
    } else if (isNaN(formData.interest_rate) || Number(formData.interest_rate) < 0) {
      newErrors.interest_rate = 'Please enter a valid non-negative number';
    }

    if (!formData.term_length) {
      newErrors.term_length = 'Please enter the term length';
    } else if (isNaN(formData.term_length) || Number(formData.term_length) <= 0) {
      newErrors.term_length = 'Please enter a valid positive number';
    }

    if (!formData.purpose) newErrors.purpose = 'Please specify the loan purpose';
    if (!formData.disbursement_date) newErrors.disbursement_date = 'Please set the disbursement date';

    // Validate collateral details if collateral type is selected
    if (formData.collateral_type && formData.collateral_type !== '' && !formData.collateral_details) {
      newErrors.collateral_details = 'Please provide collateral details';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) return;

    // Convert term to months based on selected unit
    const termMonths = convertToMonths(
      parseInt(formData.term_length),
      formData.term_unit
    );

    // Prepare loan data matching table schema
    const loanData = {
      client_id: formData.client_id,
      principal_amount: parseFloat(formData.loan_amount),
      interest_rate: parseFloat(formData.interest_rate),
      term_months: termMonths,
      disbursement_date: formData.disbursement_date,
      repayment_date: formData.repayment_date,
      payment_frequency: mapRepaymentSchedule(formData.repayment_schedule),
      purpose: formData.purpose,
      collateral_type: formData.collateral_type || null,
      collateral_value: formData.collateral_value ? parseFloat(formData.collateral_value) : null,
      collateral_details: formData.collateral_details || null,
      notes: formData.notes,
      status: 'Pending',
      created_by: (await supabase.auth.getUser()).data.user.id,
      total_repayment_amount: parseFloat(totalRepaymentAmount)
    };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loans')
        .insert([loanData])
        .select();

      if (error) throw error;

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate(`/loans/${data[0].id}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating loan:', error);
      setSubmitError('Failed to create loan. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert term to months
  const convertToMonths = (value, unit) => {
    switch (unit) {
      case 'days': return Math.ceil(value / 30);
      case 'weeks': return Math.ceil(value / 4);
      case 'months': return value;
      case 'years': return value * 12;
      default: return value;
    }
  };

  // Helper function to map repayment schedule to allowed values
  const mapRepaymentSchedule = (schedule) => {
    switch (schedule) {
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Biweekly';
      case 'monthly': return 'Monthly';
      // Map other values to one of the allowed options
      default: return 'Monthly';
    }
  };

  return (
    <div>
      <h2>Create New Loan</h2>

      {submitError && (
        <div className="alert alert-error">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="alert alert-success">
          Loan created successfully! Redirecting to loan details...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Client Autocomplete Field */}
          <div className="form-group">
            <label htmlFor="client_name">Client Name*</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="client_name"
                name="client_name"
                value={clientSearchTerm}
                onChange={handleClientSearch}
                onFocus={() => setShowClientDropdown(clientSearchTerm.length > 0)}
                placeholder="Start typing client name..."
                className={errors.client_id ? 'error' : ''}
                autoComplete="off"
              />
              {showClientDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderTop: 'none',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                      <div
                        key={client.id}
                        onClick={() => selectClient(client)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        {client.first_name} {client.last_name}
                      </div>
                    ))
                  ) : (
                    <div style={{
                      padding: '8px 12px',
                      color: '#e74c3c',
                      fontStyle: 'italic',
                      backgroundColor: '#fdf2f2'
                    }}>
                      No clients found matching "{clientSearchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Show immediate feedback when client not found */}
            {clientSearchTerm && filteredClients.length === 0 && !showClientDropdown && (
              <small style={{ color: '#e74c3c' }}>
                Client "{clientSearchTerm}" not found. <a href="/new-client">Register a new client</a>
              </small>
            )}
            {errors.client_id && <div className="error">{errors.client_id}</div>}
            {clients.length === 0 && !loading && (
              <small>No clients found. <a href="/new-client">Register a new client</a> first.</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="loan_amount">Loan Amount*</label>
            <input
              type="number"
              id="loan_amount"
              name="loan_amount"
              value={formData.loan_amount}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              className={errors.loan_amount ? 'error' : ''}
            />
            {errors.loan_amount && <div className="error">{errors.loan_amount}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="interest_rate">Interest Rate (%)*</label>
            <input
              type="number"
              id="interest_rate"
              name="interest_rate"
              value={formData.interest_rate}
              onChange={handleChange}
              placeholder="Enter interest rate"
              step="0.01"
              min="0"
              className={errors.interest_rate ? 'error' : ''}
            />
            {errors.interest_rate && <div className="error">{errors.interest_rate}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="term_length">Term Length*</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                id="term_length"
                name="term_length"
                value={formData.term_length}
                onChange={handleChange}
                placeholder="Enter term length"
                min="1"
                style={{ flex: 1 }}
                className={errors.term_length ? 'error' : ''}
              />
              <select
                id="term_unit"
                name="term_unit"
                value={formData.term_unit}
                onChange={handleChange}
                style={{ width: '100px' }}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
            {errors.term_length && <div className="error">{errors.term_length}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Loan Purpose*</label>
            <select
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className={errors.purpose ? 'error' : ''}
            >
              <option value="">Select purpose</option>
              <option value="business_expansion">Business Expansion</option>
              <option value="working_capital">Working Capital</option>
              <option value="equipment_purchase">Equipment Purchase</option>
              <option value="inventory_purchase">Inventory Purchase</option>
              <option value="debt_consolidation">Debt Consolidation</option>
              <option value="emergency">Emergency</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
            {errors.purpose && <div className="error">{errors.purpose}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="disbursement_date">Disbursement Date*</label>
            <input
              type="date"
              id="disbursement_date"
              name="disbursement_date"
              value={formData.disbursement_date}
              onChange={handleChange}
              className={errors.disbursement_date ? 'error' : ''}
            />
            {errors.disbursement_date && <div className="error">{errors.disbursement_date}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="repayment_schedule">Repayment Schedule</label>
            <select
              id="repayment_schedule"
              name="repayment_schedule"
              value={formData.repayment_schedule}
              onChange={handleChange}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
              <option value="bullet">Bullet (End of term)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="total_repayment_amount">Total Repayment Amount</label>
            <input
              type="text"
              id="total_repayment_amount"
              name="total_repayment_amount"
              value={totalRepaymentAmount}
              readOnly
            />
          </div>

          {/* Payment Amount Field - appears for monthly, quarterly, and annually schedules */}
          {(formData.repayment_schedule === 'monthly' || formData.repayment_schedule === 'quarterly' || formData.repayment_schedule === 'annually') && monthlyRepaymentAmount > 0 && (
            <div className="form-group">
              <label htmlFor="payment_amount">
                {formData.repayment_schedule === 'monthly' ? 'Monthly Payment Amount' : 
                 formData.repayment_schedule === 'quarterly' ? 'Quarterly Payment Amount' : 
                 'Annual Payment Amount'}
              </label>
              <input
                type="text"
                id="payment_amount"
                name="payment_amount"
                value={monthlyRepaymentAmount}
                readOnly
                style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}
              />
              <small style={{ color: '#666', fontSize: '0.85em' }}>
                {formData.repayment_schedule === 'monthly' ? 
                  `You will pay ${monthlyRepaymentAmount} every month for ${convertToMonths(parseInt(formData.term_length), formData.term_unit)} months` :
                 formData.repayment_schedule === 'quarterly' ? 
                  `You will pay ${monthlyRepaymentAmount} every quarter for ${Math.ceil(convertToMonths(parseInt(formData.term_length), formData.term_unit) / 3)} payments` :
                  `You will pay ${monthlyRepaymentAmount} every year for ${Math.ceil(convertToMonths(parseInt(formData.term_length), formData.term_unit) / 12)} payments`
                }
              </small>
            </div>
          )}

          {/* Repayment Date Field - appears after total repayment amount */}
          {formData.disbursement_date && formData.term_length && (
            <div className="form-group">
              <label htmlFor="repayment_date">Expected Repayment Date</label>
              <input
                type="date"
                id="repayment_date"
                name="repayment_date"
                value={formData.repayment_date}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="collateral_type">Collateral Type</label>
            <select
              id="collateral_type"
              name="collateral_type"
              value={formData.collateral_type}
              onChange={handleChange}
            >
              <option value="">None</option>
              <option value="real_estate">Real Estate</option>
              <option value="vehicle">Vehicle</option>
              <option value="equipment">Equipment</option>
              <option value="inventory">Inventory</option>
              <option value="guarantor">Guarantor</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Collateral Details Field - appears when collateral type is selected */}
          {formData.collateral_type && formData.collateral_type !== '' && (
            <div className="form-group">
              <label htmlFor="collateral_details">Collateral Details*</label>
              <textarea
                id="collateral_details"
                name="collateral_details"
                value={formData.collateral_details}
                onChange={handleChange}
                placeholder="Provide detailed description of the collateral (e.g., address for real estate, make/model for vehicle, etc.)"
                rows="2"
                className={errors.collateral_details ? 'error' : ''}
              />
              {errors.collateral_details && <div className="error">{errors.collateral_details}</div>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="collateral_value">Collateral Value</label>
            <input
              type="number"
              id="collateral_value"
              name="collateral_value"
              value={formData.collateral_value}
              onChange={handleChange}
              placeholder="Enter value (if applicable)"
              step="0.01"
              min="0"
              disabled={!formData.collateral_type || formData.collateral_type === ''}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes or comments"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/loans')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="spinner"></span>}
            Create Loan
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewLoanPage;