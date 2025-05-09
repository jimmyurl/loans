/**
 * Utility functions for formatting data in the application
 */

/**
 * Formats a number as currency (USD)
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  /**
   * Formats a date string or Date object to a readable format
   * @param {string|Date} date - The date to format
   * @returns {string} The formatted date string
   */
  export const formatDate = (date) => {
    if (!date) return '-';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  };
  
  /**
   * Formats a percentage value
   * @param {number} value - The value to format as percentage
   * @param {number} [decimalPlaces=1] - Number of decimal places
   * @returns {string} The formatted percentage string
   */
  export const formatPercentage = (value, decimalPlaces = 1) => {
    return `${(value * 100).toFixed(decimalPlaces)}%`;
  };
  
  /**
   * Formats a phone number to a standard format
   * @param {string} phoneNumber - The phone number to format
   * @returns {string} The formatted phone number
   */
  export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '-';
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format according to length
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    }
    
    // If not a standard format, return cleaned version
    return cleaned;
  };