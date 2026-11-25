import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Home, Heart, ChevronDown, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/properties?type=rent", label: "Rent" },
  { to: "/properties?type=buy", label: "Buy" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
];

const initials = (user) =>
  `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";

function ProfileMenu({ user, onNavigate, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (path) => {
    setOpen(false);
    onNavigate(path);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <span className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
          {initials(user)}
        </span>
        <ChevronDown size={16} className="text-gray-600 hidden lg:block" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
          </div>
          <MenuItem icon={Home} onClick={() => go("/my-properties")}>My properties & enquiries</MenuItem>
          <MenuItem icon={Heart} onClick={() => go("/wishlist")}>Saved properties</MenuItem>
          <MenuItem icon={Plus} onClick={() => go("/add-property")}>List a property</MenuItem>
          <MenuItem icon={LogOut} danger onClick={() => { setOpen(false); onLogout(); }}>Log out</MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, children, danger, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
        danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, openLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close the mobile menu whenever the route changes
  useEffect(() => setIsMenuOpen(false), [location.pathname, location.search]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (link) => {
    const [path, query] = link.to.split("?");
    if (link.end) return location.pathname === path;
    if (location.pathname !== path) return false;
    return !query || location.search.includes(query);
  };

  const linkClass = (link) =>
    `transition-colors ${isActive(link) ? "text-black font-medium" : "text-gray-600 hover:text-black"}`;

  return (
    <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2" aria-label="ProRental home">
            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Home size={18} />
            </span>
            <span className="font-bold text-lg text-neutral-900">ProRental</span>
          </Link>

          <nav className="hidden md:flex gap-6" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={() => linkClass(link)}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/add-property"
            className="hidden md:inline-flex items-center gap-1 rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> List Property
          </Link>

          <Link
            to="/#contact"
            className="hidden lg:inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
          >
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Contact Us
          </Link>

          {user ? (
            <ProfileMenu user={user} onNavigate={navigate} onLogout={handleLogout} />
          ) : (
            <button
              onClick={openLogin}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-2 text-sm font-medium text-gray-700"
            >
              <User size={18} />
              <span className="hidden sm:inline">Sign in</span>
            </button>
          )}

          <button
            onClick={() => setIsMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"}`}>
        <nav className="flex flex-col p-4 gap-1 bg-white border-t border-gray-200" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={() => `py-2 ${linkClass(link)}`}>
              {link.label}
            </NavLink>
          ))}
          <Link to="/add-property" className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-blue-600 text-white px-3 py-2.5 text-sm font-medium">
            <Plus size={16} /> List Property
          </Link>
          <Link to="/#contact" className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-3 py-2.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Contact Us
          </Link>
        </nav>
      </div>
    </header>
  );
}
