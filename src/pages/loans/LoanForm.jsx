// src/components/LoanForm.jsx
import { useState, useEffect } from 'react';
import { createLoan, updateLoan, getClients, searchClients } from '../../lib/supabase';

const LoanForm = ({ existingLoan = null, onSuccess, onCancel }) => {
  const isEditing = !!existingLoan;
  
  const [formData, setFormData] = useState({
    client_id: existingLoan?.client_id || '',
    principal_amount: existingLoan?.principal_amount || '',
    interest_rate: existingLoan?.interest_rate || '10', // Default interest rate
    term_months: existingLoan?.term_months || '12', // Default term
    disbursement_date: existingLoan?.disbursement_date || new Date().toISOString().split('T')[0],
    status: existingLoan?.status || 'Pending',
    payment_frequency: existingLoan?.payment_frequency || 'Monthly',
    purpose: existingLoan?.purpose || '',
    notes: existingLoan?.notes || ''
  });
  
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
        
        // If editing, find and set the selected client
        if (isEditing && existingLoan.client_id) {
          const clientMatch = data.find(c => c.id === existingLoan.client_id);
          if (clientMatch) {
            setSelectedClient(clientMatch);
          }
        }
      } catch (error) {
        console.error('Error loading clients:', error);
        setApiError('Could not load clients. Please try again later.');
      }
    };
    
    loadClients();
  }, [isEditing, existingLoan]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user changes the value
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleClientSearch = async () => {
    if (!clientSearchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchClients(clientSearchTerm);
      setClients(results);
      setIsSearching(false);
    } catch (error) {
      console.error('Error searching clients:', error);
      setApiError('Error searching for clients. Please try again.');
      setIsSearching(false);
    }
  };
  
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setFormData({
      ...formData,
      client_id: client.id
    });
    
    // Clear client selection error if it exists
    if (errors.client_id) {
      setErrors({
        ...errors,
        client_id: null
      });
    }
  };
  
  const calculateExpectedEndDate = () => {
    if (!formData.disbursement_date || !formData.term_months) return '';
    
    const startDate = new Date(formData.disbursement_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(formData.term_months));
    
    return endDate.toISOString().split('T')[0];
  };
  
  const calculateMonthlyPayment = () => {
    const principal = parseFloat(formData.principal_amount);
    const rate = parseFloat(formData.interest_rate) / 100 / 12; // Monthly interest rate
    const term = parseInt(formData.term_months);
    
    if (isNaN(principal) || isNaN(rate) || isNaN(term) || principal <= 0 || term <= 0) {
      return 0;
    }
    
    // Calculate monthly payment using the formula for monthly payment with compound interest 
    // P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyPayment = principal * rate * Math.pow(1 + rate, term) / (Math.pow(1 + rate, term) - 1);
    return monthlyPayment;
  };
  
  const validate = () => {
    const newErrors = {};
    
    // Client validation
    if (!formData.client_id) {
      newErrors.client_id = 'Please select a client';
    }
    
    // Principal amount validation
    if (!formData.principal_amount) {
      newErrors.principal_amount = 'Principal amount is required';
    } else if (isNaN(parseFloat(formData.principal_amount)) || parseFloat(formData.principal_amount) <= 0) {
      newErrors.principal_amount = 'Principal amount must be a positive number';
    }
    
    // Interest rate validation
    if (!formData.interest_rate) {
      newErrors.interest_rate = 'Interest rate is required';
    } else if (isNaN(parseFloat(formData.interest_rate)) || parseFloat(formData.interest_rate) < 0) {
      newErrors.interest_rate = 'Interest rate must be a non-negative number';
    }
    
    // Term validation
    if (!formData.term_months) {
      newErrors.term_months = 'Loan term is required';
    } else if (isNaN(parseInt(formData.term_months)) || parseInt(formData.term_months) <= 0) {
      newErrors.term_months = 'Loan term must be a positive number';
    }
    
    // Disbursement date validation
    if (!formData.disbursement_date) {
      newErrors.disbursement_date = 'Disbursement date is required';
    }
    
    // Status validation
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    // Payment frequency validation
    if (!formData.payment_frequency) {
      newErrors.payment_frequency = 'Payment frequency is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      let result;
      
      if (isEditing) {
        result = await updateLoan(existingLoan.id, formData);
      } else {
        result = await createLoan(formData);
      }
      
      setIsSubmitting(false);
      onSuccess(result);
    } catch (error) {
      console.error('Error saving loan:', error);
      setApiError(isEditing ? 'Failed to update loan. Please try again.' : 'Failed to create loan. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const monthlyPayment = calculateMonthlyPayment();
  const expectedEndDate = calculateExpectedEndDate();
  
  return (
    <div className="loan-form-container p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Loan' : 'New Loan Application'}
      </h2>
      
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{apiError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Client Selection Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Client Information</h3>
          
          <div className="client-search mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search clients by name, ID, or phone"
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="p-2 border rounded flex-grow"
              />
              <button
                type="button"
                onClick={handleClientSearch}
                disabled={isSearching}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            {errors.client_id && <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>}
          </div>
          
          {clients.length > 0 ? (
            <div className="client-list mb-4 max-h-60 overflow-y-auto border rounded">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">ID/Contact</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr 
                      key={client.id} 
                      className={`border-b hover:bg-gray-50 ${selectedClient && selectedClient.id === client.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="p-2">{client.first_name} {client.last_name}</td>
                      <td className="p-2">{client.id_number || client.phone_number}</td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => handleClientSelect(client)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No clients found. Try a different search term.</p>
          )}
          
          {selectedClient && (
            <div className="selected-client p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="font-medium">Selected Client:</h4>
              <p>
                <strong>Name:</strong> {selectedClient.first_name} {selectedClient.last_name}
              </p>
              <p>
                <strong>ID:</strong> {selectedClient.id_number || 'N/A'}
              </p>
              <p>
                <strong>Contact:</strong> {selectedClient.phone_number || 'N/A'}
              </p>
            </div>
          )}
        </div>
        
        {/* Loan Details Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Loan Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Principal Amount */}
            <div>
              <label className="block mb-1">
                Principal Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="principal_amount"
                value={formData.principal_amount}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.principal_amount ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter loan amount"
                step="0.01"
                min="0"
              />
              {errors.principal_amount && <p className="text-red-500 text-sm">{errors.principal_amount}</p>}
            </div>
            
            {/* Interest Rate */}
            <div>
              <label className="block mb-1">
                Interest Rate (% per annum) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="interest_rate"
                value={formData.interest_rate}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.interest_rate ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter interest rate"
                step="0.01"
                min="0"
              />
              {errors.interest_rate && <p className="text-red-500 text-sm">{errors.interest_rate}</p>}
            </div>
            
            {/* Term in Months */}
            <div>
              <label className="block mb-1">
                Term (Months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="term_months"
                value={formData.term_months}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.term_months ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter loan term"
                min="1"
                step="1"
              />
              {errors.term_months && <p className="text-red-500 text-sm">{errors.term_months}</p>}
            </div>
            
            {/* Payment Frequency */}
            <div>
              <label className="block mb-1">
                Payment Frequency <span className="text-red-500">*</span>
              </label>
              <select
                name="payment_frequency"
                value={formData.payment_frequency}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.payment_frequency ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="Monthly">Monthly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Weekly">Weekly</option>
                <option value="Daily">Daily</option>
              </select>
              {errors.payment_frequency && <p className="text-red-500 text-sm">{errors.payment_frequency}</p>}
            </div>
            
            {/* Disbursement Date */}
            <div>
              <label className="block mb-1">
                Disbursement Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="disbursement_date"
                value={formData.disbursement_date}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.disbursement_date ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.disbursement_date && <p className="text-red-500 text-sm">{errors.disbursement_date}</p>}
            </div>
            
            {/* Expected End Date (Calculated field) */}
            <div>
              <label className="block mb-1">Expected End Date</label>
              <input
                type="date"
                value={expectedEndDate}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
            
            {/* Loan Status */}
            <div>
              <label className="block mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Denied">Denied</option>
                <option value="Defaulted">Defaulted</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
            </div>
            
            {/* Monthly Payment (Calculated field) */}
            <div>
              <label className="block mb-1">Estimated Monthly Payment</label>
              <input
                type="text"
                value={isNaN(monthlyPayment) ? '-' : formatCurrency(monthlyPayment)}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
          </div>
        </div>
        
        {/* Additional Information Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
          
          <div className="mb-4">
            <label className="block mb-1">Loan Purpose</label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            >
              <option value="">Select a purpose</option>
              <option value="Business">Business</option>
              <option value="Education">Education</option>
              <option value="Personal">Personal</option>
              <option value="Home Improvement">Home Improvement</option>
              <option value="Debt Consolidation">Debt Consolidation</option>
              <option value="Emergency">Emergency</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
              rows="3"
              placeholder="Enter any additional notes or comments"
            ></textarea>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Loan' : 'Create Loan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanForm;