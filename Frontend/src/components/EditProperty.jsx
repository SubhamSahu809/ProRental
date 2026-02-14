import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Home,
  Bath,
  BedDouble,
  MapPin,
  DollarSign,
  ImagePlus,
  X,
  Check,
  AlertCircle,
  Building,
  TreePine,
} from "lucide-react";
import { apiUrl } from "../utils/api";

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mainCategory, setMainCategory] = useState("residential");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    location: "",
    type: "buy",
    propertyCategory: "apartment",
    amenities: [],
    photos: [],
  });

  // Existing images from API: [{ url, filename }, ...]
  const [existingImages, setExistingImages] = useState([]);
  // URLs of existing images the user chose to keep (can remove individually)
  const [keptExistingUrls, setKeptExistingUrls] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const mainCategories = [
    { value: "residential", label: "Residential Properties", icon: Home },
    { value: "land", label: "Land/Plots", icon: TreePine },
    { value: "commercial", label: "Commercial Properties", icon: Building },
  ];

  const propertyCategories = {
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

  const amenitiesList = {
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

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(apiUrl(`/api/listings/${id}/edit`), {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (response.status === 403) {
          navigate("/");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to load property for editing");
        }

        const data = await response.json();

        // Detect main category from propertyCategory
        let detectedMain = "residential";
        if (propertyCategories.land.some((c) => c.value === data.propertyCategory)) {
          detectedMain = "land";
        } else if (propertyCategories.commercial.some((c) => c.value === data.propertyCategory)) {
          detectedMain = "commercial";
        }

        // Normalize amenities to an array
        let amenities = [];
        if (Array.isArray(data.amenities)) {
          amenities = data.amenities;
        } else if (typeof data.amenities === "string" && data.amenities.trim() !== "") {
          try {
            const parsed = JSON.parse(data.amenities);
            amenities = Array.isArray(parsed) ? parsed : [data.amenities];
          } catch {
            amenities = data.amenities.split(",").map((a) => a.trim());
          }
        }

        setMainCategory(detectedMain);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          bedrooms: data.bedrooms ?? "",
          bathrooms: data.bathrooms ?? "",
          area: data.area ?? "",
          location: data.location || "",
          type: data.type || "buy",
          propertyCategory:
            data.propertyCategory || propertyCategories[detectedMain][0].value,
          amenities,
          photos: [],
        });
        // Normalize to array: listing.images or single listing.image
        const imagesList = Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : data.image && data.image.url
            ? [{ url: data.image.url, filename: data.image.filename }]
            : [];
        setExistingImages(imagesList);
        setKeptExistingUrls(imagesList.map((img) => img.url));
      } catch (error) {
        console.error("Error loading listing for edit:", error);
        setErrors({ submit: error.message || "Failed to load property" });
        setSubmitStatus("error");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id, navigate]);

  const handleMainCategoryChange = (category) => {
    setMainCategory(category);
    setFormData((prev) => ({
      ...prev,
      propertyCategory: propertyCategories[category][0].value,
      amenities: [],
    }));
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (formData.price && formData.price <= 0)
      newErrors.price = "Price must be positive";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    // Only validate bedrooms/bathrooms for residential properties
    if (mainCategory === "residential") {
      if (formData.bedrooms && formData.bedrooms < 0)
        newErrors.bedrooms = "Bedrooms cannot be negative";
      if (formData.bathrooms && formData.bathrooms < 0)
        newErrors.bathrooms = "Bathrooms cannot be negative";
    }

    if (formData.area && formData.area <= 0)
      newErrors.area = "Area must be positive";

    const totalImages = keptExistingUrls.length + formData.photos.length;
    if (totalImages === 0)
      newErrors.photos = "At least one image is required. Keep existing or add new images.";
    if (totalImages > 8)
      newErrors.photos = "Maximum 8 images allowed in total.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photos") {
      const newPhotos = Array.from(files || []);
      const totalAfter = keptExistingUrls.length + newPhotos.length;
      if (totalAfter > 8) {
        setErrors({ ...errors, photos: "Maximum 8 images allowed in total." });
        return;
      }
      setFormData({ ...formData, photos: newPhotos });
      setErrors({ ...errors, photos: "" });
    } else {
      setFormData({ ...formData, [name]: value });
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" });
      }
    }
  };

  const handleAmenityToggle = (amenity) => {
    const updatedAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter((a) => a !== amenity)
      : [...formData.amenities, amenity];
    setFormData({ ...formData, amenities: updatedAmenities });
  };

  const removeExistingImage = (url) => {
    setKeptExistingUrls((prev) => prev.filter((u) => u !== url));
    setErrors((e) => ({ ...e, photos: "" }));
  };

  const removeNewPhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setErrors((e) => ({ ...e, photos: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("listing[title]", formData.title);
      formDataToSend.append("listing[description]", formData.description);
      formDataToSend.append("listing[price]", formData.price);
      formDataToSend.append("listing[location]", formData.location);
      formDataToSend.append("listing[country]", "USA");
      formDataToSend.append("listing[bedrooms]", formData.bedrooms || 0);
      formDataToSend.append("listing[bathrooms]", formData.bathrooms || 0);
      formDataToSend.append("listing[area]", formData.area || 0);
      formDataToSend.append("listing[type]", formData.type);
      formDataToSend.append("listing[propertyCategory]", formData.propertyCategory);

      if (formData.amenities && formData.amenities.length > 0) {
        formData.amenities.forEach((amenity) => {
          formDataToSend.append("listing[amenities]", amenity);
        });
      }

      // Which existing image URLs to keep (backend merges these with new uploads)
      keptExistingUrls.forEach((url) => {
        formDataToSend.append("listing[keepImages][]", url);
      });
      // New image files (0–8 allowed; total kept + new must be 1–8)
      formData.photos.forEach((file) => {
        formDataToSend.append("listing[images]", file);
      });

      const response = await fetch(apiUrl(`/api/listings/${id}`), {
        method: "PUT",
        credentials: "include",
        body: formDataToSend,
      });

      if (!response.ok) {
        let errorMessage = "Failed to update property. Please try again.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // ignore JSON parse error
        }
        setSubmitStatus("error");
        setErrors({ submit: errorMessage });
        return;
      }

      const data = await response.json();

      if (data.message && data.listing) {
        setSubmitStatus("success");
      } else {
        setSubmitStatus("error");
        setErrors({
          submit: "Unexpected response from server. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating property:", error);
      setSubmitStatus("error");
      setErrors({
        submit: "Network error please check your connection",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAreaLabel = () => {
    switch (mainCategory) {
      case "land":
        return "Plot Size (sq ft)";
      case "commercial":
        return "Floor Area (sq ft)";
      default:
        return "Square Footage";
    }
  };

  const getAreaPlaceholder = () => {
    switch (mainCategory) {
      case "land":
        return "e.g. 5000";
      case "commercial":
        return "e.g. 2500";
      default:
        return "e.g. 1500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-3xl font-bold text-white text-center">
              Edit Property
            </h2>
            <p className="text-blue-100 text-center mt-2">
              Update your property details and upload a new photo if needed
            </p>
          </div>

          <div className="p-8">
            {/* Main Category Selection - Tab Style */}
            <div className="mb-8">
              <div className="flex justify-center">
                <div className="bg-gray-200 p-1 rounded-xl inline-flex">
                  {mainCategories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleMainCategoryChange(category.value)}
                      className={`px-6 py-3 rounded-lg font-medium text-base transition-all duration-200 ${
                        mainCategory === category.value
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Success Popup Modal */}
            {submitStatus === "success" && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Changes Saved!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your property has been updated successfully.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitStatus(null);
                      navigate(`/property/${id}`);
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    View Property
                  </button>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <span className="text-red-800 font-medium">
                  {errors.submit || "Please fix the errors below"}
                </span>
              </div>
            )}

            <div onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.title ? "border-red-300" : "border-gray-200"
                      }`}
                      placeholder="e.g. Luxury 3BHK Apartment in Downtown"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                        errors.description
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                      placeholder="Update the description for your property..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Property Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {mainCategory === "residential" && "Property Category"}
                      {mainCategory === "land" && "Land Type"}
                      {mainCategory === "commercial" && "Business Type"}
                    </label>
                    <select
                      name="propertyCategory"
                      value={formData.propertyCategory}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {propertyCategories[mainCategory].map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bedrooms - Only for Residential */}
                  {mainCategory === "residential" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <BedDouble size={16} /> Bedrooms
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        min="0"
                        className={`w-full rounded-xl border-2 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.bedrooms
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                        placeholder="3"
                      />
                      {errors.bedrooms && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.bedrooms}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Bathrooms - Only for Residential and Commercial */}
                  {(mainCategory === "residential" ||
                    mainCategory === "commercial") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Bath size={16} />{" "}
                        {mainCategory === "residential"
                          ? "Bathrooms"
                          : "Washrooms"}
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        min="0"
                        step="0.5"
                        className={`w-full rounded-xl border-2 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.bathrooms
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                        placeholder="2"
                      />
                      {errors.bathrooms && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.bathrooms}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Home size={16} /> {getAreaLabel()}
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      min="1"
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.area ? "border-red-300" : "border-gray-200"
                      }`}
                      placeholder={getAreaPlaceholder()}
                    />
                    {errors.area && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.area}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign size={16} /> Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="1"
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.price ? "border-red-300" : "border-gray-200"
                      }`}
                      placeholder="250000"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="buy">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full rounded-xl border-2 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.location ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="e.g. Downtown, New York, NY"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Amenities/Features */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  {mainCategory === "land" && "Land Features"}
                  {mainCategory === "commercial" && "Business Features"}
                  {mainCategory === "residential" && "Amenities"}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenitiesList[mainCategory].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                        formData.amenities.includes(amenity)
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Photos: one row of all images (existing + new), then add block */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Property Photos *
                </h3>
                <p className="text-sm text-gray-600">
                  Click the red × on any image to remove it. Add new ones below. At least 1 image, max 8 total.
                </p>

                {/* Single row: kept existing + new uploads */}
                {(keptExistingUrls.length > 0 || formData.photos.length > 0) && (
                  <div className="flex flex-wrap gap-4">
                    {existingImages
                      .filter((img) => keptExistingUrls.includes(img.url))
                      .map((img) => (
                        <div key={img.url} className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32">
                          <img
                            src={img.url}
                            alt="Property"
                            className="w-full h-full object-cover rounded-xl shadow-md border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.url)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            <X size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))}
                    {formData.photos.map((file, index) => (
                      <div key={`new-${index}`} className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="New upload"
                          className="w-full h-full object-cover rounded-xl shadow-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(index)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    name="photos"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="hidden"
                    id="photo-upload-edit"
                  />
                  <label htmlFor="photo-upload-edit" className="cursor-pointer">
                    <ImagePlus className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 font-medium">Add new photos</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Maximum 8 images in total ({keptExistingUrls.length + formData.photos.length} currently)
                    </p>
                  </label>
                </div>
                {errors.photos && (
                  <p className="text-red-500 text-sm">{errors.photos}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02]"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving Changes...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

