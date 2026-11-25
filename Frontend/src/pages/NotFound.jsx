import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found");
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <p className="text-6xl font-extrabold text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-600 mb-8">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/" className="px-6 py-2.5 bg-black text-white rounded-full font-medium">Go home</Link>
        <Link to="/properties" className="px-6 py-2.5 border border-gray-300 rounded-full font-medium">Browse properties</Link>
      </div>
    </div>
  );
}
