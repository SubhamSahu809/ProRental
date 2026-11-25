import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Heart, ChevronLeft, ChevronRight, X, Camera, MapPin, BedDouble, Bath, Maximize,
  Share2, Pencil, Trash2, CalendarDays, Sofa, Users, PawPrint, Wallet, Building2,
} from "lucide-react";
import Spinner from "../components/Spinner";
import Reviews from "../components/Reviews";
import EnquiryForm from "../components/EnquiryForm";
import PropertyMap from "../components/PropertyMap";
import StarRating from "../components/StarRating";
import usePageTitle from "../hooks/usePageTitle";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../utils/api";
import {
  categoryLabel, formatDate, formatListingPrice, formatPrice, labelOf, listingCoordinates,
  listingImages, optimizedImage, FURNISHING_OPTIONS, TENANT_OPTIONS,
} from "../utils/property";

function Gallery({ images, title }) {
  const [index, setIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const count = images.length;
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (!showAll) return;
    const onKey = (e) => e.key === "Escape" && setShowAll(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showAll]);

  return (
    <>
      {/* grid-rows-1 = minmax(0, 1fr): keeps both columns inside the fixed height.
          (An implicit "auto" row grows to fit the thumbnails' natural size and overflows.) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-1 gap-2 lg:h-[460px]">
        <div className="relative lg:col-span-3 aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto min-h-0 rounded-2xl overflow-hidden bg-gray-900">
          {images.map((url, i) => (
            <div
              key={url}
              className={`absolute inset-0 transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              aria-hidden={i !== index}
            >
              {/* Blurred fill behind the photo, so small or portrait photos aren't stretched or cropped */}
              <img src={optimizedImage(url, 400)} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60" />
              <img
                src={optimizedImage(url, 1400)}
                alt={`${title}, photo ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                className="relative w-full h-full object-contain"
              />
            </div>
          ))}
          {count > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg" aria-label="Previous photo">
                <ChevronLeft size={22} />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg" aria-label="Next photo">
                <ChevronRight size={22} />
              </button>
              <span className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                {index + 1} / {count}
              </span>
            </>
          )}
          <button onClick={() => setShowAll(true)} className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2">
            <Camera size={16} /> All photos ({count})
          </button>
        </div>

        {count > 1 && (
          <div className="hidden lg:grid grid-rows-3 gap-2 min-h-0">
            {images.slice(0, 3).map((url, i) => (
              <button
                key={url}
                onClick={() => (i === 2 && count > 3 ? setShowAll(true) : setIndex(i))}
                className={`relative min-h-0 rounded-2xl overflow-hidden bg-gray-100 ring-2 ring-inset ${i === index ? "ring-blue-600" : "ring-transparent"}`}
                aria-label={i === 2 && count > 3 ? `Show all ${count} photos` : `Show photo ${i + 1}`}
              >
                <img src={optimizedImage(url, 400)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                {i === 2 && count > 3 && (
                  <span className="absolute inset-0 bg-black/50 text-white font-semibold flex items-center justify-center">+{count - 3} more</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {showAll && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4" onClick={() => setShowAll(false)}>
          <div role="dialog" aria-modal="true" aria-label="All photos" className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-800">All photos ({count})</span>
              <button onClick={() => setShowAll(false)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close"><X size={22} /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-56px)] grid grid-cols-1 sm:grid-cols-2 gap-3">
              {images.map((url, i) => (
                <button key={url} onClick={() => { setIndex(i); setShowAll(false); }} className="rounded-xl overflow-hidden aspect-[4/3] bg-gray-100">
                  <img src={optimizedImage(url, 900)} alt={`${title}, photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** "Patia, Bhubaneswar, India", without repeating the country if the location already names it */
function fullLocation({ location = "", country = "" }) {
  if (!country || location.toLowerCase().includes(country.toLowerCase())) return location;
  return `${location}, ${country}`;
}

function Fact({ icon: Icon, label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
      <Icon size={20} className="text-gray-500 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSaved, toggleWishlist } = useAuth();
  const toast = useToast();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  usePageTitle(listing?.title);

  useEffect(() => {
    let cancelled = false;
    setListing(null);
    setError(null);
    api(`/api/listings/${id}`)
      .then((data) => !cancelled && setListing(data))
      .catch((err) => !cancelled && setError(err.status === 404 || err.status === 400 ? "This property doesn't exist or has been removed." : err.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: listing.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied to clipboard");
      }
    } catch {
      /* user cancelled the share sheet */
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this property permanently? This cannot be undone.")) return;
    try {
      await api(`/api/listings/${id}`, { method: "DELETE" });
      toast("Property deleted");
      navigate("/my-properties");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <p className="text-gray-800 text-lg mb-6">{error}</p>
        <Link to="/properties" className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800">
          Browse properties
        </Link>
      </div>
    );
  }
  if (!listing) return <Spinner label="Loading property details..." />;

  const images = listingImages(listing);
  const coordinates = listingCoordinates(listing);
  const isRent = listing.type === "rent";
  const isOwner = user && listing.owner?._id === user.id;
  const saved = isSaved(listing._id);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-10">
      <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/properties?type=${listing.type}`} className="hover:underline">{isRent ? "Rent" : "Buy"}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{listing.title}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{listing.title}</h1>
          <p className="text-gray-600 flex items-center gap-1">
            <MapPin size={16} className="shrink-0" /> {fullLocation(listing)}
          </p>
          {listing.rating?.count > 0 && (
            <a href="#reviews" className="mt-1 inline-flex items-center gap-2 text-sm text-gray-700">
              <StarRating value={listing.rating.average} size={14} /> {listing.rating.average} ({listing.rating.count} reviews)
            </a>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleShare} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 text-sm font-medium">
            <Share2 size={16} /> Share
          </button>
          {!isOwner && (
            <button
              onClick={() => toggleWishlist(listing._id)}
              aria-pressed={saved}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${saved ? "bg-red-50 border-red-200 text-red-600" : "border-gray-300 hover:bg-gray-50"}`}
            >
              <Heart size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
            </button>
          )}
        </div>
      </div>

      <Gallery images={images} title={listing.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Fact icon={Building2} label="Type" value={categoryLabel(listing.propertyCategory)} />
              <Fact icon={BedDouble} label="Bedrooms" value={listing.bedrooms || null} />
              <Fact icon={Bath} label="Bathrooms" value={listing.bathrooms || null} />
              <Fact icon={Maximize} label="Area" value={listing.area ? `${listing.area.toLocaleString("en-IN")} sq.ft` : null} />
              {isRent && (
                <>
                  <Fact icon={Wallet} label="Security deposit" value={Number.isFinite(listing.deposit) ? formatPrice(listing.deposit) : null} />
                  <Fact icon={Sofa} label="Furnishing" value={labelOf(FURNISHING_OPTIONS, listing.furnishing)} />
                  <Fact icon={CalendarDays} label="Available from" value={listing.availableFrom ? (new Date(listing.availableFrom) <= new Date() ? "Immediately" : formatDate(listing.availableFrom)) : null} />
                  <Fact icon={Users} label="Preferred tenants" value={labelOf(TENANT_OPTIONS, listing.preferredTenants)} />
                  <Fact icon={PawPrint} label="Pets" value={listing.petsAllowed === true ? "Allowed" : listing.petsAllowed === false ? "Not allowed" : null} />
                </>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">About this property</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{listing.description || "No description provided."}</p>
          </section>

          {listing.amenities?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Amenities</h2>
              <ul className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <li key={amenity} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">{amenity}</li>
                ))}
              </ul>
            </section>
          )}

          {coordinates && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Location</h2>
              <PropertyMap coordinates={coordinates} title={listing.title} />
            </section>
          )}

          <div id="reviews" className="scroll-mt-24">
            <Reviews
              listingId={listing._id}
              ownerId={listing.owner?._id}
              reviews={listing.reviews || []}
              onChange={(reviews) => setListing((l) => ({ ...l, reviews }))}
            />
          </div>
        </div>

        <aside className="lg:col-span-1 lg:self-start lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <p className="text-sm text-gray-500">{isRent ? "Monthly rent" : "Price"}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{formatListingPrice(listing)}</p>
            {isRent && Number.isFinite(listing.deposit) && (
              <p className="text-sm text-gray-600 mb-4">+ {formatPrice(listing.deposit)} deposit</p>
            )}
            {listing.owner && (
              <p className="text-sm text-gray-600 mb-4">
                Listed by <span className="font-medium text-gray-900">{listing.owner.firstName} {listing.owner.lastName}</span>
                {listing.createdAt && <> on {formatDate(listing.createdAt)}</>}
              </p>
            )}

            <div className="border-t border-gray-200 pt-5">
              {isOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">This is your listing.</p>
                  <Link to={`/property/${listing._id}/edit`} className="w-full inline-flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800">
                    <Pencil size={16} /> Edit property
                  </Link>
                  <Link to="/my-properties?tab=enquiries" className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50">
                    View enquiries
                  </Link>
                  <button onClick={handleDelete} className="w-full inline-flex items-center justify-center gap-2 text-red-600 py-2 rounded-lg hover:bg-red-50 text-sm font-medium">
                    <Trash2 size={16} /> Delete property
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-semibold text-gray-900 mb-3">Contact the owner</h2>
                  <EnquiryForm key={user?.id || "guest"} listing={listing} />
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
