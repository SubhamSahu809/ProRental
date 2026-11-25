import { useNavigate } from "react-router-dom";
import PropertyForm from "../components/PropertyForm";
import RequireAuth from "../components/RequireAuth";
import usePageTitle from "../hooks/usePageTitle";
import { useToast } from "../context/ToastContext";
import { api } from "../utils/api";

export default function AddPropertyPage() {
  usePageTitle("List a property");
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (formData) => {
    const data = await api("/api/listings", { method: "POST", body: formData });
    toast("Your property is live!");
    navigate(`/property/${data.listing._id}`);
  };

  return (
    <RequireAuth message="Sign in or create a free account to list your property.">
      <div className="bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">List your property</h1>
            <p className="text-blue-100 mt-1">Free to list. Tenants and buyers contact you directly.</p>
          </div>
          <div className="p-5 sm:p-8">
            <PropertyForm onSubmit={handleSubmit} submitLabel="Publish property" submittingLabel="Uploading photos & publishing..." />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
