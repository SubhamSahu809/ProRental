import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Home, Pencil, Trash2, Mail, Phone, CalendarDays, Inbox } from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import RequireAuth from "../components/RequireAuth";
import Spinner from "../components/Spinner";
import usePageTitle from "../hooks/usePageTitle";
import { useToast } from "../context/ToastContext";
import { api } from "../utils/api";
import { formatDate } from "../utils/property";

function Listings() {
  const toast = useToast();
  const [properties, setProperties] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/listings/owner/properties").then(setProperties).catch((err) => setError(err.message));
  }, []);

  const handleDelete = async (property) => {
    if (!window.confirm(`Delete "${property.title}" permanently? This cannot be undone.`)) return;
    try {
      await api(`/api/listings/${property._id}`, { method: "DELETE" });
      setProperties((list) => list.filter((p) => p._id !== property._id));
      toast("Property deleted");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  if (error) return <p className="text-red-600 py-12 text-center">{error}</p>;
  if (!properties) return <Spinner label="Loading your properties..." />;

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <Home size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No properties yet</h2>
        <p className="text-gray-600 mb-6">You haven&apos;t listed any properties yet.</p>
        <Link to="/add-property" className="inline-flex bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 font-medium">
          + List your first property
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property._id}
          listing={property}
          actions={
            <div className="flex gap-2">
              <Link to={`/property/${property._id}/edit`} className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100" aria-label={`Edit ${property.title}`}>
                <Pencil size={16} />
              </Link>
              <button onClick={() => handleDelete(property)} className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100" aria-label={`Delete ${property.title}`}>
                <Trash2 size={16} />
              </button>
            </div>
          }
        />
      ))}
    </div>
  );
}

function Enquiries({ onUnreadChange }) {
  const [enquiries, setEnquiries] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/enquiries/received").then(setEnquiries).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (enquiries) onUnreadChange(enquiries.filter((e) => !e.read).length);
  }, [enquiries, onUnreadChange]);

  const markRead = async (enquiry) => {
    if (enquiry.read) return;
    setEnquiries((list) => list.map((e) => (e._id === enquiry._id ? { ...e, read: true } : e)));
    api(`/api/enquiries/${enquiry._id}/read`, { method: "PATCH" }).catch(() => {});
  };

  if (error) return <p className="text-red-600 py-12 text-center">{error}</p>;
  if (!enquiries) return <Spinner label="Loading enquiries..." />;

  if (enquiries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <Inbox size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No enquiries yet</h2>
        <p className="text-gray-600">When someone contacts you about a property, their message will appear here.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {enquiries.map((enq) => (
        <li key={enq._id} className={`bg-white rounded-2xl border p-5 ${enq.read ? "border-gray-100" : "border-blue-300 shadow-sm"}`} onClick={() => markRead(enq)}>
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <p className="font-semibold text-gray-900">
                {enq.name} {!enq.read && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full align-middle">New</span>}
              </p>
              <p className="text-sm text-gray-500">
                about{" "}
                {enq.listing ? <Link to={`/property/${enq.listing._id}`} className="text-blue-600 hover:underline">{enq.listing.title}</Link> : "a deleted property"}
                {" · "}{formatDate(enq.createdAt)}
              </p>
            </div>
            {enq.visitDate && (
              <span className="inline-flex items-center gap-1 text-sm bg-amber-50 text-amber-800 px-3 py-1 rounded-full">
                <CalendarDays size={14} /> Visit requested: {formatDate(enq.visitDate)}
              </span>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-line mb-3">{enq.message}</p>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${enq.email}?subject=${encodeURIComponent(`Re: ${enq.listing?.title || "your enquiry"}`)}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black text-white text-sm">
              <Mail size={14} /> {enq.email}
            </a>
            {enq.phone && (
              <a href={`tel:${enq.phone}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-300 text-sm">
                <Phone size={14} /> {enq.phone}
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function MyProperties() {
  usePageTitle("My properties");
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "enquiries" ? "enquiries" : "listings";
  const [unread, setUnread] = useState(0);

  return (
    <RequireAuth message="Sign in to manage your properties.">
      <div className="bg-gray-50 min-h-[70vh] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">My properties</h1>
              <p className="text-gray-600">Manage your listings and reply to enquiries</p>
            </div>
            <Link to="/add-property" className="inline-flex w-fit bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 font-medium">
              + List property
            </Link>
          </div>

          <div className="flex gap-1 mb-6 border-b border-gray-200" role="tablist">
            {[{ v: "listings", l: "Listings" }, { v: "enquiries", l: "Enquiries" }].map(({ v, l }) => (
              <button
                key={v}
                role="tab"
                aria-selected={tab === v}
                onClick={() => setSearchParams(v === "listings" ? {} : { tab: v })}
                className={`px-4 py-2 -mb-px border-b-2 font-medium ${tab === v ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              >
                {l}
                {v === "enquiries" && unread > 0 && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{unread}</span>}
              </button>
            ))}
          </div>

          {tab === "listings" ? <Listings /> : <Enquiries onUnreadChange={setUnread} />}
        </div>
      </div>
    </RequireAuth>
  );
}
