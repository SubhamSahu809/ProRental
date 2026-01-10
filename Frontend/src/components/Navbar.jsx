import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import NavLinks from "./navbar/NavLinks";
import MobileMenu from "./navbar/MobileMenu";
import UserAvatar from "./navbar/UserAvatar";
import ProfileDropdown from "./navbar/ProfileDropdown";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const Navbar = () => {
  const { currentUser, logout, setCurrentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside (only when dropdown is open)
  useEffect(() => {
    if (!isProfileDropdownOpen) return;

    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown container
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    // Use click event with small delay to ensure dropdown has rendered after state update
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleAddProperty = () => {
    navigate("/add-property");
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleLogout = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsProfileDropdownOpen(false);
    const success = await logout();
    if (success) {
      navigate("/");
      setTimeout(() => window.location.reload(), 100);
    } else {
      alert("Logout failed. Please try again.");
    }
  };

  const handleMyProperties = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    navigate("/my-properties");
  };

  const switchToSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const switchToLogin = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
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
          <NavLinks className="ml-6 sm:ml-8 hidden gap-6 md:flex" />
        </div>

        {/* Right: Buttons and User Menu */}
        <div className="flex items-center gap-3">
          {/* Desktop Buttons */}
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
          <div className="hidden md:block relative" ref={dropdownRef}>
            <UserAvatar
              user={currentUser}
              onClick={(e) => {
                if (currentUser) {
                  e.stopPropagation();
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                }
              }}
              showDropdownIcon={!!currentUser}
            />
            {currentUser && (
              <ProfileDropdown
                user={currentUser}
                isOpen={isProfileDropdownOpen}
                onMyProperties={handleMyProperties}
                onLogout={handleLogout}
              />
            )}
          </div>

          {/* Mobile Profile/Login button */}
          <div className="md:hidden relative" ref={dropdownRef}>
            <UserAvatar
              user={currentUser}
              onClick={(e) => {
                e.stopPropagation();
                if (currentUser) {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                } else {
                  handleLogin();
                }
              }}
              size="sm"
            />
            {currentUser && (
              <ProfileDropdown
                user={currentUser}
                isOpen={isProfileDropdownOpen}
                onMyProperties={handleMyProperties}
                onLogout={handleLogout}
              />
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onAddProperty={handleAddProperty}
        onContact={handleContact}
      />

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={switchToSignup}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </header>
  );
};

export default Navbar;
