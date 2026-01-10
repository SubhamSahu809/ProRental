import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { NAV_LINKS } from "../../constants/navConstants";

const MobileMenu = ({ isOpen, onClose, onAddProperty, onContact }) => {
  return (
    <div
      className={`md:hidden overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <nav className="flex flex-col p-3 space-y-2 bg-white border-t border-gray-200 shadow-xl">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className="text-gray-600 hover:text-black py-1"
          >
            {link.label}
          </Link>
        ))}

        <button
          onClick={() => {
            onAddProperty();
            onClose();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-2 mt-2 w-full justify-center hover:bg-blue-700 transition-colors"
        >
          <span className="text-sm font-medium">+ Add Property</span>
        </button>

        <button
          onClick={() => {
            onContact();
            onClose();
          }}
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
  );
};

export default MobileMenu;
