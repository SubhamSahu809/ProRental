import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, MessageCircle, KeyRound } from "lucide-react";
import Hero from "../components/Hero";
import Contact from "../components/Contact";
import PropertyCard from "../components/PropertyCard";
import Spinner from "../components/Spinner";
import usePageTitle from "../hooks/usePageTitle";
import { api } from "../utils/api";

const STEPS = [
  { icon: Search, title: "Search", text: "Filter by city, budget, bedrooms, furnishing and amenities." },
  { icon: MessageCircle, title: "Contact the owner", text: "Send an enquiry or request a visit straight from the listing." },
  { icon: KeyRound, title: "Move in", text: "Agree terms directly with the owner. No brokerage." },
];

export default function Home() {
  usePageTitle();
  const [type, setType] = useState("rent");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api(`/api/listings?type=${type}&limit=6`)
      .then((data) => !cancelled && setListings(data.listings))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [type]);

  return (
    <>
      <Hero />

      <section id="properties" className="max-w-7xl mx-auto px-4 py-14 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest properties</h2>
            <p className="text-gray-600 mt-1">Freshly listed by owners</p>
          </div>
          <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
            {["rent", "buy"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  type === t ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t === "rent" ? "Rent" : "Buy"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading properties..." />
        ) : error ? (
          <p className="text-center text-red-600 py-12">{error}</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No properties {type === "rent" ? "for rent" : "for sale"} yet.</p>
            <Link to="/add-property" className="inline-flex px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700">
              Be the first to list one
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <PropertyCard key={listing._id} listing={listing} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to={`/properties?type=${type}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 font-medium hover:bg-gray-50">
                View all properties <ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">How ProRental works</h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center"><Icon size={20} /></span>
                  <span className="text-sm text-gray-500">Step {i + 1}</span>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-600 text-sm">{text}</p>
              </li>
            ))}
          </ol>
          <div className="text-center mt-10">
            <p className="text-gray-700 mb-3">Own a property?</p>
            <Link to="/add-property" className="inline-flex px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800">
              List it for free
            </Link>
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}
