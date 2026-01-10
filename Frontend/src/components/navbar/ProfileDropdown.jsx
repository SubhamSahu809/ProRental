import React from "react";
import { Home, LogOut } from "lucide-react";

const ProfileDropdown = ({
  user,
  isOpen,
  onClose,
  onMyProperties,
  onLogout,
  className = "",
}) => {
  if (!isOpen) return null;

  const initials = `${user?.firstName?.[0]?.toUpperCase() || ""}${user?.firstName?.[1]?.toUpperCase() || ""}` || "U";

  return (
    <div 
      className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100] ${className}`}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      role="menu"
      aria-label="User menu"
    >
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMyProperties(e);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
      >
        <Home size={16} />
        My Properties
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onLogout(e);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
};

export default ProfileDropdown;
