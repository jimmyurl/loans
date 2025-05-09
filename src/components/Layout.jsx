// src/components/Layout.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AuthContext } from '../App';

const Layout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { session, supabase } = useContext(AuthContext);
  
  // Determine active nav item based on the current path
  const isActive = (path) => {
    const currentMainPath = '/' + location.pathname.split('/')[1];
    return currentMainPath === path ? 'text-white font-bold' : '';
  };
  
  // Determine active sidebar item based on the current path
  const isSidebarActive = (path) => {
    return location.pathname === path ? 'bg-gray-200 font-medium' : '';
  };

  // Generate dynamic sidebar links based on current path
  const getSidebarLinks = () => {
    // Links that are actually routed in the application
    return [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/new-loan', label: 'New Loan' },
      { path: '/new-client', label: 'New Client' },
      { path: '/disbursements', label: 'Disbursements' },
      { path: '/repayments', label: 'Repayments' },
      { path: '/reports', label: 'Generate Reports' },
      { path: '/settings', label: 'Settings' }
    ];
  };

  // Load user data from session
  useEffect(() => {
    if (session) {
      setUser(session.user);
      console.log("User set from session:", session.user);
    } else {
      console.log("No session found in Layout, redirecting");
      // If we have no session but we're in a protected route, redirect to login
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const handleLogout = async () => {
    try {
      console.log("Logging out");
      // Use Supabase auth to sign out properly
      await supabase.auth.signOut();
      // Navigate to login page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear session storage and redirect anyway
      sessionStorage.removeItem('auth');
      navigate('/', { replace: true });
    }
  };

  // If no user is loaded yet, show a simple loading indicator
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-blue-600 text-lg">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="logo font-bold text-xl">
            <Link to="/dashboard">ASSE <span className="font-normal">Microfinance</span></Link>
          </div>
          
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link to="/dashboard" className={`hover:text-blue-200 ${isActive('/dashboard')}`}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/loans" className={`hover:text-blue-200 ${isActive('/loans')}`}>
                  Loans
                </Link>
              </li>
              <li>
                <Link to="/clients" className={`hover:text-blue-200 ${isActive('/clients')}`}>
                  Clients
                </Link>
              </li>
              <li>
                <Link to="/reports" className={`hover:text-blue-200 ${isActive('/reports')}`}>
                  Reports
                </Link>
              </li>
              <li>
                <Link to="/settings" className={`hover:text-blue-200 ${isActive('/settings')}`}>
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="user-menu flex items-center space-x-4">
            <span className="user-email text-sm">{user?.email || 'User'}</span>
            <button 
              onClick={handleLogout}
              className="logout-button flex items-center px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm"
            >
              <LogOut size={16} className="mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 flex-grow flex">
        <div className="main-content flex flex-col md:flex-row w-full py-6">
          {/* Sidebar */}
          <div className="sidebar w-full md:w-64 bg-gray-50 p-4 mb-4 md:mb-0 md:mr-6 rounded shadow">
            <h3 className="font-bold text-lg mb-4 text-gray-700">Quick Actions</h3>
            <ul className="space-y-2">
              {getSidebarLinks().map(link => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`block p-2 rounded hover:bg-gray-200 ${isSidebarActive(link.path)}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left p-2 rounded hover:bg-gray-200 text-red-600"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
          
          {/* Main Content - uses Outlet for nested routes */}
          <div className="content flex-grow bg-white p-6 rounded shadow">
            <Outlet />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          © 2025 ASSE Microfinance. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;