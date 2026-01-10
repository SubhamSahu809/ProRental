import { useState, useEffect } from "react";
import { authAPI } from "../utils/api";

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const success = await authAPI.logout();
      if (success) {
        setCurrentUser(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  return { currentUser, loading, checkAuth, logout, setCurrentUser };
};
