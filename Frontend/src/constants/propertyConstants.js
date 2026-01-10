// Property categories and types
export const MAIN_CATEGORIES = [
  { value: "residential", label: "Residential Properties" },
  { value: "land", label: "Land/Plots" },
  { value: "commercial", label: "Commercial Properties" },
];

export const PROPERTY_CATEGORIES = {
  residential: [
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "villa", label: "Villa" },
    { value: "condo", label: "Condominium" },
    { value: "townhouse", label: "Townhouse" },
    { value: "studio", label: "Studio" },
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
    { value: "retail", label: "Retail Store" },
    { value: "warehouse", label: "Warehouse" },
    { value: "restaurant", label: "Restaurant" },
    { value: "hotel", label: "Hotel/Lodge" },
    { value: "mall", label: "Shopping Mall" },
    { value: "factory", label: "Factory" },
  ],
};

export const AMENITIES = {
  residential: [
    "Parking",
    "Swimming Pool",
    "Gym",
    "Garden",
    "Balcony",
    "Air Conditioning",
    "Elevator",
    "Security",
    "Pet Friendly",
    "Furnished",
    "Power Backup",
    "Internet Ready",
    "Clubhouse",
    "Children's Play Area",
  ],
  land: [
    "Road Access",
    "Electricity Connection",
    "Water Supply",
    "Drainage System",
    "Security Fencing",
    "Corner Plot",
    "Gated Community",
    "Near Highway",
    "Agricultural Land",
    "Residential Approved",
    "Commercial Approved",
    "Investment Ready",
    "Boundary Wall",
    "Tree Plantation",
    "Soil Testing Done",
  ],
  commercial: [
    "Parking",
    "Elevator",
    "Security",
    "Air Conditioning",
    "Power Backup",
    "Fire Safety",
    "CCTV",
    "Reception Area",
    "Conference Room",
    "Cafeteria",
    "High Speed Internet",
    "Loading Dock",
    "Storage Space",
    "Washrooms",
    "24/7 Access",
    "Visitor Parking",
  ],
};

export const LISTING_TYPES = [
  { value: "buy", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

export const DEFAULT_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";

// Area labels based on category
export const getAreaLabel = (category) => {
  switch (category) {
    case "land":
      return "Plot Size (sq ft)";
    case "commercial":
      return "Floor Area (sq ft)";
    default:
      return "Square Footage";
  }
};

// Area placeholders based on category
export const getAreaPlaceholder = (category) => {
  switch (category) {
    case "land":
      return "e.g. 5000";
    case "commercial":
      return "e.g. 2500";
    default:
      return "e.g. 1500";
  }
};
