import { useEffect, useState } from "react";
import { Home, Bath, BedDouble, MapPin, IndianRupee, ImagePlus, X, AlertCircle } from "lucide-react";
import {
  AMENITIES, FURNISHING_OPTIONS, MAIN_CATEGORIES, PROPERTY_CATEGORIES, TENANT_OPTIONS, mainCategoryOf,
  EMPTY_PROPERTY_FORM as EMPTY,
} from "../utils/property";

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const inputClass = (hasError) =>
  `w-full rounded-xl border-2 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
    hasError ? "border-red-300" : "border-gray-200"
  }`;

function Field({ label, htmlFor, error, icon: Icon, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon size={16} />} {label}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

/**
 * Shared add/edit property form.
 * @param initial        form values (from listingToForm) - omit for a new listing
 * @param existingImages [{url}] already uploaded (edit mode)
 * @param onSubmit       async (FormData) => void; throw to show an error
 */
export default function PropertyForm({ initial, existingImages = [], onSubmit, submitLabel, submittingLabel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [mainCategory, setMainCategory] = useState(mainCategoryOf(initial?.propertyCategory || EMPTY.propertyCategory));
  const [keptUrls, setKeptUrls] = useState(existingImages.map((img) => img.url));
  const [newPhotos, setNewPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Object URLs for previews; revoked when photos change to avoid leaking memory.
  // Created inside the effect so StrictMode's mount/unmount/mount cycle can't leave revoked URLs behind.
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    const urls = newPhotos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [newPhotos]);

  const totalImages = keptUrls.length + newPhotos.length;
  const isRent = form.type === "rent";
  const isResidential = mainCategory === "residential";

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };
  const handleChange = (e) => set(e.target.name, e.target.value);

  const handleMainCategoryChange = (category) => {
    setMainCategory(category);
    setForm((f) => ({ ...f, propertyCategory: PROPERTY_CATEGORIES[category][0].value, amenities: [] }));
  };

  const toggleAmenity = (amenity) =>
    set("amenities", form.amenities.includes(amenity) ? form.amenities.filter((a) => a !== amenity) : [...form.amenities, amenity]);

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file
    const tooBig = files.find((f) => f.size > MAX_FILE_SIZE);
    if (tooBig) return setErrors((er) => ({ ...er, photos: `"${tooBig.name}" is larger than 5MB.` }));
    if (totalImages + files.length > MAX_IMAGES) {
      return setErrors((er) => ({ ...er, photos: `You can upload at most ${MAX_IMAGES} images in total.` }));
    }
    setNewPhotos((p) => [...p, ...files]);
    setErrors((er) => ({ ...er, photos: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (form.price === "" || Number(form.price) <= 0) e.price = "Enter a price greater than 0";
    if (!form.location.trim()) e.location = "Location is required";
    if (form.area !== "" && Number(form.area) <= 0) e.area = "Area must be positive";
    if (form.deposit !== "" && Number(form.deposit) < 0) e.deposit = "Deposit cannot be negative";
    if (totalImages === 0) e.photos = "Add at least one photo";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) {
      setSubmitError("Please fix the highlighted fields.");
      return;
    }

    const data = new FormData();
    const fields = { ...form };
    if (!isRent) {
      for (const k of ["deposit", "furnishing", "availableFrom", "preferredTenants", "petsAllowed"]) fields[k] = "";
    }
    if (!isResidential) fields.bedrooms = "";
    if (mainCategory === "land") fields.bathrooms = "";

    for (const [key, value] of Object.entries(fields)) {
      if (key === "amenities") continue;
      if (value !== "" && value !== null && value !== undefined) data.append(`listing[${key}]`, value);
    }
    form.amenities.forEach((a) => data.append("listing[amenities][]", a));
    keptUrls.forEach((url) => data.append("listing[keepImages][]", url));
    newPhotos.forEach((file) => data.append("listing[images]", file));

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const areaLabel = mainCategory === "land" ? "Plot size (sq.ft)" : mainCategory === "commercial" ? "Floor area (sq.ft)" : "Built-up area (sq.ft)";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      {submitError && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <span className="text-red-800 font-medium">{submitError}</span>
        </div>
      )}

      {/* Listing type + category */}
      <section className="space-y-5">
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex" role="group" aria-label="Listing type">
            {[{ v: "rent", l: "For Rent" }, { v: "buy", l: "For Sale" }].map(({ v, l }) => (
              <button key={v} type="button" aria-pressed={form.type === v} onClick={() => set("type", v)} className={`px-5 py-2 rounded-lg font-medium text-sm ${form.type === v ? "bg-black text-white shadow" : "text-gray-600 hover:text-gray-900"}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="bg-gray-100 p-1 rounded-xl inline-flex flex-wrap" role="group" aria-label="Property category">
            {MAIN_CATEGORIES.map((c) => (
              <button key={c.value} type="button" aria-pressed={mainCategory === c.value} onClick={() => handleMainCategoryChange(c.value)} className={`px-4 py-2 rounded-lg font-medium text-sm ${mainCategory === c.value ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:text-gray-900"}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic information</h3>
        <Field label="Property title *" htmlFor="pf-title" error={errors.title}>
          <input id="pf-title" name="title" value={form.title} onChange={handleChange} maxLength={120} className={inputClass(errors.title)} placeholder="e.g. Spacious 2BHK near Infocity, Patia" />
        </Field>
        <Field label="Description *" htmlFor="pf-desc" error={errors.description}>
          <textarea id="pf-desc" name="description" rows={5} value={form.description} onChange={handleChange} maxLength={5000} className={`${inputClass(errors.description)} resize-y`} placeholder="Describe the property, the neighbourhood, nearby schools, transport, rules..." />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Field label="Location *" htmlFor="pf-location" icon={MapPin} error={errors.location} className="sm:col-span-2">
            <input id="pf-location" name="location" value={form.location} onChange={handleChange} className={inputClass(errors.location)} placeholder="Locality, City (e.g. Patia, Bhubaneswar)" />
          </Field>
          <Field label="Country" htmlFor="pf-country">
            <input id="pf-country" name="country" value={form.country} onChange={handleChange} className={inputClass(false)} />
          </Field>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Property details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label={isResidential ? "Property type" : mainCategory === "land" ? "Land type" : "Business type"} htmlFor="pf-cat">
            <select id="pf-cat" name="propertyCategory" value={form.propertyCategory} onChange={handleChange} className={inputClass(false)}>
              {PROPERTY_CATEGORIES[mainCategory].map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label={isRent ? "Monthly rent (₹) *" : "Price (₹) *"} htmlFor="pf-price" icon={IndianRupee} error={errors.price}>
            <input id="pf-price" type="number" inputMode="numeric" name="price" min="1" value={form.price} onChange={handleChange} className={inputClass(errors.price)} placeholder={isRent ? "15000" : "4500000"} />
          </Field>
          <Field label={areaLabel} htmlFor="pf-area" icon={Home} error={errors.area}>
            <input id="pf-area" type="number" inputMode="numeric" name="area" min="1" value={form.area} onChange={handleChange} className={inputClass(errors.area)} placeholder="1200" />
          </Field>
          {isResidential && (
            <Field label="Bedrooms" htmlFor="pf-bed" icon={BedDouble}>
              <input id="pf-bed" type="number" inputMode="numeric" name="bedrooms" min="0" value={form.bedrooms} onChange={handleChange} className={inputClass(false)} placeholder="2" />
            </Field>
          )}
          {mainCategory !== "land" && (
            <Field label={isResidential ? "Bathrooms" : "Washrooms"} htmlFor="pf-bath" icon={Bath}>
              <input id="pf-bath" type="number" inputMode="numeric" name="bathrooms" min="0" value={form.bathrooms} onChange={handleChange} className={inputClass(false)} placeholder="2" />
            </Field>
          )}
        </div>
      </section>

      {isRent && mainCategory !== "land" && (
        <section className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Rental terms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Field label="Security deposit (₹)" htmlFor="pf-deposit" error={errors.deposit}>
              <input id="pf-deposit" type="number" inputMode="numeric" name="deposit" min="0" value={form.deposit} onChange={handleChange} className={inputClass(errors.deposit)} placeholder="30000" />
            </Field>
            <Field label="Furnishing" htmlFor="pf-furn">
              <select id="pf-furn" name="furnishing" value={form.furnishing} onChange={handleChange} className={inputClass(false)}>
                <option value="">Select</option>
                {FURNISHING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Available from" htmlFor="pf-avail">
              <input id="pf-avail" type="date" name="availableFrom" value={form.availableFrom} onChange={handleChange} className={inputClass(false)} />
            </Field>
            <Field label="Preferred tenants" htmlFor="pf-tenants">
              <select id="pf-tenants" name="preferredTenants" value={form.preferredTenants} onChange={handleChange} className={inputClass(false)}>
                <option value="">Select</option>
                {TENANT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            {isResidential && (
              <Field label="Pets" htmlFor="pf-pets">
                <select id="pf-pets" name="petsAllowed" value={form.petsAllowed} onChange={handleChange} className={inputClass(false)}>
                  <option value="">Not specified</option>
                  <option value="true">Allowed</option>
                  <option value="false">Not allowed</option>
                </select>
              </Field>
            )}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
          {mainCategory === "land" ? "Land features" : mainCategory === "commercial" ? "Business features" : "Amenities"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {AMENITIES[mainCategory].map((amenity) => (
            <button
              key={amenity}
              type="button"
              aria-pressed={form.amenities.includes(amenity)}
              onClick={() => toggleAmenity(amenity)}
              className={`px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                form.amenities.includes(amenity) ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Photos *</h3>
        <p className="text-sm text-gray-600">Up to {MAX_IMAGES} photos, 5MB each. The first photo is used as the cover.</p>

        {totalImages > 0 && (
          <div className="flex flex-wrap gap-4">
            {keptUrls.map((url, i) => (
              <Thumb key={url} src={url} cover={i === 0} onRemove={() => setKeptUrls((u) => u.filter((x) => x !== url))} />
            ))}
            {previews.map((url, i) => (
              <Thumb key={url} src={url} cover={keptUrls.length === 0 && i === 0} onRemove={() => setNewPhotos((p) => p.filter((_, j) => j !== i))} />
            ))}
          </div>
        )}

        {totalImages < MAX_IMAGES && (
          <label htmlFor="pf-photos" className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors ${errors.photos ? "border-red-300" : "border-gray-300"}`}>
            <input id="pf-photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handlePhotos} className="sr-only" />
            <ImagePlus className="mx-auto text-gray-400 mb-3" size={40} />
            <span className="block text-gray-700 font-medium">Click to add photos</span>
            <span className="block text-gray-400 text-sm mt-1">{totalImages} / {MAX_IMAGES} added</span>
          </label>
        )}
        {errors.photos && <p className="text-red-500 text-sm">{errors.photos}</p>}
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {submittingLabel}
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}

function Thumb({ src, cover, onRemove }) {
  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32">
      <img src={src} alt="" className="w-full h-full object-cover rounded-xl shadow-md border border-gray-200" />
      {cover && <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>}
      <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600" aria-label="Remove photo">
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
