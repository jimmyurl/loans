import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
// Import other pages as needed
// import Register from './pages/Register';
// import ForgotPassword from './pages/ForgotPassword';

// Initialize Supabase client - use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xfihpvkbzppaejluyqoq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaWhwdmtienBwYWVqbHV5cW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NDQzMzgsImV4cCI6MjA0NDEyMDMzOH0.U30_ovXdjGrovUZhBeVbeXtX-Xg29BPNZF9mhz7USfM';
const supabase = createClient(supabaseUrl, supabaseKey);

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
          // Update sessionStorage for compatibility
          sessionStorage.setItem('auth', JSON.stringify(data.session));
        } else {
          console.log('No valid session found in protected route');
          setIsAuthenticated(false);
          // Clear any stale session data
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
    // Show loading indicator while checking authentication
    return (
      <div className="container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-blue-600 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated, preserving the intended URL
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  // Render the protected component if authenticated
  return children;
};

const App = () => {
  const [session, setSession] = useState(null);
  
  // Set up auth state change listener
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

    // Check initial session on mount
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    };
    
    getInitialSession();

    // Clean up subscription on unmount
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login setSession={setSession} supabase={supabase} />} />
        {/* Add other public routes as needed */}
        {/* <Route path="/register" element={<Register supabase={supabase} />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPassword supabase={supabase} />} /> */}

        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard session={session} />
            </ProtectedRoute>
          } 
        />
        {/* Add other protected routes as needed */}
        <Route 
          path="/loans" 
          element={
            <ProtectedRoute>
              <div>Loans Page</div> {/* Replace with your Loans component */}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/clients" 
          element={
            <ProtectedRoute>
              <div>Clients Page</div> {/* Replace with your Clients component */}
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route - redirect to dashboard if logged in, otherwise to login */}
        <Route 
          path="*" 
          element={
            session ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;