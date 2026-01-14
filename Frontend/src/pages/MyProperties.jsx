import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Edit, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import PropertyCard from '../components/shared/PropertyCard';
import API_URL from '../config/api';

function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      const response = await fetch(`${API_URL}/api/listings/owner/properties`, {
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
      
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        throw new Error('Failed to load properties');
      }
    } catch (error) {
      console.error("Error loading properties:", error);
      alert(`Error loading properties: ${error.message}`);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/listings/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setProperties(properties.filter(prop => prop._id !== id));
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert(`Error deleting property: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full mx-auto">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner message="Loading your properties..." />
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
                onClick={() => navigate("/add-property")}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Your First Property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  showActions={true}
                  onDelete={handleDelete}
                />
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
