// Shared property constants and formatting helpers.

export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

export const MAIN_CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "land", label: "Land / Plots" },
  { value: "commercial", label: "Commercial" },
];

export const PROPERTY_CATEGORIES = {
  residential: [
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "Independent House" },
    { value: "villa", label: "Villa" },
    { value: "condo", label: "Condominium" },
    { value: "townhouse", label: "Townhouse" },
    { value: "studio", label: "Studio / 1RK" },
    { value: "pg", label: "PG / Hostel" },
  ],
  land: [
    { value: "residential_plot", label: "Residential Plot" },
    { value: "commercial_plot", label: "Commercial Plot" },
    { value: "agricultural_land", label: "Agricultural Land" },
    { value: "industrial_plot", label: "Industrial Plot" },
    { value: "farmhouse_plot", label: "Farmhouse Plot" },
  ],
  commercial: [
    { value: "office", label: "Office Space" },
    { value: "retail", label: "Retail Shop" },
    { value: "warehouse", label: "Warehouse" },
    { value: "restaurant", label: "Restaurant" },
    { value: "hotel", label: "Hotel / Lodge" },
    { value: "mall", label: "Shopping Mall" },
    { value: "factory", label: "Factory" },
  ],
};

export const AMENITIES = {
  residential: [
    "Parking", "Swimming Pool", "Gym", "Garden", "Balcony", "Air Conditioning", "Elevator",
    "Security", "Power Backup", "Internet Ready", "Clubhouse", "Children's Play Area",
    "Water Supply 24/7", "Gated Community",
  ],
  land: [
    "Road Access", "Electricity Connection", "Water Supply", "Drainage System", "Security Fencing",
    "Corner Plot", "Gated Community", "Near Highway", "Residential Approved", "Commercial Approved",
    "Boundary Wall", "Tree Plantation", "Soil Testing Done",
  ],
  commercial: [
    "Parking", "Elevator", "Security", "Air Conditioning", "Power Backup", "Fire Safety", "CCTV",
    "Reception Area", "Conference Room", "Cafeteria", "High Speed Internet", "Loading Dock",
    "Storage Space", "Washrooms", "24/7 Access", "Visitor Parking",
  ],
};

export const FURNISHING_OPTIONS = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi-furnished", label: "Semi-furnished" },
  { value: "fully-furnished", label: "Fully furnished" },
];

export const TENANT_OPTIONS = [
  { value: "any", label: "Anyone" },
  { value: "family", label: "Family" },
  { value: "bachelors", label: "Bachelors" },
  { value: "students", label: "Students" },
  { value: "company", label: "Company lease" },
];

const ALL_CATEGORIES = Object.values(PROPERTY_CATEGORIES).flat();

/** Initial state of the add/edit property form. */
export const EMPTY_PROPERTY_FORM = {
  title: "",
  description: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  location: "",
  country: "India",
  type: "rent",
  propertyCategory: "apartment",
  amenities: [],
  deposit: "",
  furnishing: "",
  availableFrom: "",
  preferredTenants: "",
  petsAllowed: "",
};

/** Turn an API listing into add/edit form state. */
export function listingToForm(listing) {
  const form = Object.fromEntries(
    Object.keys(EMPTY_PROPERTY_FORM).map((key) => [key, listing[key] ?? EMPTY_PROPERTY_FORM[key]])
  );
  return {
    ...form,
    amenities: Array.isArray(listing.amenities) ? listing.amenities : [],
    availableFrom: listing.availableFrom ? String(listing.availableFrom).slice(0, 10) : "",
    petsAllowed: listing.petsAllowed === true ? "true" : listing.petsAllowed === false ? "false" : "",
  };
}

export function mainCategoryOf(propertyCategory) {
  for (const [main, list] of Object.entries(PROPERTY_CATEGORIES)) {
    if (list.some((c) => c.value === propertyCategory)) return main;
  }
  return "residential";
}

export const labelOf = (options, value) => options.find((o) => o.value === value)?.label || "";
export const categoryLabel = (value) => labelOf(ALL_CATEGORIES, value);

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatPrice(price) {
  return Number.isFinite(price) ? inr.format(price) : "Price on request";
}

/** "₹15,000/month" for rentals, "₹45,00,000" for sale */
export function formatListingPrice(listing) {
  const base = formatPrice(listing?.price);
  return listing?.type === "rent" && Number.isFinite(listing?.price) ? `${base}/month` : base;
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function listingImages(listing) {
  const urls = (listing?.images || []).map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
  if (urls.length === 0 && listing?.image?.url) urls.push(listing.image.url);
  return urls.length ? urls : [PLACEHOLDER_IMAGE];
}

/** Cloudinary on-the-fly resize + automatic format/quality. Other URLs are returned unchanged. */
export function optimizedImage(url, width = 800) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

/** Valid [lng, lat] or null (older listings were stored at [0, 0]). */
export function listingCoordinates(listing) {
  const coords = listing?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length !== 2) return null;
  const [lng, lat] = coords;
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || (lng === 0 && lat === 0)) return null;
  return [lng, lat];
}
