import { useState, useEffect, useContext } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { AuthContext } from '../App';
 
 const NewLoanPage = () => {
   const navigate = useNavigate();
   const { supabase } = useContext(AuthContext);
   const [clients, setClients] = useState([]);
   const [loading, setLoading] = useState(false);
   const [submitError, setSubmitError] = useState(null);
   const [submitSuccess, setSubmitSuccess] = useState(false);
   const [formData, setFormData] = useState({
     client_id: '',
     loan_amount: '',
     interest_rate: '',
     term_length: '',
     term_unit: 'months',
     purpose: '',
     disbursement_date: '',
     repayment_schedule: 'monthly',
     collateral_type: '',
     collateral_value: '',
     notes: ''
   });
   const [errors, setErrors] = useState({});
   const [totalRepaymentAmount, setTotalRepaymentAmount] = useState(0);
 
   // Fetch client list when component mounts
   useEffect(() => {
     fetchClients();
   }, []);
 
   useEffect(() => {
     const amount = parseFloat(formData.loan_amount);
     const rate = parseFloat(formData.interest_rate);
     if (!isNaN(amount) && !isNaN(rate)) {
       const calculatedAmount = amount + (amount * (rate / 100));
       setTotalRepaymentAmount(calculatedAmount.toFixed(2));
     } else {
       setTotalRepaymentAmount(0);
     }
   }, [formData.loan_amount, formData.interest_rate]);
 
   const fetchClients = async () => {
     try {
       setLoading(true);
       const { data, error } = await supabase
         .from('clients')
         .select('id, first_name, last_name')
         .order('last_name', { ascending: true });
 
       if (error) throw error;
       setClients(data || []);
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
       payment_frequency: mapRepaymentSchedule(formData.repayment_schedule),
       purpose: formData.purpose,
       notes: formData.notes,
       status: 'Pending',
       created_by: (await supabase.auth.getUser()).data.user.id,
       total_repayment_amount: parseFloat(totalRepaymentAmount) // Add this line
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
           <div className="form-group">
             <label htmlFor="client_id">Client Name*</label>
             <select
               id="client_id"
               name="client_id"
               value={formData.client_id}
               onChange={handleChange}
               className={errors.client_id ? 'error' : ''}
             >
               <option value="">Select a client</option>
               {clients.map(client => (
                 <option key={client.id} value={client.id}>
                   {client.first_name} {client.last_name}
                 </option>
               ))}
             </select>
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
 
           <div className="form-group">
             <label htmlFor="total_repayment_amount">Total Repayment Amount</label>
             <input
               type="text"
               id="total_repayment_amount"
               name="total_repayment_amount"
               value={totalRepaymentAmount}
               readOnly // Make the field non-editable
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
             ></textarea>
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