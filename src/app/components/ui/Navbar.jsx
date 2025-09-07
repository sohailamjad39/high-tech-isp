// components/ui/Navbar.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from 'next/navigation';

// Confirmation Dialog Component
function ConfirmationDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm"
        onClick={onCancel}
      ></div>
      
      {/* Dialog */}
      <div className="relative bg-white shadow-xl mx-4 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="flex justify-center items-center bg-red-100 rounded-full w-12 h-12">
            <svg 
              className="w-6 h-6 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>
        
        <h3 className="mb-2 font-medium text-gray-900 text-lg text-center">{title}</h3>
        <p className="mb-6 text-gray-600 text-center">{message}</p>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Create a simple session context that can be initialized from props
export default function Navbar({ initialSession = null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [session, setSession] = useState(initialSession);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Update session state when initialSession changes
  useEffect(() => {
    if (initialSession !== null) {
      setSession(initialSession);
    }
  }, [initialSession]);

  // Fetch session on mount if not provided
  useEffect(() => {
    if (!initialSession) {
      const fetchSession = async () => {
        try {
          const res = await fetch('/api/auth/session');
          const data = await res.json();
          setSession(data.user ? { user: data.user } : null);
        } catch (error) {
          setSession(null);
        }
      };
      fetchSession();
    }
  }, [initialSession]);

  // Close the mobile menu when the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close the mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navbar = document.querySelector('nav');
      if (isMenuOpen && navbar && !navbar.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('user-dropdown');
      if (isDropdownOpen && dropdown && !dropdown.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Close confirmation dialog
      setShowLogoutConfirm(false);
      
      // Clear the session state immediately
      setSession(null);
      
      // Call the logout API
      await fetch('/api/auth/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Redirect to home
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if there's an error
      router.push('/');
      router.refresh();
    }
  };

  // Get user role for menu item logic
  const userRole = session?.user?.role || 'visitor';

  // Define menu items based on user role
  const getMenuItems = () => {
    if (userRole === 'visitor') {
      return [
        { href: '/dashboard/profile', label: 'Profile' },
        { href: '/dashboard/settings', label: 'Settings' },
      ];
    } else if (userRole === 'customer') {
      return [
        { href: '/dashboard/overview', label: 'Dashboard' },
        { href: '/dashboard/subscription', label: 'Internet Plan' },
        { href: '/dashboard/billing', label: 'Bills' },
        { href: '/dashboard/profile', label: 'Profile' },
        { href: '/dashboard/settings', label: 'Settings' },
      ];
    } else if (userRole === 'admin') {
      return [
        { href: '/dashboard/overview', label: 'Dashboard' },
        { href: '/admin/customers', label: 'Manage Users' },
        { href: '/admin/plans', label: 'Manage Plans' },
        { href: '/admin/billing', label: 'Billing History' },
        { href: '/admin/reports', label: 'Reports' },
        { href: '/admin/coverage', label: 'Coverage Map' },
        { href: '/admin/settings', label: 'Settings' },
      ];
    } else if (userRole === 'tech') {
      return [
        { href: '/dashboard/overview', label: 'Dashboard' },
        { href: '/tech/jobs', label: 'My Jobs' },
        { href: '/tech/schedule', label: 'Schedule' },
        { href: '/tech/profile', label: 'Profile' },
        { href: '/tech/settings', label: 'Settings' },
      ];
    } else if (userRole === 'support') {
      return [
        { href: '/dashboard/overview', label: 'Dashboard' },
        { href: '/support/tickets', label: 'Tickets' },
        { href: '/support/customers', label: 'Customer Lookup' },
        { href: '/support/profile', label: 'Profile' },
        { href: '/support/settings', label: 'Settings' },
      ];
    } else if (userRole === 'ops') {
      return [
        { href: '/dashboard/overview', label: 'Dashboard' },
        { href: '/ops/network', label: 'Network' },
        { href: '/ops/outages', label: 'Outages' },
        { href: '/ops/installations', label: 'Installations' },
        { href: '/ops/profile', label: 'Profile' },
        { href: '/ops/settings', label: 'Settings' },
      ];
    } else {
      // Default for any other role
      return [
        { href: '/dashboard/overview', label: 'Dashboard' },
        { href: '/dashboard/profile', label: 'Profile' },
        { href: '/dashboard/settings', label: 'Settings' },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      <nav className="top-0 right-0 left-0 z-50 fixed bg-transparent shadow-sm backdrop-blur-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center">
              <Link
                href="/"
                className="font-bold text-2xl transition-colors duration-200"
                style={{ color: "#1a6ea4" }}
              >
                HIGH TECH
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="px-3 py-2 font-medium text-gray-700 hover:text-sky-800 text-sm transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/plans"
                className="px-3 py-2 font-medium text-gray-700 hover:text-sky-800 text-sm transition-colors duration-200"
              >
                Plans & Pricing
              </Link>
              <Link
                href="/coverage"
                className="px-3 py-2 font-medium text-gray-700 hover:text-sky-800 text-sm transition-colors duration-200"
              >
                Coverage Map
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 font-medium text-gray-700 hover:text-sky-800 text-sm transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 font-medium text-gray-700 hover:text-sky-800 text-sm transition-colors duration-200"
              >
                Contact
              </Link>
            </div>

            {/* Desktop Auth Button/Dropdown */}
            <div className="hidden md:flex items-center">
              {session ? (
                // User is logged in - show profile dropdown
                <div className="relative" id="user-dropdown">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 bg-white/80 hover:bg-white p-1 border border-white/30 rounded-full transition-all duration-200"
                  >
                    <div className="flex justify-center items-center bg-gradient-to-r from-[#2f83aa] to-[#3f88cc] rounded-full w-8 h-8 font-medium text-white text-sm">
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium text-gray-700 text-sm">
                      {session.user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="right-0 z-50 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-md w-48 overflow-hidden">
                      <div className="py-1">
                        {menuItems.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className="block hover:bg-gray-100 px-4 py-2 text-gray-700 hover:text-gray-900 text-sm transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                        <hr className="my-1 border-gray-200" />
                        <button
                          onClick={() => setShowLogoutConfirm(true)}
                          className="block hover:bg-red-50 px-4 py-2 w-full text-red-600 hover:text-red-700 text-sm text-left transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // User is not logged in - show Get Started button
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] shadow-md hover:shadow-lg px-6 py-2 rounded-lg font-medium text-white text-sm transition-all duration-200"
                >
                  Get Started
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="focus:outline-none text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-gray-200 border-t">
            <div className="space-y-1 px-2 pt-2 pb-3">
              <Link
                href="/"
                className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
              >
                Home
              </Link>
              <Link
                href="/plans"
                className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
              >
                Plans & Pricing
              </Link>
              <Link
                href="/coverage"
                className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
              >
                Coverage Map
              </Link>
              <Link
                href="/about"
                className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
              >
                Contact
              </Link>
              
              {session ? (
                <>
                  <div className="my-2 border-gray-200 border-t"></div>
                  {menuItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="block hover:bg-red-50 mt-2 px-3 py-2 rounded-md w-full font-medium text-red-600 hover:text-red-700 text-base text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex justify-center mt-2">
                  <Link
                    href="/register"
                    className="block bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] shadow-md hover:shadow-lg px-3 py-2 rounded-md w-[70%] font-medium text-white text-base text-center transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out? You'll need to sign in again to access your account."
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}