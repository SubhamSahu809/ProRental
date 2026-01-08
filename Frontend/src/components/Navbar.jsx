import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowUpRight, Menu, X, User, LogOut, Home, ChevronDown } from "lucide-react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleAddProperty = () => {
    navigate("/add-property");
    setIsMenuOpen(false); // close menu if open
  };

  const handleLogin = () => {
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  const switchToSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const switchToLogin = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleContact = () => {
    // Scroll to contact section on home page
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8080/users/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        } else if (response.status === 401) {
          // 401 is expected when not logged in - this is normal, not an error
          setCurrentUser(null);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        // Only log actual network errors, not expected 401s
        if (!error.message.includes('Failed to fetch')) {
          console.error("Error checking auth:", error);
        }
        setCurrentUser(null);
      }
    };
    checkAuth();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If clicking inside dropdown, don't close immediately
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        // If clicking a button, let it handle the click first
        const clickedButton = event.target.closest('button');
        if (clickedButton) {
          // Close dropdown after a short delay to let onClick fire
          setTimeout(() => {
            setIsProfileDropdownOpen(false);
          }, 150);
          return;
        }
        // If clicking elsewhere in dropdown, don't close
        return;
      }
      // Close if clicking outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    // Use a slight delay to ensure button clicks fire first
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsProfileDropdownOpen(false);
    try {
      const response = await fetch("http://localhost:8080/users/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setCurrentUser(null);
        navigate("/");
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Logout failed:", response.status, errorData);
        alert(`Logout failed: ${errorData.error || response.status}`);
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert(`Logout error: ${error.message}`);
    }
  };

  const handleMyProperties = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    navigate("/my-properties");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
        
        {/* Left: Logo and Links */}
        <div className="flex items-center">
          <div className="flex items-center">
            <img
              className="w-5 h-5 sm:w-6 sm:h-6 mr-2"
              src="https://img.icons8.com/ios-filled/50/000000/home.png"
              alt="logo"
            />
            <span className="font-bold text-base sm:text-lg text-neutral-900">
              VISTAHAVEN
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="ml-6 sm:ml-8 hidden gap-6 md:flex">
            <Link className="text-gray-600 hover:text-black" to="/">
              Home
            </Link>
            <Link className="text-gray-600 hover:text-black" to="/properties">
              Properties
            </Link>
            <Link className="text-gray-600 hover:text-black" to="/services">
              Services
            </Link>
            <Link className="text-gray-600 hover:text-black" to="/about">
              About
            </Link>
            <Link className="text-gray-600 hover:text-black" to="/agents">
              Agents
            </Link>
          </nav>
        </div>

        {/* Right: Login, Add Property, Contact button and Mobile menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddProperty}
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            <span className="text-sm font-medium">+ Add Property</span>
          </button>

          <button
            onClick={handleContact}
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2"
          >
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Contact Us</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-black">
              <ArrowUpRight size={16} />
            </span>
          </button>

          {/* Profile Dropdown for Desktop */}
          {currentUser ? (
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {currentUser.firstName?.[0]?.toUpperCase()+currentUser.firstName?.[1]?.toUpperCase() || "U"}
                </div>
                
                <ChevronDown size={16} className="text-gray-600 hidden lg:block" />
              </button>
              
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{currentUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMyProperties}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Home size={16} />
                    My Properties
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              aria-label="Login"
              className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <User size={20} className="text-gray-600" />
            </button>
          )}

          {/* Mobile Profile/Login button */}
          {currentUser ? (
            <div className="md:hidden relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                  {currentUser.firstName?.[0]?.toUpperCase() || "U"}
                </div>
              </button>
              
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{currentUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMyProperties}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Home size={16} />
                    My Properties
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              aria-label="Login (Mobile)"
              className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100"
            >
              <User size={20} className="sm:w-6 sm:h-6 text-gray-600" />
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X size={20} className="sm:w-6 sm:h-6" />
            ) : (
              <Menu size={20} className="sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu with animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col p-3 space-y-2 bg-white border-t border-gray-200 shadow-xl">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-600 hover:text-black py-1"
          >
            Home
          </Link>
          <Link
            to="/properties"
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-600 hover:text-black py-1"
          >
            Properties
          </Link>
          <Link
            to="/services"
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-600 hover:text-black py-1"
          >
            Services
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-600 hover:text-black py-1"
          >
            About
          </Link>
          <Link
            to="/agents"
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-600 hover:text-black py-1"
          >
            Agents
          </Link>

          {/* Add Property button */}
          <button
            onClick={handleAddProperty}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-2 mt-2 w-full justify-center hover:bg-blue-700 transition-colors"
          >
            <span className="text-sm font-medium">+ Add Property</span>
          </button>

          {/* Contact Us button */}
          <button
            onClick={handleContact}
            className="inline-flex items-center gap-2 rounded-full bg-black text-white px-3 py-2 mt-2 w-full justify-center"
          >
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Contact Us</span>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-black">
              <ArrowUpRight size={12} />
            </span>
          </button>
        </nav>
      </div>

       {/* Login Modal */}
       <LoginModal 
         isOpen={isLoginModalOpen} 
         onClose={closeLoginModal} 
         onSwitchToSignup={switchToSignup}
       />
       
       {/* Signup Modal */}
       <SignupModal 
         isOpen={isSignupModalOpen} 
         onClose={closeSignupModal}
         onSwitchToLogin={switchToLogin}
       />
    </header>
  );
};

export default Navbar;
