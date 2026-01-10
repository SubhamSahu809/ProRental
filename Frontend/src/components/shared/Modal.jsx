import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-2xl p-8 w-full max-w-md mx-4 relative ${className}`}>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
        {title && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
