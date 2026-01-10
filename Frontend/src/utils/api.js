// API configuration and utilities
const API_BASE_URL = "https://prorental.onrender.com";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return response;
};

// User API calls
export const authAPI = {
  // Get current user
  getCurrentUser: async () => {
    const response = await apiCall("/users/me");
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  },

  // Login
  login: async (email, password) => {
    const response = await apiCall("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },

  // Signup
  signup: async (userData) => {
    const response = await apiCall("/users/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },

  // Logout
  logout: async () => {
    const response = await apiCall("/users/logout", {
      method: "GET",
    });
    return response.ok;
  },
};

// Property/Listing API calls
export const propertyAPI = {
  // Get all properties
  getAll: async () => {
    const response = await apiCall("/api/listings");
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  // Get single property
  getById: async (id) => {
    const response = await apiCall(`/api/listings/${id}`);
    if (!response.ok) {
      throw new Error("Property not found");
    }
    return await response.json();
  },

  // Get user's properties
  getMyProperties: async () => {
    const response = await apiCall("/api/listings/owner/properties", {
      headers: { Accept: "application/json" },
    });
    
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(`Failed to fetch: ${errorData.error || "Unknown error"}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  // Create property
  create: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/api/listings`, {
      method: "POST",
      credentials: "include",
      body: formData, // FormData for file uploads
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },

  // Delete property
  delete: async (id) => {
    const response = await apiCall(`/api/listings/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  },
};
