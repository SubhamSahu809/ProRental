import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import RequireAuth from "../components/RequireAuth";
import Spinner from "../components/Spinner";
import usePageTitle from "../hooks/usePageTitle";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

function SavedList() {
  const { user } = useAuth();
  const [listings, setListings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/users/wishlist").then(setListings).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-600 py-12 text-center">{error}</p>;
  if (!listings) return <Spinner label="Loading saved properties..." />;

  // Hide items the user un-saves on this page
  const visible = listings.filter((l) => user.wishlist.includes(l._id));

  if (visible.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved properties</h2>
        <p className="text-gray-600 mb-6">Tap the heart on any property to save it here.</p>
        <Link to="/properties?type=rent" className="inline-flex px-6 py-3 bg-black text-white rounded-full font-medium">Browse properties</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {visible.map((listing) => <PropertyCard key={listing._id} listing={listing} />)}
    </div>
  );
}

export default function Wishlist() {
  usePageTitle("Saved properties");
  return (
    <RequireAuth message="Sign in to see your saved properties.">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Saved properties</h1>
        <SavedList />
      </div>
    </RequireAuth>
  );
}
