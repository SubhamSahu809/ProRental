import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Edit, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiUrl } from "../utils/api";

function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      const response = await fetch(apiUrl("/api/listings/owner/properties"), {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.status === 401) {
        setProperties([]);
        navigate('/');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch properties: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
      alert(`Error loading properties: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      // Use POST + method override to avoid CORS preflight issues with DELETE.
      // Backend has method-override("_method") enabled, so this will still hit
      // the DELETE /api/listings/:id route on the server.
      const response = await fetch(apiUrl(`/api/listings/${id}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          // Use a "simple" content type to avoid triggering a CORS preflight.
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: '', // no body needed; _method is in the query string
      });

      if (response.ok) {
        setProperties(properties.filter(prop => prop._id !== id));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete property:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full mx-auto">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading your properties...</p>
            <p className="mt-2 text-sm text-gray-500">Check browser console for details</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Properties</h1>
            <p className="text-gray-600">Manage all your listed properties</p>
          </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Home size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Properties Yet</h2>
            <p className="text-gray-600 mb-6">You haven't listed any properties yet.</p>
            <button
              onClick={() => navigate('/add-property')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Your First Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    className="w-full h-48 object-cover"
                    src={property.image?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
                    alt={property.title}
                  />
                  <span className="absolute top-3 right-3 bg-white/90 text-xs font-medium px-2 py-0.5 rounded shadow text-gray-700">
                    {property.type === 'rent' ? 'For Rent' : 'For Sale'}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center text-xs text-gray-500 mb-1 gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    {property.location}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h2>
                  <div className="flex items-center text-xs text-gray-500 mb-2 gap-3">
                    <span>{property.bedrooms || 0} 🛏️</span>
                    <span>{property.bathrooms || 0} 🛁</span>
                    <span>{property.area || 0} sqft</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold text-green-600">
                      ${property.price?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/property/${property._id}`)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/property/${property._id}/edit`)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(property._id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MyProperties;
