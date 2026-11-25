import { Link } from "react-router-dom";
import { Heart, MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { categoryLabel, formatListingPrice, listingImages, optimizedImage } from "../utils/property";

export default function PropertyCard({ listing, actions }) {
  const { isSaved, toggleWishlist } = useAuth();
  const saved = isSaved(listing._id);
  const image = optimizedImage(listingImages(listing)[0], 600);

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      <div className="relative">
        <Link to={`/property/${listing._id}`} aria-label={listing.title}>
          <img
            className="w-full h-52 object-cover group-hover:scale-[1.02] transition-transform duration-300"
            src={image}
            alt={listing.title}
            loading="lazy"
            decoding="async"
          />
        </Link>
        <span className="absolute top-3 left-3 bg-white/95 text-xs font-medium px-2.5 py-1 rounded-full shadow text-gray-800">
          {listing.type === "rent" ? "For Rent" : "For Sale"}
        </span>
        <button
          type="button"
          onClick={() => toggleWishlist(listing._id)}
          aria-label={saved ? "Remove from saved" : "Save property"}
          aria-pressed={saved}
          className={`absolute top-3 right-3 p-2 rounded-full shadow transition-colors ${
            saved ? "bg-red-500 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
          }`}
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="flex items-center text-xs text-gray-500 mb-1 gap-1">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{listing.location}</span>
        </p>
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link to={`/property/${listing._id}`} className="hover:underline">{listing.title}</Link>
        </h3>

        <div className="flex flex-wrap items-center text-xs text-gray-600 mb-3 gap-x-4 gap-y-1">
          {listing.bedrooms > 0 && (
            <span className="flex items-center gap-1"><BedDouble size={14} /> {listing.bedrooms} Bed</span>
          )}
          {listing.bathrooms > 0 && (
            <span className="flex items-center gap-1"><Bath size={14} /> {listing.bathrooms} Bath</span>
          )}
          {listing.area > 0 && (
            <span className="flex items-center gap-1"><Maximize size={14} /> {listing.area.toLocaleString("en-IN")} sq.ft</span>
          )}
          {categoryLabel(listing.propertyCategory) && (
            <span className="text-gray-500">{categoryLabel(listing.propertyCategory)}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-base font-bold text-gray-900">{formatListingPrice(listing)}</span>
          {actions || (
            <Link
              to={`/property/${listing._id}`}
              className="px-3 py-1.5 bg-black text-white rounded-full text-xs font-medium hover:bg-gray-800"
            >
              View details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
