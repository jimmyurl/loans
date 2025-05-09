// src/pages/NewClientPage.jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const NewClientPage = () => {
  const navigate = useNavigate();
  const { supabase } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    id_number: '',
    id_type: 'national_id',
    phone: '',
    email: '',
    address: '',
    city: '',
    occupation: '',
    monthly_income: '',
    business_name: '',
    business_type: '',
    business_address: '',
    years_in_business: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

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
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Email validation if provided
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (formData.phone && !/^\+?[0-9\s-()]{7,20}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Income validation if provided
    if (formData.monthly_income && (isNaN(formData.monthly_income) || Number(formData.monthly_income) < 0)) {
      newErrors.monthly_income = 'Please enter a valid non-negative number';
    }
    
    // Years in business validation if provided
    if (formData.years_in_business && (isNaN(formData.years_in_business) || Number(formData.years_in_business) < 0)) {
      newErrors.years_in_business = 'Please enter a valid non-negative number';
    }
    
    // Emergency contact validation if any emergency field is filled
    if ((formData.emergency_contact_name || formData.emergency_contact_phone) && !formData.emergency_contact_relationship) {
      newErrors.emergency_contact_relationship = 'Please specify relationship if providing emergency contact details';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    // Prepare client data
    const clientData = {
      ...formData,
      monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
      years_in_business: formData.years_in_business ? parseFloat(formData.years_in_business) : null,
      created_at: new Date().toISOString(),
      created_by: (await supabase.auth.getUser()).data.user.id
    };
    
    try {
      setLoading(true);
      
      // Insert the client record
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select();
      
      if (error) throw error;
      
      setSubmitSuccess(true);
      // Reset form data after successful submission
      setFormData({
        first_name: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        id_number: '',
        id_type: 'national_id',
        phone: '',
        email: '',
        address: '',
        city: '',
        occupation: '',
        monthly_income: '',
        business_name: '',
        business_type: '',
        business_address: '',
        years_in_business: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        notes: ''
      });
      
      // Redirect to the client details page after 2 seconds
      setTimeout(() => {
        navigate(`/clients/${data[0].id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating client:', error);
      setSubmitError('Failed to register client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register New Client</h2>
      
      {submitError && (
        <div className="alert alert-error">
          {submitError}
        </div>
      )}
      
      {submitSuccess && (
        <div className="alert alert-success">
          Client registered successfully! Redirecting to client details...
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <h3 className="form-group full-width" style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
            Personal Information
          </h3>
          
          <div className="form-group">
            <label htmlFor="first_name">First Name*</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter first name"
              className={errors.first_name ? 'error' : ''}
            />
            {errors.first_name && <div className="error">{errors.first_name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="last_name">Last Name*</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter last name"
              className={errors.last_name ? 'error' : ''}
            />
            {errors.last_name && <div className="error">{errors.last_name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="gender">Gender*</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={errors.gender ? 'error' : ''}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && <div className="error">{errors.gender}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="date_of_birth">Date of Birth</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="id_type">ID Type</label>
            <select
              id="id_type"
              name="id_type"
              value={formData.id_type}
              onChange={handleChange}
            >
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="voter_id">Voter ID</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="id_number">ID Number</label>
            <input
              type="text"
              id="id_number"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              placeholder="Enter ID number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number*</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <div className="error">{errors.phone}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows="2"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="city">City/Town</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city or town"
            />
          </div>
          
          <h3 className="form-group full-width" style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
            Employment & Business Information
          </h3>
          
          <div className="form-group">
            <label htmlFor="occupation">Occupation</label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="Enter occupation"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="monthly_income">Monthly Income</label>
            <input
              type="number"
              id="monthly_income"
              name="monthly_income"
              value={formData.monthly_income}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              className={errors.monthly_income ? 'error' : ''}
            />
            {errors.monthly_income && <div className="error">{errors.monthly_income}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="business_name">Business Name</label>
            <input
              type="text"
              id="business_name"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              placeholder="Enter business name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="business_type">Business Type</label>
            <select
              id="business_type"
              name="business_type"
              value={formData.business_type}
              onChange={handleChange}
            >
              <option value="">Select type</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="service">Service</option>
              <option value="agriculture">Agriculture</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="business_address">Business Address</label>
            <input
              type="text"
              id="business_address"
              name="business_address"
              value={formData.business_address}
              onChange={handleChange}
              placeholder="Enter business address"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="years_in_business">Years in Business</label>
            <input
              type="number"
              id="years_in_business"
              name="years_in_business"
              value={formData.years_in_business}
              onChange={handleChange}
              placeholder="Enter years"
              step="0.1"
              min="0"
              className={errors.years_in_business ? 'error' : ''}
            />
            {errors.years_in_business && <div className="error">{errors.years_in_business}</div>}
          </div>
          
          <h3 className="form-group full-width" style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
            Emergency Contact
          </h3>
          
          <div className="form-group">
            <label htmlFor="emergency_contact_name">Emergency Contact Name</label>
            <input
              type="text"
              id="emergency_contact_name"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
            <input
              type="tel"
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="emergency_contact_relationship">Relationship</label>
            <select
              id="emergency_contact_relationship"
              name="emergency_contact_relationship"
              value={formData.emergency_contact_relationship}
              onChange={handleChange}
              className={errors.emergency_contact_relationship ? 'error' : ''}
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="relative">Other Relative</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
            {errors.emergency_contact_relationship && (
              <div className="error">{errors.emergency_contact_relationship}</div>
            )}
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/clients')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="spinner"></span>}
            Register Client
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewClientPage;