// src/components/ClientForm.jsx
import { useState } from 'react';
import { createClient, updateClient } from '../lib/supabase';

const ClientForm = ({ existingClient = null, onSuccess, onCancel }) => {
  const isEditing = !!existingClient;
  
  const [formData, setFormData] = useState({
    first_name: existingClient?.first_name || '',
    last_name: existingClient?.last_name || '',
    phone_number: existingClient?.phone_number || '',
    email: existingClient?.email || '',
    national_id: existingClient?.national_id || '',
    address: existingClient?.address || '',
    occupation: existingClient?.occupation || '',
    monthly_income: existingClient?.monthly_income || '',
    date_of_birth: existingClient?.date_of_birth || '',
    gender: existingClient?.gender || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  
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
  
  const validate = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.national_id.trim()) newErrors.national_id = 'National ID is required';
    
    // Email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Phone number format (basic validation)
    if (formData.phone_number && !/^\+?[0-9]{10,15}$/.test(formData.phone_number.replace(/\s+/g, ''))) {
      newErrors.phone_number = 'Invalid phone number format';
    }
    
    // National ID validation (basic, adjust for actual format)
    if (formData.national_id && formData.national_id.length < 5) {
      newErrors.national_id = 'National ID appears to be too short';
    }
    
    // Income should be a number
    if (formData.monthly_income && isNaN(Number(formData.monthly_income))) {
      newErrors.monthly_income = 'Income must be a number';
    }
    
    // Date of birth validation (must be in the past)
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      if (dob > today) {
        newErrors.date_of_birth = 'Date of birth must be in the past';
      }
      
      // Check if the client is at least 18 years old
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
      if (dob > eighteenYearsAgo) {
        newErrors.date_of_birth = 'Client must be at least 18 years old';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        await updateClient(existingClient.id, formData);
      } else {
        await createClient(formData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving client:', error);
      
      // Handle specific error cases
      if (error.message.includes('duplicate key')) {
        setApiError('A client with this National ID already exists');
      } else {
        setApiError(`Error ${isEditing ? 'updating' : 'creating'} client: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="form-container">
      <h2 className="form-title">{isEditing ? 'Edit Client' : 'Register New Client'}</h2>
      
      {apiError && (
        <div className="alert alert-error">
          {apiError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Personal Information */}
          <div className="form-group">
            <label htmlFor="first_name">First Name <span className="required">*</span></label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={errors.first_name ? 'error' : ''}
            />
            {errors.first_name && <span className="error">{errors.first_name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="last_name">Last Name <span className="required">*</span></label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={errors.last_name ? 'error' : ''}
            />
            {errors.last_name && <span className="error">{errors.last_name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number <span className="required">*</span></label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+255 XXX XXX XXX"
              className={errors.phone_number ? 'error' : ''}
            />
            {errors.phone_number && <span className="error">{errors.phone_number}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="national_id">National ID <span className="required">*</span></label>
            <input
              type="text"
              id="national_id"
              name="national_id"
              value={formData.national_id}
              onChange={handleChange}
              className={errors.national_id ? 'error' : ''}
            />
            {errors.national_id && <span className="error">{errors.national_id}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="date_of_birth">Date of Birth</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={errors.date_of_birth ? 'error' : ''}
            />
            {errors.date_of_birth && <span className="error">{errors.date_of_birth}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {/* Address */}
          <div className="form-group full-width">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
          
          {/* Financial Information */}
          <div className="form-group">
            <label htmlFor="occupation">Occupation</label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="monthly_income">Monthly Income (TZS)</label>
            <input
              type="number"
              id="monthly_income"
              name="monthly_income"
              value={formData.monthly_income}
              onChange={handleChange}
              className={errors.monthly_income ? 'error' : ''}
            />
            {errors.monthly_income && <span className="error">{errors.monthly_income}</span>}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              isEditing ? 'Update Client' : 'Register Client'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;