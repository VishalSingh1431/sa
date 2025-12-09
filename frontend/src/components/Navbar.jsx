import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuthStatus();

    // Listen for storage changes (when login/logout happens from other tabs)
    window.addEventListener('storage', checkAuthStatus);
    
    // Listen for custom auth event (for same-tab updates)
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAdminDropdownOpen && !event.target.closest('.relative')) {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdminDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setIsMobileMenuOpen(false);
    // Dispatch event to update navbar in other components
    window.dispatchEvent(new Event('authChange'));
    // Redirect to home
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-b border-gray-200/50 relative transition-all duration-300">
      <div className="w-full px-4 sm:px-4 lg:px-6 relative z-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Image at Left */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/images/Logo.webp" 
                alt="VaranasiHub Logo" 
                className="h-12 md:h-16 w-auto drop-shadow-md object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1 flex-1 justify-center">
            {/* Navigation links removed - only auth buttons */}
          </div>

          {/* Desktop Right Side - Sign Up and Login */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {isLoggedIn ? (
              <>
                {(user?.role === 'admin' || user?.role === 'main_admin') && (
                  <div className="relative">
                    <button
                      onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all duration-300 shadow-lg"
                    >
                      Admin Panel
                      <ChevronDown className={`w-4 h-4 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isAdminDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                        <Link
                          to="/admin/trips"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          🎒 Manage Trips
                        </Link>
                        <Link
                          to="/admin/certificates"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          📜 Manage Certificates
                        </Link>
                        <Link
                          to="/admin/destinations"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          🌍 Manage Destinations
                        </Link>
                        <Link
                          to="/admin/reviews"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          ⭐ Manage Reviews
                        </Link>
                        <Link
                          to="/admin/written-reviews"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          ✍️ Manage Written Reviews
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name || user?.email || 'User'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-black hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    location.pathname === '/login'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-black hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-2 border-black py-4">
            <div className="flex flex-col space-y-1">
              {/* Mobile Auth Buttons */}
              {isLoggedIn ? (
                <>
                  {(user?.role === 'admin' || user?.role === 'main_admin') && (
                    <div className="mb-2 space-y-1">
                      <div className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl">
                        Admin Panel
                      </div>
                      <Link
                        to="/admin/trips"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        🎒 Manage Trips
                      </Link>
                      <Link
                        to="/admin/certificates"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        📜 Manage Certificates
                      </Link>
                      <Link
                        to="/admin/destinations"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        🌍 Manage Destinations
                      </Link>
                      <Link
                        to="/admin/reviews"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        ⭐ Manage Reviews
                      </Link>
                      <Link
                        to="/admin/written-reviews"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        ✍️ Manage Written Reviews
                      </Link>
                    </div>
                  )}
                  <div className="pt-2 border-t-2 border-black mt-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span className="font-medium">{user?.name || user?.email || 'User'}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full mt-2 px-4 py-2 text-sm font-medium text-black hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="pt-2 border-t-2 border-black mt-2 space-y-2">
                    <Link
                      to="/login"
                      className={`block w-full px-4 py-2 text-center text-sm font-medium rounded-xl transition-all duration-200 ${
                        location.pathname === '/login'
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-black hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-[#22c55e] hover:bg-[#16a34a] rounded-xl transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
