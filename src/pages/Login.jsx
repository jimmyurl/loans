import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = ({ setSession, supabase }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page they were trying to visit (if any)
  const from = location.state?.from || '/dashboard';

  // Make sure to clear any stale sessions when visiting the login page
  useEffect(() => {
    const clearSessionOnLoginPage = async () => {
      try {
        // Sign out from Supabase when visiting login page
        await supabase.auth.signOut();
        console.log('Previous session cleared');
        
        // Also clear the session storage
        sessionStorage.removeItem('auth');
      } catch (err) {
        console.error('Session clear error:', err);
      }
    };
    
    clearSessionOnLoginPage();
  }, [supabase]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', email);
      
      // Real authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }
      
      console.log('Login successful, session:', data?.session);
      
      if (data?.session) {
        setSession(data.session);
        sessionStorage.setItem('auth', JSON.stringify(data.session));
        
        // Redirect to original destination or dashboard after successful login
        console.log(`Navigating to ${from}...`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          ASSE <span>Microfinance</span>
        </div>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <button 
              type="submit" 
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </div>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="#/register">Register</a></p>
          <p><a href="#/forgot-password">Forgot Password?</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;