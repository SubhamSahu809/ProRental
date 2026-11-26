import { useEffect, useRef, useState } from "react";
import {
  Home, Building2, TreePine, KeyRound, BadgeIndianRupee, MapPin, Maximize, IndianRupee, ImagePlus, X,
  AlertCircle, Check, ChevronLeft, ChevronRight, Star, GripVertical, Sofa, Armchair, Package, CalendarDays,
  PawPrint, Lightbulb, Pencil, Send, RotateCcw,
} from "lucide-react";
import PropertyCard from "./PropertyCard";
import {
  AMENITIES, FURNISHING_OPTIONS, MAIN_CATEGORIES, PROPERTY_CATEGORIES, TENANT_OPTIONS, EMPTY_PROPERTY_FORM as EMPTY,
  categoryLabel, formatCompactPrice, formatPrice, formatDate, labelOf, mainCategoryOf,
} from "../utils/property";

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DRAFT_KEY = "prorental:listing-draft";

const STEPS = [
  { id: "basics", title: "Basics", hint: "What are you listing?" },
  { id: "location", title: "Location & size", hint: "Where is it and how big?" },
  { id: "price", title: "Price & terms", hint: "What does it cost?" },
  { id: "amenities", title: "Amenities", hint: "What does it offer?" },
  { id: "photos", title: "Photos", hint: "Show it off" },
  { id: "review", title: "Review", hint: "Check and publish" },
];

const MAIN_ICONS = { residential: Home, land: TreePine, commercial: Building2 };
const FURNISHING_ICONS = { unfurnished: Package, "semi-furnished": Armchair, "fully-furnished": Sofa };

const today = () => new Date().toISOString().slice(0, 10);

let photoId = 0;
const newPhotoId = () => `p${++photoId}`;

/* ---------- small building blocks ---------- */

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
    hasError ? "border-red-300 bg-red-50/40" : "border-gray-200"
  }`;

function Field({ label, htmlFor, error, hint, optional, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-sm font-medium text-gray-800 mb-2">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-gray-400">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-red-600 text-sm mt-1.5"><AlertCircle size={14} /> {error}</p>
      ) : hint ? (
        <p className="text-gray-500 text-xs mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}

/** Large selectable card with an icon (radio-style). */
function ChoiceCard({ selected, onClick, icon: Icon, title, text }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative text-left rounded-2xl border-2 p-4 transition-all ${
        selected ? "border-blue-600 bg-blue-50/60 shadow-md shadow-blue-600/10" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
          <Check size={13} strokeWidth={3} />
        </span>
      )}
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
        <Icon size={20} />
      </span>
      <span className="block font-semibold text-gray-900">{title}</span>
      {text && <span className="block text-xs text-gray-500 mt-0.5">{text}</span>}
    </button>
  );
}

function Pill({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        selected ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
      }`}
    >
      {children}
    </button>
  );
}

