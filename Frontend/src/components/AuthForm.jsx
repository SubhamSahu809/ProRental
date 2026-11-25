import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const inputClass =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50";

/** Login / signup form, used both in the modal and on the /login page. */
export default function AuthForm({ mode, onModeChange, onSuccess }) {
  const { login, signup } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isSignup = mode === "signup";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignup) {
      if (form.password.length < 8) return setError("Password must be at least 8 characters long");
      if (form.password !== form.confirmPassword) return setError("Passwords do not match");
    }

    setIsLoading(true);
    try {
      const user = isSignup
        ? await signup({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password })
        : await login({ email: form.email, password: form.password });
      toast(isSignup ? `Welcome to ProRental, ${user.firstName}!` : `Welcome back, ${user.firstName}!`);
      onSuccess?.(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{isSignup ? "Create your account" : "Welcome back"}</h2>
        <p className="text-gray-600">
          {isSignup ? "List properties, save favourites and contact owners" : "Sign in to your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isSignup && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="auth-first" className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input id="auth-first" name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} required disabled={isLoading} autoComplete="given-name" />
            </div>
            <div>
              <label htmlFor="auth-last" className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input id="auth-last" name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} required disabled={isLoading} autoComplete="family-name" />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input id="auth-email" type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" required disabled={isLoading} autoComplete="email" />
        </div>

        <div>
          <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="auth-password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className={inputClass}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            minLength={isSignup ? 8 : undefined}
            required
            disabled={isLoading}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </div>

        {isSignup && (
          <div>
            <label htmlFor="auth-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input id="auth-confirm" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className={inputClass} required disabled={isLoading} autoComplete="new-password" />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <button type="button" onClick={() => onModeChange(isSignup ? "login" : "signup")} className="text-blue-600 hover:text-blue-500 font-medium">
          {isSignup ? "Sign in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
