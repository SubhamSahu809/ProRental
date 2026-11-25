import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useToast } from "./ToastContext";
import AuthModal from "../components/AuthModal";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // null | "login" | "signup"
  const toast = useToast();
  const closeModal = useCallback(() => setModalMode(null), []);

  useEffect(() => {
    api("/users/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await api("/users/login", { method: "POST", body: credentials });
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (details) => {
    const data = await api("/users/signup", { method: "POST", body: details });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/users/logout", { method: "POST" });
      setUser(null);
      toast("You are logged out.");
    } catch (err) {
      toast(err.message, "error");
    }
  }, [toast]);

  const isSaved = useCallback((listingId) => Boolean(user?.wishlist?.includes(listingId)), [user]);

  const toggleWishlist = useCallback(
    async (listingId) => {
      if (!user) {
        setModalMode("login");
        return;
      }
      try {
        const data = await api(`/users/wishlist/${listingId}`, { method: "POST" });
        setUser((u) => (u ? { ...u, wishlist: data.wishlist } : u));
        toast(data.saved ? "Saved to your wishlist" : "Removed from your wishlist");
      } catch (err) {
        toast(err.message, "error");
      }
    },
    [user, toast]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      isSaved,
      toggleWishlist,
      openLogin: () => setModalMode("login"),
      openSignup: () => setModalMode("signup"),
    }),
    [user, loading, login, signup, logout, isSaved, toggleWishlist]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modalMode && (
        <AuthModal mode={modalMode} onModeChange={setModalMode} onClose={closeModal} />
      )}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
