// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xfihpvkbzppaejluyqoq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaWhwdmtienBwYWVqbHV5cW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NDQzMzgsImV4cCI6MjA0NDEyMDMzOH0.U30_ovXdjGrovUZhBeVbeXtX-Xg29BPNZF9mhz7USfM';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility functions for working with loans and clients

// Client functions
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  return data;
};

export const getClientById = async (id) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    throw error;
  }

  return data;
};

export const addClient = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select();

  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }

  return data[0];
};

export const updateClient = async (id, clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }

  return data[0];
};

export const searchClients = async (searchTerm) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching clients:', error);
    throw error;
  }

  return data;
};

// Loan functions
export const getLoans = async () => {
  const { data, error } = await supabase
    .from('loan_summaries')
    .select('*')
    .order('disbursement_date', { ascending: false });

  if (error) {
    console.error('Error fetching loans:', error);
    throw error;
  }

  return data;
};

export const getLoanById = async (id) => {
  const { data, error } = await supabase
    .from('loan_summaries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching loan:', error);
    throw error;
  }

  return data;
};

export const createLoan = async (loanData) => {
  // If the loan_number is not provided, it will be auto-generated by the trigger
  const { data, error } = await supabase
    .from('loans')
    .insert([loanData])
    .select();

  if (error) {
    console.error('Error creating loan:', error);
    throw error;
  }

  return data[0];
};

export const updateLoan = async (id, loanData) => {
  const { data, error } = await supabase
    .from('loans')
    .update(loanData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating loan:', error);
    throw error;
  }

  return data[0];
};

export const searchLoans = async (searchTerm) => {
  const { data, error } = await supabase
    .from('loan_summaries')
    .select('*')
    .or(`loan_number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%`)
    .order('disbursement_date', { ascending: false });

  if (error) {
    console.error('Error searching loans:', error);
    throw error;
  }

  return data;
};

// Payment functions
export const getPaymentsByLoanId = async (loanId) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('loan_id', loanId)
    .order('payment_date', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }

  return data;
};

export const createPayment = async (paymentData) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select();

  if (error) {
    console.error('Error creating payment:', error);
    throw error;
  }

  return data[0];
};

// Dashboard functions
export const getDashboardStats = async () => {
  // Get counts of loans by status
  const { data: statusCounts, error: statusError } = await supabase
    .from('loans')
    .select('status, count(*)', { count: 'exact' })
    .group('status');

  if (statusError) {
    console.error('Error fetching loan status counts:', statusError);
    throw statusError;
  }

  // Get total disbursed amount
  const { data: totalData, error: totalError } = await supabase
    .from('loans')
    .select('SUM(principal_amount) as total_disbursed');

  if (totalError) {
    console.error('Error fetching total disbursed:', totalError);
    throw totalError;
  }

  // Get monthly disbursement and repayment data for charts
  const { data: monthlyData, error: monthlyError } = await supabase.rpc('get_monthly_stats');

  if (monthlyError) {
    console.error('Error fetching monthly stats:', monthlyError);
    throw monthlyError;
  }

  return {
    statusCounts,
    totalDisbursed: totalData[0]?.total_disbursed || 0,
    monthlyData: monthlyData || []
  };
};

// Function to get monthly stats - this needs to be created as a stored procedure in Supabase
/*
CREATE OR REPLACE FUNCTION get_monthly_stats()
RETURNS TABLE (
  month TEXT,
  year INTEGER,
  disbursed NUMERIC,
  repaid NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT date_trunc('month', m)::date AS month_start
    FROM generate_series(
      date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
      date_trunc('month', CURRENT_DATE),
      '1 month'
    ) m
  ),
  disbursements AS (
    SELECT 
      date_trunc('month', disbursement_date)::date AS month_start,
      SUM(principal_amount) AS amount
    FROM loans
    WHERE disbursement_date >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY month_start
  ),
  repayments AS (
    SELECT 
      date_trunc('month', payment_date)::date AS month_start,
      SUM(amount) AS amount
    FROM payments
    WHERE payment_date >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY month_start
  )
  SELECT 
    to_char(m.month_start, 'Mon') AS month,
    EXTRACT(YEAR FROM m.month_start)::INTEGER AS year,
    COALESCE(d.amount, 0) AS disbursed,
    COALESCE(r.amount, 0) AS repaid
  FROM months m
  LEFT JOIN disbursements d ON m.month_start = d.month_start
  LEFT JOIN repayments r ON m.month_start = r.month_start
  ORDER BY m.month_start;
END;
$$ LANGUAGE plpgsql;
*/