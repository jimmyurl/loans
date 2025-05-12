// src/components/Navbar.jsx
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { session, signOut } = useContext(AuthContext);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Updated Logo Link - now using the app-logo class */}
        <Link to="/" className="app-logo">
          MicroFin Manager
        </Link>
      </div>
      
      <div className="nav-right">
        {session ? (
          <div className="user-menu">
            <span className="user-name">
              {session.user.email}
            </span>
            <button 
              onClick={handleSignOut} 
              className="sign-out-btn"
              aria-label="Sign out"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="login-btn">Log In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;