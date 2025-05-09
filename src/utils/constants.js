/**
 * Application constants
 */

// API base URL - adjust for different environments
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Application settings
export const APP_NAME = 'LoanTrack';
export const APP_VERSION = '1.0.0';

// Pagination settings
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// Date formats
export const DATE_FORMAT = 'MMM d, yyyy';
export const DATE_TIME_FORMAT = 'MMM d, yyyy h:mm a';

// Loan status options
export const LOAN_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'blue' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' }
];

// Disbursement status options
export const DISBURSEMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
];

// Loan types
export const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'education', label: 'Education Loan' },
  { value: 'other', label: 'Other' }
];

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'direct_deposit', label: 'Direct Deposit' },
  { value: 'other', label: 'Other' }
];

// Maximum loan amount
export const MAX_LOAN_AMOUNT = 100000;

// Interest rate limits
export const MIN_INTEREST_RATE = 0.01; // 1%
export const MAX_INTEREST_RATE = 0.30; // 30% 

// Maximum loan term in months
export const MAX_LOAN_TERM = 60; // 5 years