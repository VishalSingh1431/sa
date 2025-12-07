import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';

// Icon Components
const IconAllIndia = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity="0.2"/>
    <circle cx="12" cy="9" r="2.5" stroke="#4ECDC4" fill="#4ECDC4"/>
  </svg>
);

const IconSpiritual = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 6v4l8 4 8-4V6l-8-4z" stroke="#F093FB" fill="#F093FB" fillOpacity="0.2"/>
    <path d="M4 14l8 4 8-4" stroke="#F5576C" fill="#F5576C" fillOpacity="0.2"/>
    <path d="M4 10l8 4 8-4" stroke="#FF6B9D" fill="#FF6B9D" fillOpacity="0.2"/>
    <circle cx="12" cy="6" r="1" fill="#F093FB"/>
  </svg>
);

const IconCar = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="17" r="2" stroke="#4FACFE" fill="#4FACFE"/>
    <circle cx="19" cy="17" r="2" stroke="#00F2FE" fill="#00F2FE"/>
    <path d="M17 17H7l-2-5H2l2-6h14l2 6h-3l-2 5z" stroke="#4FACFE" fill="#4FACFE" fillOpacity="0.2"/>
    <path d="M7 10h10" stroke="#00F2FE"/>
  </svg>
);

const IconMountain = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3l4 8 5-5 5 15H2L8 3z" stroke="#A8EDEA" fill="#FED6E3" fillOpacity="0.4"/>
  </svg>
);

const IconBeach = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 18c1.5-1.5 4-3 6-2.5s3.5 2 5.5 1.5c1.5-.5 3-1 4.5-.5s3 1 3 1" stroke="#43E97B"/>
    <path d="M2 15c1.5-1.5 4-3 6-2.5s3.5 2 5.5 1.5c1.5-.5 3-1 4.5-.5s3 1 3 1" stroke="#38F9D7"/>
    <path d="M2 12c1.5-1.5 4-3 6-2.5s3.5 2 5.5 1.5c1.5-.5 3-1 4.5-.5s3 1 3 1" stroke="#43E97B"/>
    <circle cx="12" cy="10" r="1.5" stroke="#38F9D7" fill="#38F9D7"/>
    <circle cx="18" cy="8" r="1.5" stroke="#43E97B" fill="#43E97B"/>
  </svg>
);

const IconWellness = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" stroke="#FA709A" fill="#FEE140" fillOpacity="0.3"/>
    <path d="M12 8v8M8 12h8" stroke="#FA709A"/>
  </svg>
);

const menuItems = [
  { 
    label: 'All India Trips', 
    hasDropdown: true,
    Icon: IconAllIndia
  },
  { 
    label: 'Spiritual Trails', 
    hasDropdown: true,
    Icon: IconSpiritual
  },
  { 
    label: 'Car Booking', 
    hasDropdown: false,
    Icon: IconCar
  },
  { 
    label: 'Himalayan Escapes', 
    hasDropdown: true,
    Icon: IconMountain
  },
  { 
    label: 'Beach & Island Breaks', 
    hasDropdown: false,
    Icon: IconBeach
  },
  { 
    label: 'Wellness Retreats', 
    hasDropdown: false,
    Icon: IconWellness
  }
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter trips
      // You can customize this based on your routing needs
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="w-full border-b border-gray-100 bg-white px-4 py-4 shadow-sm lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4 lg:justify-start">
            <Link to="/">
              <img
                src="/images/Logo.webp"
                alt="Capture A Trip"
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
            </Link>
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-[#017233] hover:bg-gray-100 transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex w-full flex-1 items-center gap-3 rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-500 lg:max-w-2xl">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-gray-500 flex-shrink-0"
              aria-hidden="true"
            >
              <path
                d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79L20 21.5 21.5 20l-5.5-6zM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                fill="currentColor"
              />
            </svg>
            <input
              type="search"
              placeholder="Search your trip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </form>

          <div className="hidden lg:flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-gray-900 lg:w-auto lg:justify-end">
            <a
              href="tel:+918448801998"
              className="flex items-center gap-2 whitespace-nowrap text-gray-900 transition-colors hover:text-[#017233]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-gray-900"
                aria-hidden="true"
              >
                <path
                  d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 .97-.26 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1v3.61a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1h3.61a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.26.97z"
                  fill="currentColor"
                />
              </svg>
              <span>(+91) 8448801998</span>
            </a>
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:text-[#017233]"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name || user?.email || 'User'}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Menu Items */}
        <div className="hidden lg:flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-semibold text-gray-900 lg:justify-between">
          {menuItems.map((item) => {
            const IconComponent = item.Icon;
            return (
              <button
                key={item.label}
                type="button"
                className="flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#017233]"
              >
                <span className="flex-shrink-0">
                  <IconComponent />
                </span>
                <span>{item.label}</span>
                {item.hasDropdown && (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path
                      d="M7 10l5 5 5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 pt-4 space-y-4">
            {/* Mobile Phone & Login */}
            <div className="flex flex-col gap-3">
              <a
                href="tel:+918448801998"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-[#017233]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-gray-900"
                  aria-hidden="true"
                >
                  <path
                    d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 .97-.26 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1v3.61a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1h3.61a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.26.97z"
                    fill="currentColor"
                  />
                </svg>
                <span>(+91) 8448801998</span>
              </a>
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:text-[#017233]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>{user?.name || user?.email || 'User'}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Items */}
            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
              {menuItems.map((item) => {
                const IconComponent = item.Icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 transition-colors hover:text-[#017233]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex-shrink-0">
                      <IconComponent />
                    </span>
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 ml-auto" aria-hidden="true">
                        <path
                          d="M7 10l5 5 5-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