/** Row of numeric quick-picks (bedrooms, bathrooms). */
function NumberPills({ value, onChange, options, label }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map(({ v, l }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(String(value) === String(v) ? "" : String(v))}
          aria-pressed={String(value) === String(v)}
          className={`min-w-12 h-12 px-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
            String(value) === String(v) ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Stepper({ step, maxVisited, onJump }) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2">
      {STEPS.map((s, i) => {
        const done = i < step;
        const current = i === step;
        const reachable = i <= maxVisited;
        return (
          <li key={s.id} className="flex items-center gap-1 sm:gap-2 flex-1 last:flex-none">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onJump(i)}
              aria-current={current ? "step" : undefined}
              className="flex items-center gap-2 group disabled:cursor-not-allowed"
            >
              <span
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  current ? "bg-white text-blue-700 ring-4 ring-white/30" : done ? "bg-emerald-400 text-white" : "bg-white/15 text-white/70"
                }`}
              >
                {done ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`hidden xl:block text-sm font-medium whitespace-nowrap ${current ? "text-white" : "text-white/70 group-enabled:group-hover:text-white"}`}>
                {s.title}
              </span>
            </button>
            {i < STEPS.length - 1 && <span className={`flex-1 h-0.5 rounded ${done ? "bg-emerald-400" : "bg-white/20"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- listing quality score ---------- */

function qualityChecks(form, photoCount, isRent) {
  return [
    { ok: photoCount >= 3, tip: "Add at least 3 photos" },
    { ok: form.description.trim().length >= 120, tip: "Write a description of 120+ characters" },
    { ok: form.amenities.length >= 3, tip: "Pick at least 3 amenities" },
    { ok: Number(form.area) > 0, tip: "Add the area in sq.ft" },
    { ok: form.title.trim().length >= 15, tip: "Use a descriptive title" },
    ...(isRent ? [{ ok: form.deposit !== "" && form.furnishing !== "", tip: "Add deposit and furnishing" }] : []),
  ];
}

function QualityMeter({ checks }) {
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 26;
  const c = 2 * Math.PI * r;
  const todo = checks.filter((ch) => !ch.ok);

  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-5">
      <div className="flex items-center gap-4">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90 shrink-0" aria-hidden="true">
          <circle cx="32" cy="32" r={r} stroke="#f3f4f6" strokeWidth="7" fill="none" />
          <circle cx="32" cy="32" r={r} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} className="transition-all duration-500" />
        </svg>
        <div>
          <p className="text-2xl font-bold text-gray-900">{score}%</p>
          <p className="text-sm text-gray-500">Listing quality</p>
        </div>
      </div>
      {todo.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {todo.slice(0, 3).map((t) => (
            <li key={t.tip} className="flex items-start gap-2 text-sm text-gray-600">
              <Lightbulb size={15} className="text-amber-500 mt-0.5 shrink-0" /> {t.tip}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-emerald-700 flex items-center gap-2"><Check size={16} /> Great listing! Owners with complete listings get more enquiries.</p>
      )}
    </div>
  );
}

/* ---------- main form ---------- */

/**
 * Step-by-step add/edit property form with live preview.
 * @param initial        form values (listingToForm) for edit mode
 * @param existingImages [{url}] already uploaded (edit mode)
 * @param onSubmit       async (FormData) => void; throw to show an error
 */
export default function PropertyForm({ initial, existingImages = [], onSubmit, submitLabel, submittingLabel }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(initial || EMPTY);
  const [mainCategory, setMainCategory] = useState(mainCategoryOf((initial || EMPTY).propertyCategory));
  const [photos, setPhotos] = useState(() => existingImages.map((img) => ({ id: newPhotoId(), kind: "existing", url: img.url })));
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(isEdit ? STEPS.length - 1 : 0);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dragIndex = useRef(null);
  const topRef = useRef(null);

  const isRent = form.type === "rent";
  const isResidential = mainCategory === "residential";
  const isLand = mainCategory === "land";

  /* Preview URLs for newly added files. Created inside the effect so StrictMode's
     mount/unmount/mount cycle can't leave revoked URLs behind. */
  const [blobUrls, setBlobUrls] = useState({});
  useEffect(() => {
    const urls = {};
    photos.forEach((p) => p.kind === "new" && (urls[p.id] = URL.createObjectURL(p.file)));
    setBlobUrls(urls);
    return () => Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);
  const photoUrl = (p) => (p.kind === "existing" ? p.url : blobUrls[p.id]);

  /* Draft autosave (new listings only; photos can't be stored). */
  useEffect(() => {
    if (isEdit) return;
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (saved?.form && (saved.form.title || saved.form.description || saved.form.location)) {
        setForm({ ...EMPTY, ...saved.form });
        setMainCategory(saved.mainCategory || mainCategoryOf(saved.form.propertyCategory));
        setDraftRestored(true);
      }
    } catch {
      /* storage unavailable */
    }
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, mainCategory }));
      } catch {
        /* storage unavailable */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [form, mainCategory, isEdit]);

  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setForm(EMPTY);
    setMainCategory("residential");
    setDraftRestored(false);
  };

  /* ----- field helpers ----- */
  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: "" } : e));
  };
  const handleChange = (e) => set(e.target.name, e.target.value);

  const chooseMainCategory = (category) => {
    if (category === mainCategory) return;
    setMainCategory(category);
    setForm((f) => ({ ...f, propertyCategory: PROPERTY_CATEGORIES[category][0].value, amenities: [] }));
  };

  const toggleAmenity = (amenity) =>
    set("amenities", form.amenities.includes(amenity) ? form.amenities.filter((a) => a !== amenity) : [...form.amenities, amenity]);

  /* ----- photos ----- */
  const addFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const tooBig = files.find((f) => f.size > MAX_FILE_SIZE);
    if (tooBig) return setErrors((er) => ({ ...er, photos: `"${tooBig.name}" is larger than 5MB.` }));
    const room = MAX_IMAGES - photos.length;
    if (room <= 0) return setErrors((er) => ({ ...er, photos: `You can add at most ${MAX_IMAGES} photos.` }));
    setPhotos((p) => [...p, ...files.slice(0, room).map((file) => ({ id: newPhotoId(), kind: "new", file }))]);
    setErrors((er) => ({ ...er, photos: files.length > room ? `Only ${room} more photo${room === 1 ? "" : "s"} could be added (max ${MAX_IMAGES}).` : "" }));
  };

  const movePhoto = (from, to) => {
    if (to < 0 || to >= photos.length || from === to) return;
    setPhotos((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const removePhoto = (id) => setPhotos((list) => list.filter((p) => p.id !== id));

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  /* ----- validation per step ----- */
  const validateStep = (i) => {
    const e = {};
    const id = STEPS[i].id;
    if (id === "basics") {
      if (form.title.trim().length < 5) e.title = "Give your listing a title (at least 5 characters)";
      if (form.description.trim().length < 20) e.description = "Describe the property in at least 20 characters";
    }
    if (id === "location") {
      if (!form.location.trim()) e.location = "Where is the property?";
      if (form.area !== "" && Number(form.area) <= 0) e.area = "Area must be more than 0";
    }
    if (id === "price") {
      if (form.price === "" || Number(form.price) <= 0) e.price = isRent ? "Enter the monthly rent" : "Enter the price";
      if (form.deposit !== "" && Number(form.deposit) < 0) e.deposit = "Deposit cannot be negative";
    }
    if (id === "photos" && photos.length === 0) e.photos = "Add at least one photo";
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goTo = (i) => {
    // Moving forward requires every step in between to be valid
    for (let s = step; s < i; s++) {
      if (!validateStep(s)) {
        setStep(s);
        scrollTop();
        return;
      }
    }
    setStep(i);
    setMaxVisited((m) => Math.max(m, i));
    scrollTop();
  };

  /* ----- submit ----- */
  const handleSubmit = async () => {
    setSubmitError("");
    for (let s = 0; s < STEPS.length - 1; s++) {
      if (!validateStep(s)) {
        setStep(s);
        scrollTop();
        return;
      }
    }

    const fields = { ...form };
    if (!isRent || isLand) for (const k of ["deposit", "furnishing", "availableFrom", "preferredTenants", "petsAllowed"]) fields[k] = "";
    if (!isResidential) fields.bedrooms = "";
    if (isLand) fields.bathrooms = "";

    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (key === "amenities") continue;
      if (value !== "" && value !== null && value !== undefined) data.append(`listing[${key}]`, value);
    }
    form.amenities.forEach((a) => data.append("listing[amenities][]", a));

    let newIndex = 0;
    photos.forEach((p) => {
      if (p.kind === "existing") {
        data.append("listing[keepImages][]", p.url);
        data.append("listing[imageOrder][]", `existing:${p.url}`);
      } else {
        data.append("listing[images]", p.file);
        data.append("listing[imageOrder][]", `new:${newIndex++}`);
      }
    });

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      if (!isEdit) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
      scrollTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ----- derived values ----- */
  const checks = qualityChecks(form, photos.length, isRent);
  const previewListing = {
    _id: "preview",
    title: form.title || "Your property title",
    location: form.location || "Locality, City",
    price: form.price === "" ? undefined : Number(form.price),
    type: form.type,
    propertyCategory: form.propertyCategory,
    bedrooms: Number(form.bedrooms) || 0,
    bathrooms: Number(form.bathrooms) || 0,
    area: Number(form.area) || 0,
    furnishing: form.furnishing,
    amenities: form.amenities,
    images: photos.map(photoUrl).filter(Boolean).map((url) => ({ url })),
    createdAt: new Date().toISOString(),
  };
  const areaLabel = isLand ? "Plot size" : mainCategory === "commercial" ? "Floor area" : "Built-up area";
  const stepInfo = STEPS[step];

  /* ----- step content ----- */
  const renderStep = () => {
    switch (stepInfo.id) {
      case "basics":
        return (
          <div className="space-y-8">
            <div>
              <p className="text-sm font-medium text-gray-800 mb-3">I want to</p>
              <div className="grid grid-cols-2 gap-3">
                <ChoiceCard selected={isRent} onClick={() => set("type", "rent")} icon={KeyRound} title="Rent it out" text="Monthly rent" />
                <ChoiceCard selected={!isRent} onClick={() => set("type", "buy")} icon={BadgeIndianRupee} title="Sell it" text="One-time price" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-3">Property category</p>
              <div className="grid grid-cols-3 gap-3">
                {MAIN_CATEGORIES.map((c) => (
                  <ChoiceCard key={c.value} selected={mainCategory === c.value} onClick={() => chooseMainCategory(c.value)} icon={MAIN_ICONS[c.value]} title={c.label} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-4" role="group" aria-label="Property type">
                {PROPERTY_CATEGORIES[mainCategory].map((c) => (
                  <Pill key={c.value} selected={form.propertyCategory === c.value} onClick={() => set("propertyCategory", c.value)}>
                    {c.label}
                  </Pill>
                ))}
              </div>
            </div>

            <Field label="Listing title" htmlFor="pf-title" error={errors.title} hint="e.g. “Spacious 2BHK near Infocity, Patia”. Mention size, type and area.">
              <input id="pf-title" name="title" value={form.title} onChange={handleChange} maxLength={120} className={inputClass(errors.title)} placeholder="Spacious 2BHK near Infocity, Patia" />
            </Field>

            <Field
              label="Description"
              htmlFor="pf-desc"
              error={errors.description}
              hint={`${form.description.length}/5000 · Talk about the neighbourhood, nearby schools and transport, water/power supply and house rules.`}
            >
              <textarea id="pf-desc" name="description" rows={6} value={form.description} onChange={handleChange} maxLength={5000} className={`${inputClass(errors.description)} resize-y`} placeholder="Bright, airy flat on the 3rd floor with lift. 5 minutes from Infocity, close to schools and markets. 24/7 water and power backup..." />
            </Field>
          </div>
        );

      case "location":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Locality & city" htmlFor="pf-location" error={errors.location} hint="We use this to place your property on the map." className="sm:col-span-2">
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="pf-location" name="location" value={form.location} onChange={handleChange} className={`${inputClass(errors.location)} pl-11`} placeholder="Patia, Bhubaneswar" />
                </div>
              </Field>
              <Field label="Country" htmlFor="pf-country">
                <input id="pf-country" name="country" value={form.country} onChange={handleChange} className={inputClass(false)} />
              </Field>
            </div>

            <Field label={`${areaLabel} (sq.ft)`} htmlFor="pf-area" error={errors.area} optional>
              <div className="relative max-w-xs">
                <Maximize size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="pf-area" type="number" inputMode="numeric" min="1" name="area" value={form.area} onChange={handleChange} className={`${inputClass(errors.area)} pl-11 pr-16`} placeholder="1200" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">sq.ft</span>
              </div>
            </Field>

            {isResidential && (
              <Field label="Bedrooms (BHK)" optional>
                <NumberPills label="Bedrooms" value={form.bedrooms} onChange={(v) => set("bedrooms", v)} options={[1, 2, 3, 4, 5].map((n) => ({ v: n, l: n === 5 ? "5+" : `${n}` }))} />
              </Field>
            )}
            {!isLand && (
              <Field label={isResidential ? "Bathrooms" : "Washrooms"} optional>
                <NumberPills label="Bathrooms" value={form.bathrooms} onChange={(v) => set("bathrooms", v)} options={[1, 2, 3, 4].map((n) => ({ v: n, l: n === 4 ? "4+" : `${n}` }))} />
              </Field>
            )}
          </div>
        );

      case "price":
        return (
          <div className="space-y-8">
            <Field label={isRent ? "Monthly rent" : "Selling price"} htmlFor="pf-price" error={errors.price}>
              <div className="relative max-w-sm">
                <IndianRupee size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="pf-price" type="number" inputMode="numeric" min="1" name="price" value={form.price} onChange={handleChange} className={`${inputClass(errors.price)} pl-11 text-xl font-semibold`} placeholder={isRent ? "15000" : "4500000"} />
              </div>
              {Number(form.price) > 0 && (
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  {formatPrice(Number(form.price))}{isRent ? " per month" : ""} · {formatCompactPrice(Number(form.price))}
                </p>
              )}
            </Field>

            {isRent && !isLand && (
              <>
                <Field label="Security deposit" htmlFor="pf-deposit" error={errors.deposit} optional>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full max-w-xs">
                      <IndianRupee size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="pf-deposit" type="number" inputMode="numeric" min="0" name="deposit" value={form.deposit} onChange={handleChange} className={`${inputClass(errors.deposit)} pl-11`} placeholder="30000" />
                    </div>
                    {Number(form.price) > 0 &&
                      [1, 2, 3].map((m) => (
                        <Pill key={m} selected={Number(form.deposit) === Number(form.price) * m} onClick={() => set("deposit", String(Number(form.price) * m))}>
                          {m}× rent
                        </Pill>
                      ))}
                  </div>
                </Field>

                <div>
                  <p className="flex items-baseline justify-between text-sm font-medium text-gray-800 mb-3">Furnishing <span className="text-xs font-normal text-gray-400">Optional</span></p>
                  <div className="grid grid-cols-3 gap-3">
                    {FURNISHING_OPTIONS.map((o) => (
                      <ChoiceCard key={o.value} selected={form.furnishing === o.value} onClick={() => set("furnishing", form.furnishing === o.value ? "" : o.value)} icon={FURNISHING_ICONS[o.value]} title={o.label} />
                    ))}
                  </div>
                </div>

                <Field label="Available from" htmlFor="pf-avail" optional>
                  <div className="flex flex-wrap items-center gap-3">
                    <Pill selected={form.availableFrom !== "" && form.availableFrom <= today()} onClick={() => set("availableFrom", today())}>Immediately</Pill>
                    <div className="relative">
                      <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input id="pf-avail" type="date" name="availableFrom" value={form.availableFrom} onChange={handleChange} className={`${inputClass(false)} pl-11`} />
                    </div>
                  </div>
                </Field>

                <div>
                  <p className="flex items-baseline justify-between text-sm font-medium text-gray-800 mb-3">Preferred tenants <span className="text-xs font-normal text-gray-400">Optional</span></p>
                  <div className="flex flex-wrap gap-2">
                    {TENANT_OPTIONS.map((o) => (
                      <Pill key={o.value} selected={form.preferredTenants === o.value} onClick={() => set("preferredTenants", form.preferredTenants === o.value ? "" : o.value)}>{o.label}</Pill>
                    ))}
                  </div>
                </div>

                {isResidential && (
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3"><PawPrint size={16} /> Pets</p>
                    <div className="flex flex-wrap gap-2">
                      {[{ v: "true", l: "Pets allowed" }, { v: "false", l: "No pets" }, { v: "", l: "Not specified" }].map((o) => (
                        <Pill key={o.l} selected={form.petsAllowed === o.v} onClick={() => set("petsAllowed", o.v)}>{o.l}</Pill>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "amenities":
        return (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              {form.amenities.length} selected · Tenants filter by these, so pick everything that applies.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AMENITIES[mainCategory].map((amenity) => {
                const on = form.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                      on ? "border-blue-600 bg-blue-50 text-blue-800" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className={`w-5 h-5 shrink-0 rounded-md flex items-center justify-center border-2 ${on ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"}`}>
                      {on && <Check size={12} strokeWidth={3} />}
                    </span>
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "photos":
        return (
          <div className="space-y-5">
            {photos.length < MAX_IMAGES && (
              <label
                htmlFor="pf-photos"
                onDragOver={(e) => {
                  if ([...e.dataTransfer.types].includes("Files")) {
                    e.preventDefault();
                    setDragOver(true);
                  }
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
                  dragOver ? "border-blue-500 bg-blue-50" : errors.photos ? "border-red-300 bg-red-50/40" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40"
                }`}
              >
                <input id="pf-photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} className="sr-only" />
                <span className="w-14 h-14 rounded-2xl bg-white shadow flex items-center justify-center mb-4 text-blue-600"><ImagePlus size={26} /></span>
                <span className="font-semibold text-gray-900">Drag photos here or <span className="text-blue-600 underline">browse</span></span>
                <span className="text-sm text-gray-500 mt-1">JPG, PNG or WebP · up to 5MB each · {photos.length}/{MAX_IMAGES} added</span>
                <span className="text-xs text-gray-400 mt-3">Tip: bright, landscape photos at least 1200px wide look best</span>
              </label>
            )}
            {errors.photos && <p className="flex items-center gap-1 text-red-600 text-sm"><AlertCircle size={14} /> {errors.photos}</p>}

            {photos.length > 0 && (
              <>
                <p className="text-sm text-gray-500">Drag to reorder. The first photo is the cover tenants see first.</p>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((p, i) => (
                    <li
                      key={p.id}
                      draggable
                      onDragStart={() => (dragIndex.current = i)}
                      onDragOver={(e) => dragIndex.current !== null && e.preventDefault()}
                      onDrop={(e) => {
                        if (dragIndex.current === null) return;
                        e.preventDefault();
                        e.stopPropagation();
                        movePhoto(dragIndex.current, i);
                        dragIndex.current = null;
                      }}
                      onDragEnd={() => (dragIndex.current = null)}
                      className={`group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing ring-2 ${i === 0 ? "ring-blue-600" : "ring-transparent"}`}
                    >
                      {photoUrl(p) && <img src={photoUrl(p)} alt={`Photo ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />}
                      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                      <span className="absolute top-2 left-2 flex items-center gap-1 text-white">
                        <GripVertical size={16} className="opacity-80" />
                        {i === 0 && <span className="text-[11px] font-semibold bg-blue-600 px-2 py-0.5 rounded-full">Cover</span>}
                      </span>
                      <button type="button" onClick={() => removePhoto(p.id)} aria-label={`Remove photo ${i + 1}`} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white shadow transition-colors">
                        <X size={14} strokeWidth={2.5} />
                      </button>
                      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-1">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => movePhoto(i, i - 1)} disabled={i === 0} aria-label="Move left" className="p-1 rounded-full bg-white/90 text-gray-700 disabled:opacity-0"><ChevronLeft size={14} /></button>
                          <button type="button" onClick={() => movePhoto(i, i + 1)} disabled={i === photos.length - 1} aria-label="Move right" className="p-1 rounded-full bg-white/90 text-gray-700 disabled:opacity-0"><ChevronRight size={14} /></button>
                        </div>
                        {i !== 0 && (
                          <button type="button" onClick={() => movePhoto(i, 0)} className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-white/90 text-gray-800 hover:bg-white">
                            <Star size={12} /> Make cover
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        );

      case "review": {
        const rows = [
          { step: 0, label: "Listing", value: `${isRent ? "For rent" : "For sale"} · ${categoryLabel(form.propertyCategory)}` },
          { step: 0, label: "Title", value: form.title },
          { step: 1, label: "Location", value: [form.location, form.country].filter(Boolean).join(", ") },
          { step: 1, label: "Size", value: [form.bedrooms && `${form.bedrooms} BHK`, form.bathrooms && `${form.bathrooms} bath`, form.area && `${form.area} sq.ft`].filter(Boolean).join(" · ") || "—" },
          { step: 2, label: isRent ? "Rent" : "Price", value: form.price ? `${formatPrice(Number(form.price))}${isRent ? "/month" : ""}` : "—" },
          ...(isRent && !isLand
            ? [
                { step: 2, label: "Deposit", value: form.deposit ? formatPrice(Number(form.deposit)) : "—" },
                { step: 2, label: "Terms", value: [labelOf(FURNISHING_OPTIONS, form.furnishing), form.availableFrom && `from ${formatDate(form.availableFrom)}`, labelOf(TENANT_OPTIONS, form.preferredTenants)].filter(Boolean).join(" · ") || "—" },
              ]
            : []),
          { step: 3, label: "Amenities", value: form.amenities.length ? form.amenities.join(", ") : "—" },
          { step: 4, label: "Photos", value: `${photos.length} photo${photos.length === 1 ? "" : "s"}` },
        ];
        return (
          <div className="space-y-6">
            <dl className="divide-y divide-gray-100 rounded-2xl ring-1 ring-gray-200 overflow-hidden">
              {rows.map((r) => (
                <div key={r.label} className="flex items-start gap-4 px-4 py-3 bg-white">
                  <dt className="w-24 shrink-0 text-sm text-gray-500">{r.label}</dt>
                  <dd className="flex-1 text-sm font-medium text-gray-900 break-words">{r.value}</dd>
                  <button type="button" onClick={() => setStep(r.step)} className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" aria-label={`Edit ${r.label}`}>
                    <Pencil size={14} />
                  </button>
                </div>
              ))}
            </dl>
            <p className="text-xs text-gray-500">
              By publishing you confirm you own this property or are authorised to list it, and that the details are accurate.
            </p>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* Progress header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl px-5 sm:px-8 py-6 mb-6 shadow-lg shadow-blue-600/20">
        <Stepper step={step} maxVisited={maxVisited} onJump={(i) => (i <= step ? setStep(i) : goTo(i))} />
        <div className="mt-5 flex items-end justify-between gap-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-100">Step {step + 1} of {STEPS.length}</p>
            <h2 className="text-2xl font-bold">{stepInfo.hint}</h2>
          </div>
          <div className="hidden sm:block w-40 h-2 rounded-full bg-white/20 overflow-hidden" aria-hidden="true">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-3xl ring-1 ring-black/5 shadow-sm">
          <div className="p-5 sm:p-8">
            {draftRestored && step === 0 && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                <span>We restored your unfinished listing. Photos need to be added again.</span>
                <button type="button" onClick={discardDraft} className="inline-flex items-center gap-1 font-medium hover:underline"><RotateCcw size={14} /> Start over</button>
              </div>
            )}
            {submitError && (
              <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-red-600 shrink-0" size={20} />
                <span className="text-red-800 font-medium">{submitError}</span>
              </div>
            )}
            <div key={step} className="animate-[fadeIn_.25s_ease-out]">{renderStep()}</div>
          </div>

          {/* Navigation */}
          <div className="sticky bottom-0 flex items-center justify-between gap-3 px-5 sm:px-8 py-4 bg-white/95 backdrop-blur border-t border-gray-100 rounded-b-3xl">
            <button
              type="button"
              onClick={() => { setStep((s) => s - 1); scrollTop(); }}
              disabled={step === 0}
              className="inline-flex items-center gap-1 px-5 py-3 rounded-full font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-0"
            >
              <ChevronLeft size={18} /> Back
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25 disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {submittingLabel}</>
                ) : (
                  <><Send size={18} /> {submitLabel}</>
                )}
              </button>
            ) : (
              <button type="button" onClick={() => goTo(step + 1)} className="inline-flex items-center gap-1 px-7 py-3 rounded-full font-semibold text-white bg-gray-900 hover:bg-gray-800">
                Continue <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Live preview + quality */}
        <aside className="space-y-5 lg:sticky lg:top-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Live preview</p>
            <div inert className="pointer-events-none select-none">
              <PropertyCard listing={previewListing} />
            </div>
          </div>
          <QualityMeter checks={checks} />
        </aside>
      </div>
    </div>
  );
}
