import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, BedDouble, Bath, Maximize, ChevronLeft, ChevronRight, Camera, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  FURNISHING_OPTIONS, categoryLabel, formatListingPrice, labelOf, listingImages, optimizedImage, timeAgo,
} from "../utils/property";

/** Loading placeholder with the same shape as a card */
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse" aria-hidden="true">
      <div className="h-56 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-4/5 bg-gray-200 rounded" />
        <div className="flex gap-3">
          <div className="h-8 flex-1 bg-gray-100 rounded-lg" />
          <div className="h-8 flex-1 bg-gray-100 rounded-lg" />
          <div className="h-8 flex-1 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, children }) {
  return (
    <span className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg">
      <Icon size={14} className="text-gray-400" /> {children}
    </span>
  );
}

export default function PropertyCard({ listing, actions }) {
  const { isSaved, toggleWishlist } = useAuth();
  const [rawIndex, setIndex] = useState(0);
  const saved = isSaved(listing._id);
  const images = listingImages(listing).slice(0, 5);
  const index = rawIndex % images.length; // images can shrink (e.g. live preview while editing)
  const count = listing.images?.length || images.length;
  const isRent = listing.type === "rent";
  const furnishing = isRent ? labelOf(FURNISHING_OPTIONS, listing.furnishing) : "";
  const posted = timeAgo(listing.createdAt);
  const href = `/property/${listing._id}`;

  const step = (e, delta) => {
    e.preventDefault();
    setIndex((i) => (i + delta + images.length) % images.length);
  };

  const stats = [
    listing.bedrooms > 0 && <Stat key="bed" icon={BedDouble}>{listing.bedrooms} BHK</Stat>,
    listing.bathrooms > 0 && <Stat key="bath" icon={Bath}>{listing.bathrooms} Bath</Stat>,
    listing.area > 0 && <Stat key="area" icon={Maximize}>{listing.area.toLocaleString("en-IN")} ft²</Stat>,
  ].filter(Boolean);

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <Link to={href} aria-label={listing.title} className="block h-full">
          <img
            key={images[index]}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={optimizedImage(images[index], 600)}
            alt={listing.title}
            loading="lazy"
            decoding="async"
          />
          {/* Gradient so the price on the photo stays readable */}
          <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
        </Link>

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full shadow ${isRent ? "bg-emerald-500 text-white" : "bg-amber-400 text-gray-900"}`}>
            {isRent ? "For rent" : "For sale"}
          </span>
          {furnishing && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/90 text-gray-800 shadow">{furnishing}</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(listing._id)}
          aria-label={saved ? "Remove from saved" : "Save property"}
          aria-pressed={saved}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all active:scale-90 ${
            saved ? "bg-red-500 text-white" : "bg-white/90 text-gray-700 hover:bg-white hover:text-red-500"
          }`}
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
        </button>

        {images.length > 1 && (
          <>
            <button type="button" onClick={(e) => step(e, -1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={(e) => step(e, 1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              {images.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between gap-2 pointer-events-none">
          <p className="text-white text-xl font-bold drop-shadow">{formatListingPrice(listing)}</p>
          {count > 1 && (
            <span className="flex items-center gap-1 text-[11px] text-white bg-black/50 px-2 py-0.5 rounded-full">
              <Camera size={12} /> {count}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-1 text-xs">
          <span className="font-medium text-blue-600 truncate">{categoryLabel(listing.propertyCategory) || "Property"}</span>
          {posted && (
            <span className="flex items-center gap-1 text-gray-400 shrink-0">
              <Clock size={12} /> {posted}
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">
          <Link to={href} className="hover:text-blue-600 transition-colors">{listing.title}</Link>
        </h3>
        <p className="flex items-center text-sm text-gray-500 gap-1 mb-4">
          <MapPin size={14} className="shrink-0 text-gray-400" />
          <span className="truncate">{listing.location}</span>
        </p>

        {stats.length > 0 && <div className="flex gap-2 mb-4">{stats}</div>}

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          {listing.amenities?.length > 0 ? (
            <span className="text-xs text-gray-500 truncate">
              {listing.amenities.slice(0, 2).join(" · ")}
              {listing.amenities.length > 2 && ` +${listing.amenities.length - 2}`}
            </span>
          ) : (
            <span />
          )}
          {actions || (
            <Link to={href} className="shrink-0 px-3.5 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium hover:bg-blue-600 transition-colors">
              View details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
