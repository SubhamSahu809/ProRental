import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

/** Renders children only for logged-in users; otherwise asks them to sign in (without leaving the page). */
export default function RequireAuth({ children, message = "Please sign in to continue." }) {
  const { user, loading, openLogin, openSignup } = useAuth();

  if (loading) return <Spinner label="Checking your account..." />;

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={openLogin} className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800">
            Sign in
          </button>
          <button onClick={openSignup} className="px-6 py-2.5 border border-gray-300 rounded-full font-medium hover:bg-gray-50">
            Create account
          </button>
        </div>
      </div>
    );
  }

  return children;
}
