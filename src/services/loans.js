/**
 * Loan services - handles API communication for loan-related functionality
 */

import { API_BASE_URL } from '../utils/constants';

/**
 * Fetches all loans based on provided filters
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - Promise resolving to array of loans
 */
export const getLoans = async (filters = {}) => {
  try {
    // In a real application, you would build query parameters from filters
    const queryParams = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    
    if (filters.date && filters.date !== 'all') {
      queryParams.append('dateRange', filters.date);
    }
    
    if (filters.clientId) {
      queryParams.append('clientId', filters.clientId);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // For development, use mock data instead of actual API call
    // const response = await fetch(`${API_BASE_URL}/loans${queryString}`);
    // return response.json();
    
    // Mock data
    return getMockLoans(filters);
  } catch (error) {
    console.error('Error fetching loans:', error);
    throw new Error('Failed to fetch loans data');
  }
};

/**
 * Fetches loan disbursements based on provided filters
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - Promise resolving to array of disbursements
 */
export const getDisbursements = async (filters = {}) => {
  try {
    // In a real application, you would build query parameters from filters
    const queryParams = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    
    if (filters.date && filters.date !== 'all') {
      queryParams.append('dateRange', filters.date);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // For development, use mock data instead of actual API call
    // const response = await fetch(`${API_BASE_URL}/disbursements${queryString}`);
    // return response.json();
    
    // Mock data
    return getMockDisbursements(filters);
  } catch (error) {
    console.error('Error fetching disbursements:', error);
    throw new Error('Failed to fetch disbursement data');
  }
};

/**
 * Fetches loan repayments based on provided filters
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - Promise resolving to array of repayments
 */
export const getRepayments = async (filters = {}) => {
  try {
    // In a real application, you would build query parameters from filters
    const queryParams = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    
    if (filters.date && filters.date !== 'all') {
      queryParams.append('dateRange', filters.date);
    }
    
    if (filters.overdue && filters.overdue !== 'all') {
      queryParams.append('overdue', filters.overdue);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // For development, use mock data instead of actual API call
    // const response = await fetch(`${API_BASE_URL}/repayments${queryString}`);
    // return response.json();
    
    // Mock data
    return getMockRepayments(filters);
  } catch (error) {
    console.error('Error fetching repayments:', error);
    throw new Error('Failed to fetch repayment data');
  }
};

/**
 * Creates a new loan
 * @param {Object} loanData - Data for the new loan
 * @returns {Promise<Object>} - Promise resolving to created loan
 */
export const createLoan = async (loanData) => {
  try {
    // For a real application, you would make an API call
    // const response = await fetch(`${API_BASE_URL}/loans`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(loanData),
    // });
    // return response.json();
    
    // Mock response
    return {
      id: `LOAN${Math.floor(Math.random() * 10000)}`,
      ...loanData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating loan:', error);
    throw new Error('Failed to create loan');
  }
};

/**
 * Updates an existing loan
 * @param {string} id - ID of loan to update
 * @param {Object} loanData - Updated loan data
 * @returns {Promise<Object>} - Promise resolving to updated loan
 */
export const updateLoan = async (id, loanData) => {
  try {
    // For a real application, you would make an API call
    // const response = await fetch(`${API_BASE_URL}/loans/${id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(loanData),
    // });
    // return response.json();
    
    // Mock response
    return {
      id,
      ...loanData,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error updating loan:', error);
    throw new Error('Failed to update loan');
  }
};

/**
 * Fetches a specific loan by ID
 * @param {string} id - ID of loan to fetch
 * @returns {Promise<Object>} - Promise resolving to loan data
 */
export const getLoanById = async (id) => {
  try {
    // For a real application, you would make an API call
    // const response = await fetch(`${API_BASE_URL}/loans/${id}`);
    // return response.json();
    
    // Mock response
    const allLoans = getMockLoans();
    const loan = allLoans.find(loan => loan.id === id);
    
    if (!loan) {
      throw new Error('Loan not found');
    }
    
    return loan;
  } catch (error) {
    console.error('Error fetching loan:', error);
    throw new Error('Failed to fetch loan data');
  }
};

// Helper function to generate mock data for development
const getMockLoans = (filters = {}) => {
  const loans = [
    {
      id: 'LOAN1001',
      loanId: 'L2025001',
      clientId: 'CLIENT001',
      clientName: 'John Smith',
      amount: 5000,
      term: 12,
      interestRate: 0.08,
      dueDate: '2025-10-15',
      status: 'active',
      purpose: 'Business expansion',
      collateral: 'Business equipment',
      createdAt: '2025-04-15T08:30:00Z'
    },
    {
      id: 'LOAN1002',
      loanId: 'L2025002',
      clientId: 'CLIENT002',
      clientName: 'Sarah Johnson',
      amount: 10000,
      term: 24,
      interestRate: 0.065,
      dueDate: '2027-01-20',
      status: 'pending',
      purpose: 'Inventory purchase',
      collateral: 'Property deed',
      createdAt: '2025-04-10T14:45:00Z'
    },
    {
      id: 'LOAN1003',
      loanId: 'L2025003',
      clientId: 'CLIENT003',
      clientName: 'Michael Brown',
      amount: 2500,
      term: 6,
      interestRate: 0.09,
      dueDate: '2025-09-05',
      status: 'overdue',
      purpose: 'Working capital',
      collateral: 'Vehicle title',
      createdAt: '2025-03-05T11:20:00Z'
    },
    {
      id: 'LOAN1004',
      loanId: 'L2025004',
      clientId: 'CLIENT004',
      clientName: 'Emily Wilson',
      amount: 15000,
      term: 36,
      interestRate: 0.055,
      dueDate: '2028-04-12',
      status: 'active',
      purpose: 'Equipment purchase',
      collateral: 'Business assets',
      createdAt: '2025-04-12T09:15:00Z'
    },
    {
      id: 'LOAN1005',
      loanId: 'L2025005',
      clientId: 'CLIENT005',
      clientName: 'David Garcia',
      amount: 7500,
      term: 18,
      interestRate: 0.07,
      dueDate: '2026-08-30',
      status: 'completed',
      purpose: 'Debt consolidation',
      collateral: 'Savings account',
      createdAt: '2025-02-28T16:40:00Z'
    }
  ];
  
  // Apply filters if provided
  let filteredLoans = [...loans];
  
  if (filters.status && filters.status !== 'all') {
    filteredLoans = filteredLoans.filter(loan => loan.status === filters.status);
  }
  
  if (filters.clientId) {
    filteredLoans = filteredLoans.filter(loan => loan.clientId === filters.clientId);
  }
  
  // Apply date range filter if applicable
  if (filters.date && filters.date !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(filters.date) {
      case 'today':
        filteredLoans = filteredLoans.filter(loan => {
          const loanDate = new Date(loan.createdAt);
          return loanDate >= today;
        });
        break;
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        filteredLoans = filteredLoans.filter(loan => {
          const loanDate = new Date(loan.createdAt);
          return loanDate >= weekStart;
        });
        break;
      case 'this_month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredLoans = filteredLoans.filter(loan => {
          const loanDate = new Date(loan.createdAt);
          return loanDate >= monthStart;
        });
        break;
      case 'last_month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredLoans = filteredLoans.filter(loan => {
          const loanDate = new Date(loan.createdAt);
          return loanDate >= lastMonthStart && loanDate < thisMonthStart;
        });
        break;
      default:
        break;
    }
  }
  
  return filteredLoans;
};

// Helper function to generate mock disbursement data for development
const getMockDisbursements = (filters = {}) => {
  const disbursements = [
    {
      id: 'DISB1001',
      loanId: 'L2025001',
      clientId: 'CLIENT001',
      clientName: 'John Smith',
      amount: 5000,
      date: '2025-04-15',
      status: 'completed',
      method: 'Bank transfer',
      reference: 'REF2025001',
      notes: 'First disbursement'
    },
    {
      id: 'DISB1002',
      loanId: 'L2025002',
      clientId: 'CLIENT002',
      clientName: 'Sarah Johnson',
      amount: 5000,
      date: '2025-04-10',
      status: 'pending',
      method: 'Direct deposit',
      reference: 'REF2025002',
      notes: 'Pending approval'
    },
    {
      id: 'DISB1003',
      loanId: 'L2025003',
      clientId: 'CLIENT003',
      clientName: 'Michael Brown',
      amount: 2500,
      date: '2025-03-05',
      status: 'completed',
      method: 'Check',
      reference: 'REF2025003',
      notes: 'Check #1234'
    },
    {
      id: 'DISB1004',
      loanId: 'L2025004',
      clientId: 'CLIENT004',
      clientName: 'Emily Wilson',
      amount: 7500,
      date: '2025-04-12',
      status: 'pending',
      method: 'Bank transfer',
      reference: 'REF2025004',
      notes: 'First installment'
    },
    {
      id: 'DISB1005',
      loanId: 'L2025004',
      clientId: 'CLIENT004',
      clientName: 'Emily Wilson',
      amount: 7500,
      date: '2025-04-25',
      status: 'pending',
      method: 'Bank transfer',
      reference: 'REF2025005',
      notes: 'Second installment'
    },
    {
      id: 'DISB1006',
      loanId: 'L2025005',
      clientId: 'CLIENT005',
      clientName: 'David Garcia',
      amount: 7500,
      date: '2025-02-28',
      status: 'cancelled',
      method: 'Direct deposit',
      reference: 'REF2025006',
      notes: 'Cancelled by client'
    }
  ];
  
  // Apply filters if provided
  let filteredDisbursements = [...disbursements];
  
  if (filters.status && filters.status !== 'all') {
    filteredDisbursements = filteredDisbursements.filter(disb => disb.status === filters.status);
  }
  
  // Apply date range filter if applicable
  if (filters.date && filters.date !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(filters.date) {
      case 'today':
        filteredDisbursements = filteredDisbursements.filter(disb => {
          const disbDate = new Date(disb.date);
          return disbDate.toDateString() === today.toDateString();
        });
        break;
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        filteredDisbursements = filteredDisbursements.filter(disb => {
          const disbDate = new Date(disb.date);
          return disbDate >= weekStart;
        });
        break;
      case 'this_month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredDisbursements = filteredDisbursements.filter(disb => {
          const disbDate = new Date(disb.date);
          return disbDate >= monthStart;
        });
        break;
      case 'last_month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredDisbursements = filteredDisbursements.filter(disb => {
          const disbDate = new Date(disb.date);
          return disbDate >= lastMonthStart && disbDate < thisMonthStart;
        });
        break;
      default:
        break;
    }
  }
  
  return filteredDisbursements;
};

