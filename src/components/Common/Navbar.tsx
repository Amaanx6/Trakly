import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut, Calendar, CheckSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-dark sticky top-0 z-50 px-4 py-3">
      <div className="container-xl flex items-center justify-between">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary-500" />
          <span className="font-bold text-xl">AssignTrack</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-dark-300 hover:text-white transition-colors flex items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                <span>Tasks</span>
              </Link>
              <Link to="/calendar" className="text-dark-300 hover:text-white transition-colors flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </Link>
              <div className="border-l border-dark-700 h-6 mx-2"></div>
              <div className="text-dark-300">
                Hi, {user?.name || user?.email}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 glass-dark mt-1 p-4 flex flex-col gap-4 md:hidden fadeIn">
            {isAuthenticated ? (
              <>
                <div className="text-dark-300 mb-2">
                  Hi, {user?.name || user?.email}
                </div>
                <Link 
                  to="/dashboard" 
                  className="text-dark-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  <CheckSquare className="h-5 w-5" />
                  <span>Tasks</span>
                </Link>
                <Link 
                  to="/calendar" 
                  className="text-dark-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Calendar</span>
                </Link>
                <div className="border-t border-dark-700 my-2"></div>
                <Button 
                  variant="ghost" 
                  fullWidth 
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-5 w-5" />}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" fullWidth>
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;