import React from "react";
import { User, ChevronDown } from "lucide-react";

const UserAvatar = ({ user, onClick, showDropdownIcon = false, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  if (user) {
    const initials = `${user?.firstName?.[0]?.toUpperCase() || ""}${user?.firstName?.[1]?.toUpperCase() || ""}` || "U";
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${size === "sm" ? "p-1.5" : ""}`}
      >
        <div className={`${sizeClasses[size]} rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold`}>
          {size === "sm" ? initials[0] : initials}
        </div>
        {showDropdownIcon && (
          <ChevronDown size={16} className="text-gray-600 hidden lg:block" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} inline-flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors`}
      aria-label="Login"
    >
      <User size={size === "sm" ? 20 : 20} className="text-gray-600" />
    </button>
  );
};

export default UserAvatar;
