import React from "react";

const LoadingSpinner = ({ message = "Loading...", size = "md" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
      />
      <p className={`mt-4 text-gray-600 ${size === "sm" ? "text-sm" : ""}`}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
