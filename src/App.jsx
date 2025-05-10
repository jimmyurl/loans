// src/App.jsx
import { useState, useEffect, createContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { AlertProvider } from './context/AlertContext';
import Alert from './components/Alert';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Layout from './components/Layout';
import ClientsPage from './pages/ClientsPage';
import LoansPage from './pages/LoansPage';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NewLoanPage from './pages/NewLoanPage';
import NewClientPage from './pages/NewClientPage';
import Disbursements from './pages/Disbursements';
import Repayments from './pages/Repayments';
import LoanDetail from './pages/loans/LoanDetail';
import LoanList from './pages/loans/LoanList';
import LoanForm from './pages/loans/LoanForm';

// Initialize Supabase client - use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xfihpvkbzppaejluyqoq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaWhwdmtienBwYWVqbHV5cW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NDQzMzgsImV4cCI6MjA0NDEyMDMzOH0.U30_ovXdjGrovUZhBeVbeXtX-Xg29BPNZF9mhz7USfM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Create auth context
export const AuthContext = createContext(null);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for valid session with Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error);
          setIsAuthenticated(false);
        } else if (data?.session) {
          console.log('Valid session found in protected route');
          setIsAuthenticated(true);
          sessionStorage.setItem('auth', JSON.stringify(data.session));
        } else {
          console.log('No valid session found in protected route');
          setIsAuthenticated(false);
          sessionStorage.removeItem('auth');
        }
      } catch (err) {
        console.error('Auth check exception:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  return children;
};

const App = () => {
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event);
        if (event === 'SIGNED_IN' && newSession) {
          setSession(newSession);
          sessionStorage.setItem('auth', JSON.stringify(newSession));
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          sessionStorage.removeItem('auth');
        }
      }
    );

    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Initial session check:", data);
        setSession(data?.session || null);
      } catch (error) {
        console.error("Error getting initial session:", error);
      }
    };
    
    getInitialSession();

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AlertProvider>
      <AuthContext.Provider value={{ session, supabase }}>
        <HashRouter>
          <Alert /> {/* Global alert component */}
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login setSession={setSession} supabase={supabase} />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Loans routes */}
              <Route path="loans" element={<LoansPage />}>
                <Route index element={<LoanList />} />
              </Route>
              <Route path="loans/:id" element={<LoanDetail />} />
              <Route path="loans/edit/:id" element={<LoanForm />} />
              <Route path="new-loan" element={<NewLoanPage />} />
              
              {/* Clients routes */}
              <Route path="clients" element={<ClientsPage />} />
              <Route path="new-client" element={<NewClientPage />} />
              
              {/* Financial operations */}
              <Route path="disbursements" element={<Disbursements />} />
              <Route path="repayments" element={<Repayments />} />
              
              {/* Reports and settings */}
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Catch-all route */}
            <Route 
              path="*" 
              element={
                session ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
              } 
            />
          </Routes>
        </HashRouter>
      </AuthContext.Provider>
    </AlertProvider>
  );
};

export default App;