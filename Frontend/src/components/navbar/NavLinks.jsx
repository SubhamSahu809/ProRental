import React from "react";
import { Link } from "react-router-dom";
import { NAV_LINKS } from "../../constants/navConstants";

const NavLinks = ({ onLinkClick, className = "hidden gap-6 md:flex" }) => {
  return (
    <nav className={className}>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={onLinkClick}
          className="text-gray-600 hover:text-black py-1"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default NavLinks;