// Helper function to generate mock repayment data for development
const getMockRepayments = (filters = {}) => {
  const repayments = [
    {
      id: 'REP1001',
      loanId: 'L2025001',
      clientId: 'CLIENT001',
      clientName: 'John Smith',
      dueAmount: 458.33,
      paidAmount: 458.33,
      dueDate: '2025-05-15',
      paymentDate: '2025-05-14',
      status: 'paid',
      method: 'Bank transfer',
      reference: 'PMT2025001',
      notes: 'Monthly payment'
    },
    {
      id: 'REP1002',
      loanId: 'L2025001',
      clientId: 'CLIENT001',
      clientName: 'John Smith',
      dueAmount: 458.33,
      paidAmount: 0,
      dueDate: '2025-06-15',
      paymentDate: null,
      status: 'pending',
      method: null,
      reference: null,
      notes: null
    },
    {
      id: 'REP1003',
      loanId: 'L2025002',
      clientId: 'CLIENT002',
      clientName: 'Sarah Johnson',
      dueAmount: 875.00,
      paidAmount: 500.00,
      dueDate: '2025-05-10',
      paymentDate: '2025-05-10',
      status: 'partial',
      method: 'Direct deposit',
      reference: 'PMT2025002',
      notes: 'Partial payment, remainder due by end of month'
    },
    {
      id: 'REP1004',
      loanId: 'L2025003',
      clientId: 'CLIENT003',
      clientName: 'Michael Brown',
      dueAmount: 433.33,
      paidAmount: 0,
      dueDate: '2025-05-05',
      paymentDate: null,
      status: 'overdue',
      method: null,
      reference: null,
      notes: 'Client contacted for payment on 2025-05-06'
    },
    {
      id: 'REP1005',
      loanId: 'L2025004',
      clientId: 'CLIENT004',
      clientName: 'Emily Wilson',
      dueAmount: 456.25,
      paidAmount: 456.25,
      dueDate: '2025-05-12',
      paymentDate: '2025-05-11',
      status: 'paid',
      method: 'Bank transfer',
      reference: 'PMT2025003',
      notes: 'Paid early'
    },
    {
      id: 'REP1006',
      loanId: 'L2025004',
      clientId: 'CLIENT004',
      clientName: 'Emily Wilson',
      dueAmount: 456.25,
      paidAmount: 0,
      dueDate: '2025-06-12',
      paymentDate: null,
      status: 'pending',
      method: null,
      reference: null,
      notes: null
    },
    {
      id: 'REP1007',
      loanId: 'L2025005',
      clientId: 'CLIENT005',
      clientName: 'David Garcia',
      dueAmount: 458.33,
      paidAmount: 458.33,
      dueDate: '2025-03-28',
      paymentDate: '2025-03-27',
      status: 'paid',
      method: 'Check',
      reference: 'PMT2025004',
      notes: 'Check #5678'
    },
    {
      id: 'REP1008',
      loanId: 'L2025005',
      clientId: 'CLIENT005',
      clientName: 'David Garcia',
      dueAmount: 458.33,
      paidAmount: 458.33,
      dueDate: '2025-04-28',
      paymentDate: '2025-04-26',
      status: 'paid',
      method: 'Check',
      reference: 'PMT2025005',
      notes: 'Check #5679'
    }
  ];
  
  // Apply filters if provided
  let filteredRepayments = [...repayments];
  
  if (filters.status && filters.status !== 'all') {
    filteredRepayments = filteredRepayments.filter(rep => rep.status === filters.status);
  }
  
  if (filters.overdue && filters.overdue !== 'all') {
    if (filters.overdue === 'yes') {
      filteredRepayments = filteredRepayments.filter(rep => rep.status === 'overdue');
    } else if (filters.overdue === 'no') {
      filteredRepayments = filteredRepayments.filter(rep => rep.status !== 'overdue');
    }
  }
  
  // Apply date range filter if applicable
  if (filters.date && filters.date !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(filters.date) {
      case 'today':
        filteredRepayments = filteredRepayments.filter(rep => {
          // Filter by due date
          const dueDate = new Date(rep.dueDate);
          return dueDate.toDateString() === today.toDateString();
        });
        break;
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        filteredRepayments = filteredRepayments.filter(rep => {
          const dueDate = new Date(rep.dueDate);
          return dueDate >= weekStart;
        });
        break;
      case 'this_month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredRepayments = filteredRepayments.filter(rep => {
          const dueDate = new Date(rep.dueDate);
          return dueDate >= monthStart;
        });
        break;
      case 'last_month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredRepayments = filteredRepayments.filter(rep => {
          const dueDate = new Date(rep.dueDate);
          return dueDate >= lastMonthStart && dueDate < thisMonthStart;
        });
        break;
      default:
        break;
    }
  }
  
  return filteredRepayments;
};