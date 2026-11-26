import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PropertyForm from "../components/PropertyForm";
import { listingToForm } from "../utils/property";
import RequireAuth from "../components/RequireAuth";
import Spinner from "../components/Spinner";
import usePageTitle from "../hooks/usePageTitle";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../utils/api";

function EditPropertyContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/api/listings/${id}/edit`)
      .then(setListing)
      .catch((err) =>
        setError(err.status === 403 ? "You can only edit your own properties." : err.status === 404 ? "This property doesn't exist." : err.message)
      );
  }, [id]);

  const handleSubmit = async (formData) => {
    await api(`/api/listings/${id}`, { method: "PUT", body: formData });
    toast("Changes saved");
    navigate(`/property/${id}`);
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <p className="text-gray-800 text-lg mb-6">{error}</p>
        <Link to="/my-properties" className="px-6 py-2.5 bg-black text-white rounded-full font-medium">Go to my properties</Link>
      </div>
    );
  }
  if (!listing) return <Spinner label="Loading property..." />;

  const existingImages = listing.images?.length ? listing.images : listing.image?.url ? [listing.image] : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={`/property/${id}`} className="text-sm text-gray-500 hover:text-gray-900">← Back to listing</Link>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mt-2">Edit property</h1>
          <p className="text-gray-600 mt-1 truncate">{listing.title}</p>
        </div>
        <PropertyForm
          initial={listingToForm(listing)}
          existingImages={existingImages}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          submittingLabel="Saving…"
        />
      </div>
    </div>
  );
}

export default function EditPropertyPage() {
  usePageTitle("Edit property");
  const { user } = useAuth();
  return (
    <RequireAuth message="Sign in to edit your property.">
      <EditPropertyContent key={user?.id} />
    </RequireAuth>
  );
}
