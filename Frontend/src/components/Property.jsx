import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, Camera, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiUrl } from "../utils/api"

const Property = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const response = await fetch(apiUrl(`/api/listings/${id}`), {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Property not found')
      }
      
      const data = await response.json()
      
      // Transform backend data to component format
      const transformedProperty = {
        id: data._id,
        name: data.title,
        location: data.location,
        price: `$${data.price?.toLocaleString() || '0'}`,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        sqft: data.area?.toLocaleString() || '0',
        status: data.type === 'rent' ? 'For Rent' : 'For Sale',
        description: data.description || 'No description available.',
        amenities: data.amenities || [],
        // Use the main image for all three slots if only one image exists
        mainImage: data.image?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        images: [
          data.image?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          data.image?.url || 'https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=1200&q=80',
          data.image?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'
        ]
      }
      
      setProperty(transformedProperty)
    } catch (err) {
      console.error('Error fetching property:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const nextImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
    }
  }

  const prevImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Property not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Properties
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Properties
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        {/* Photos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Big image on left (spans 2 cols) */}
          <div className="relative lg:col-span-2">
            <img
              src={property.mainImage}
              alt={property.name}
              className="w-full h-[360px] lg:h-[560px] object-cover rounded-2xl border border-blue-200"
            />

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-white/90 text-xs font-medium px-4 py-2 rounded-full shadow">
                {property.status}
              </span>
            </div>

            {/* Like Button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={handleLike}
                className={`p-3 rounded-full shadow-lg transition-all ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Show All Photos Button - bottom right */}
            <div className="absolute bottom-4 right-4">
              <button className="bg-white/90 hover:bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all flex items-center gap-2">
                <Camera size={16} />
                Show All Photos ({property.mainImage ? 1 : 0})
              </button>
            </div>
          </div>

          {/* Two stacked images on right */}
          <div className="grid grid-rows-2 gap-4">
            <img
              src={property.images[1]}
              alt={`${property.name} view 2`}
              className="w-full h-[178px] lg:h-[270px] object-cover rounded-2xl"
            />
            <img
              src={property.images[2]}
              alt={`${property.name} view 3`}
              className="w-full h-[178px] lg:h-[270px] object-cover rounded-2xl"
            />
          </div>
        </div>

        {/* Details below photos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
              <p className="text-gray-600 flex items-center mb-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                {property.location}
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <span>🛏️</span>
                  {property.bedrooms} Beds
                </span>
                <span className="flex items-center gap-1">
                  <span>🛁</span>
                  {property.bathrooms} Baths
                </span>
                <span className="flex items-center gap-1">
                  <span>📐</span>
                  {property.sqft} sq.ft
                </span>
              </div>
            </div>

            {/* Overview Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Overview</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {property.description}
              </p>
            </div>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-3">
                  {property.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Contact Agent
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Schedule Tour
              </button>
            </div>
          </div>

          {/* Right column - Price Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Property {property.status === 'For Rent' ? 'For Rent' : 'For Sale'}</h3>
              <p className="text-5xl font-bold text-gray-900 mb-4">{property.price}</p>
              <p className="text-gray-600 mb-6">Get in touch for more about this property</p>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 text-left">10+ Featured Agents</h4>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="Agent 1"
                    />
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                      src="https://randomuser.me/api/portraits/men/33.jpg"
                      alt="Agent 2"
                    />
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                      src="https://randomuser.me/api/portraits/women/34.jpg"
                      alt="Agent 3"
                    />
                    <img
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                      src="https://randomuser.me/api/portraits/men/35.jpg"
                      alt="Agent 4"
                    />
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <span className="flex">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                      </svg>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                      </svg>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                      </svg>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                      </svg>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                      </svg>
                    </span>
                    <span className="ml-2 text-gray-700 font-semibold">5/5</span>
                  </div>
                </div>
                <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                  Request Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Property;