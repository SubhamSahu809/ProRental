import React from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import { DEFAULT_PROPERTY_IMAGE } from "../../constants/propertyConstants";

const PropertyCard = ({ property, showActions = false, onDelete, onEdit }) => {
  const navigate = useNavigate();

  // Handle both transformed and raw property data
  const propertyData = {
    id: property.id || property._id,
    title: property.name || property.title,
    location: property.location,
    price: property.price || `$${(property.price || 0).toLocaleString()}`,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.sqft || property.area || 0,
    status: property.status || (property.type === "rent" ? "For Rent" : "For Sale"),
    image: property.image || property.image?.url || DEFAULT_PROPERTY_IMAGE,
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          className="w-full h-48 object-cover"
          src={propertyData.image}
          alt={propertyData.title}
        />
        <span className="absolute top-3 right-3 bg-white/90 text-xs font-medium px-2 py-0.5 rounded shadow text-gray-700">
          {propertyData.status}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center text-xs text-gray-500 mb-1 gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
          {propertyData.location}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{propertyData.title}</h2>
        <div className="flex items-center text-xs text-gray-500 mb-2 gap-3">
          <span>{propertyData.bedrooms} 🛏️</span>
          <span>{propertyData.bathrooms} 🛁</span>
          <span>{propertyData.area} sqft</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-green-600">{propertyData.price}</span>
          {showActions ? (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/property/${propertyData.id}`)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                View
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(propertyData.id)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(propertyData.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate(`/property/${propertyData.id}`)}
              className="px-3 py-1 bg-black text-white rounded-full text-xs hover:bg-gray-800 transition-colors"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
