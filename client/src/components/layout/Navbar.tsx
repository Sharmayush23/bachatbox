import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [location] = useLocation();

  const isActiveLink = (path: string) => location === path;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-wallet mr-2 text-primary"></i>
              <span className="text-lg font-semibold text-primary">BachatBox</span>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link href="/dashboard">
              <a className={`px-3 py-2 text-sm font-medium ${isActiveLink("/dashboard") ? "text-primary" : "text-foreground hover:text-primary"} transition-colors`}>
                Dashboard
              </a>
            </Link>
            <Link href="/transactions">
              <a className={`px-3 py-2 text-sm font-medium ${isActiveLink("/transactions") ? "text-primary" : "text-foreground hover:text-primary"} transition-colors`}>
                Transactions
              </a>
            </Link>
            <Link href="/goals">
              <a className={`px-3 py-2 text-sm font-medium ${isActiveLink("/goals") ? "text-primary" : "text-foreground hover:text-primary"} transition-colors`}>
                Goals
              </a>
            </Link>
            <Link href="/wallet">
              <a className={`px-3 py-2 text-sm font-medium ${isActiveLink("/wallet") ? "text-primary" : "text-foreground hover:text-primary"} transition-colors`}>
                Wallet
              </a>
            </Link>
          </div>
          <div className="flex items-center">
            <button 
              onClick={toggleTheme} 
              className="rounded-full p-1 text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <div className="ml-3 relative">
              <div>
                <button 
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={logout}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <i className="fas fa-user text-background"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="sm:hidden flex items-center">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-card border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/dashboard">
              <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActiveLink("/dashboard") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                Dashboard
              </a>
            </Link>
            <Link href="/transactions">
              <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActiveLink("/transactions") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                Transactions
              </a>
            </Link>
            <Link href="/goals">
              <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActiveLink("/goals") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                Goals
              </a>
            </Link>
            <Link href="/wallet">
              <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActiveLink("/wallet") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                Wallet
              </a>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
