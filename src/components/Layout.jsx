import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';

const Layout = ({ children, user, onLogout }) => {
  // States for responsive menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <div className="logo text-xl font-bold">
            ASSE <span className="font-normal">Microfinance</span>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden ml-auto text-white focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block ml-8">
            <ul className="flex space-x-6">
              <li><a href="/dashboard" className="py-2 px-1 border-b-2 border-white">Dashboard</a></li>
              <li><a href="/loans" className="py-2 px-1 hover:border-b-2 hover:border-white">Loans</a></li>
              <li><a href="/clients" className="py-2 px-1 hover:border-b-2 hover:border-white">Clients</a></li>
              <li><a href="/reports" className="py-2 px-1 hover:border-b-2 hover:border-white">Reports</a></li>
              <li><a href="/settings" className="py-2 px-1 hover:border-b-2 hover:border-white">Settings</a></li>
            </ul>
          </nav>
          
          {/* User info for desktop */}
          <div className="hidden md:flex ml-auto items-center">
            <span className="mr-4">{user?.email || 'User'}</span>
            <button 
              onClick={onLogout}
              className="bg-white bg-opacity-20 px-4 py-2 rounded hover:bg-opacity-30 flex items-center"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-800">
            <ul className="px-4 py-2">
              <li><a href="/dashboard" className="block py-2 text-white">Dashboard</a></li>
              <li><a href="/loans" className="block py-2 text-white">Loans</a></li>
              <li><a href="/clients" className="block py-2 text-white">Clients</a></li>
              <li><a href="/reports" className="block py-2 text-white">Reports</a></li>
              <li><a href="/settings" className="block py-2 text-white">Settings</a></li>
              <li>
                <button 
                  onClick={onLogout}
                  className="flex items-center py-2 text-white w-full"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout ({user?.email || 'User'})
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>
      
      <div className="container mx-auto px-4 flex-grow">
        <div className="flex flex-col md:flex-row mt-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 md:mr-8 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <ul className="bg-gray-50 rounded-md overflow-hidden shadow-sm">
              <li>
                <a href="/dashboard" className="flex px-4 py-3 border-l-4 border-blue-600 bg-blue-50 text-blue-700">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/new-loan" className="flex px-4 py-3 border-l-4 border-transparent hover:bg-gray-100">
                  New Loan
                </a>
              </li>
              <li>
                <a href="/new-client" className="flex px-4 py-3 border-l-4 border-transparent hover:bg-gray-100">
                  New Client
                </a>
              </li>
              <li>
                <a href="/disbursements" className="flex px-4 py-3 border-l-4 border-transparent hover:bg-gray-100">
                  Disbursements
                </a>
              </li>
              <li>
                <a href="/repayments" className="flex px-4 py-3 border-l-4 border-transparent hover:bg-gray-100">
                  Repayments
                </a>
              </li>
              <li>
                <a href="/reports" className="flex px-4 py-3 border-l-4 border-transparent hover:bg-gray-100">
                  Generate Reports
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {e.preventDefault(); onLogout();}}
                  className="flex px-4 py-3 border-l-4 border-transparent hover:bg-gray-100 text-red-600"
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
          
          {/* Main Content */}
          <div className="flex-grow">
            {children}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-12 py-6 bg-gray-100">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 ASSE Microfinance. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;