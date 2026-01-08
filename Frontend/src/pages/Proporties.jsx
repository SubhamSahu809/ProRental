import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Proporties() {
  const [propertyType, setPropertyType] = useState('buy')
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/listings', {
        credentials: 'include'
      })
      const data = await response.json()
      
      // Transform backend data to match frontend format
      const transformedProperties = data.map((listing) => ({
        id: listing._id,
        name: listing.title,
        location: listing.location,
        price: `$${listing.price?.toLocaleString() || '0'}`,
        bedrooms: listing.bedrooms || 0,
        bathrooms: listing.bathrooms || 0,
        sqft: listing.area?.toString() || '0',
        status: listing.type === 'rent' ? 'For Rent' : 'For Sale',
        image: listing.image?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
      }))
      
      setProperties(transformedProperties)
    } catch (error) {
      console.error('Error fetching properties:', error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter(property => {
    if (propertyType === 'buy') {
      return property.status === 'For Sale'
    } else {
      return property.status === 'For Rent'
    }
  })

  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            DISCOVER PROPERTIES TAILORED TO YOUR LIFESTYLE AND NEEDS
          </h1>
          {/* Toggle Button */}
          <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
            <button
              onClick={() => setPropertyType('buy')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                propertyType === 'buy' 
                  ? 'bg-black text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setPropertyType('rent')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                propertyType === 'rent' 
                  ? 'bg-black text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rent
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No properties found. Be the first to add one!</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative">
                <img 
                  className="w-full h-48 object-cover" 
                  src={property.image} 
                  alt={property.name} 
                />
                <span className="absolute top-3 right-3 bg-white/90 text-xs font-medium px-2 py-0.5 rounded shadow text-gray-700">
                  {property.status}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center text-xs text-gray-500 mb-1 gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></span>
                  {property.location}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{property.name}</h2>
                <div className="flex items-center text-xs text-gray-500 mb-2 gap-3">
                  <span>{property.bedrooms} 🛏️</span>
                  <span>{property.bathrooms} 🛁</span>
                  <span>{property.sqft} sqft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-green-600">{property.price}</span>
                  <button
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="px-3 py-1 bg-black text-white rounded-full text-xs hover:bg-gray-800"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  )
}

export default Proporties