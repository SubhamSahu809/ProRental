import React from "react";
import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
      <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
      <span className="text-red-800 font-medium flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800"
          aria-label="Close error"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
