import { useNavigate } from "react-router-dom";
import { BadgeIndianRupee, MessageCircle, Clock } from "lucide-react";
import PropertyForm from "../components/PropertyForm";
import RequireAuth from "../components/RequireAuth";
import usePageTitle from "../hooks/usePageTitle";
import { useToast } from "../context/ToastContext";
import { api } from "../utils/api";

const PERKS = [
  { icon: BadgeIndianRupee, text: "Free to list" },
  { icon: MessageCircle, text: "Enquiries straight to you" },
  { icon: Clock, text: "Takes about 3 minutes" },
];

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
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">List your property</h1>
              <p className="text-gray-600 mt-1">Reach tenants and buyers directly, with no broker in between.</p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-white ring-1 ring-black/5 rounded-full px-3 py-1.5">
                  <Icon size={15} className="text-blue-600" /> {text}
                </li>
              ))}
            </ul>
          </div>
          <PropertyForm onSubmit={handleSubmit} submitLabel="Publish listing" submittingLabel="Uploading photos…" />
        </div>
      </div>
    </RequireAuth>
  );
}
