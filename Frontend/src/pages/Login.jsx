import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import Spinner from "../components/Spinner";
import usePageTitle from "../hooks/usePageTitle";
import { useAuth } from "../context/AuthContext";

// Only allow redirects to paths inside this site
const safeRedirect = (value) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/");

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") === "signup" ? "signup" : "login");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  usePageTitle(mode === "signup" ? "Create account" : "Sign in");

  useEffect(() => setMode(searchParams.get("mode") === "signup" ? "signup" : "login"), [searchParams]);

  if (loading) return <Spinner />;
  if (user) return <Navigate to={redirectTo} replace />;

  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <AuthForm mode={mode} onModeChange={setMode} onSuccess={() => navigate(redirectTo, { replace: true })} />
      </div>
    </div>
  );
}
