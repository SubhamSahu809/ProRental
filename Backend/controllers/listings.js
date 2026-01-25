const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// All Listings (GET /api/listings)
// Returns all listings as a JSON array.
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  
  // Cloudinary URLs are already full URLs, no transformation needed
  const listings = allListings.map(listing => listing.toObject());
  
  res.json(listings);
};

// Render New Form (GET /api/listings/new)
// This is not needed in an API. The frontend will handle its own forms.

// Show Listing (GET /api/listings/:id)
// Returns a single listing with populated reviews and owner details as JSON.
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    // Return a 404 error with a JSON message instead of redirecting.
    return res.status(404).json({ error: "Property does not exist!" });
  }
  
  // Cloudinary URLs are already full URLs, no transformation needed
  res.json(listing.toObject());
};

// Create Listing (POST /api/listings)
// Creates a new listing and returns the created object or a success message as JSON.
module.exports.createListing = async (req, res, next) => {
  try {
    // Check if files were uploaded (req.files is an array for multiple uploads)
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one property image is required" });
    }

    // Validate that we have between 1 and 8 images
    if (req.files.length < 1 || req.files.length > 8) {
      return res.status(400).json({ error: "Please upload between 1 and 8 images" });
    }

    // Validate location exists
    if (!req.body.listing || !req.body.listing.location) {
      return res.status(400).json({ error: "Location is required" });
    }

    // Geocode the location
    let response;
    try {
      response = await geocodingClient
        .forwardGeocode({
          query: req.body.listing.location,
          limit: 1,
        })
        .send();
    } catch (geocodeError) {
      console.error('Geocoding error:', geocodeError);
      return res.status(500).json({ error: "Failed to geocode location. Please check the location and try again." });
    }

    // Check if geocoding returned results
    if (!response.body || !response.body.features || response.body.features.length === 0) {
      return res.status(400).json({ error: "Could not find the specified location. Please provide a more specific address." });
    }

    // Process all uploaded images
    const images = [];
    for (const file of req.files) {
      // Validate Cloudinary upload was successful for each file
      if (!file || !file.path) {
        console.error('Cloudinary upload failed for file:', file);
        return res.status(500).json({ error: "Failed to upload one or more images to cloud storage. Please try again." });
      }

      const imageData = {
        url: file.path, // Cloudinary URL
        filename: file.filename || file.public_id // Cloudinary public_id
      };
      
      images.push(imageData);
      
      console.log('Image uploaded successfully to Cloudinary:', {
        url: imageData.url,
        filename: imageData.filename,
        originalname: file.originalname,
        index: images.length
      });
    }
    
    // Get the first image as the main image (for backward compatibility)
    const mainImage = images[0];
    
    const listingData = { ...req.body.listing };
    
    // Parse amenities if it's a JSON string
    if (listingData.amenities && typeof listingData.amenities === 'string') {
      try {
        listingData.amenities = JSON.parse(listingData.amenities);
      } catch (e) {
        listingData.amenities = [];
      }
    }
    
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    newListing.image = mainImage; // Main image (first image) for backward compatibility
    newListing.images = images; // All images array (1-8 images)
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();

    console.log(`Successfully created listing with ${images.length} image(s)`);

    // Return a success message and the new listing data.
    res.status(201).json({
      message: "New Property Created!",
      listing: savedListing.toObject(),
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    // Pass error to error handling middleware
    next(error);
  }
};

// Render Edit Form (GET /api/listings/:id/edit)
// Returns a single listing's data for editing as JSON.
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ error: "Property does not exist!" });
  }

  res.json(listing);
};

// Update Listing (PUT /api/listings/:id)
// Updates a listing and returns the updated object as JSON.
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ error: "Property does not exist!" });
  }

  // Update listing data
  Object.assign(listing, req.body.listing);

  // If a new image is uploaded, update the image URL and public_id
  if (req.file) {
    // Delete old image from Cloudinary if it exists
    if (listing.image && listing.image.filename) {
      const cloudinary = require('../cloudConfig').cloudinary;
      try {
        await cloudinary.uploader.destroy(listing.image.filename);
      } catch (error) {
        console.error('Error deleting old image from Cloudinary:', error);
      }
    }
    // Set new image URL and public_id from Cloudinary
    listing.image = {
      url: req.file.path, // Cloudinary URL
      filename: req.file.filename // Cloudinary public_id
    };
  }
  
  await listing.save();
  
  // Return a success message and the updated listing data.
  res.json({ message: "Property Details Updated!", listing: listing.toObject() });
};

// Delete Listing (DELETE /api/listings/:id)
// Deletes a listing and returns a success message as JSON.
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ error: "Property does not exist!" });
  }

  // Delete image from Cloudinary if it exists
  if (listing.image && listing.image.filename) {
    const cloudinary = require('../cloudConfig').cloudinary;
    try {
      await cloudinary.uploader.destroy(listing.image.filename);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  }

  await Listing.findByIdAndDelete(id);

  res.json({ message: "Property Deleted!" });
};

// Get User's Listings (GET /api/listings/owner/properties)
// Returns all listings owned by the current user.
module.exports.getUserListings = async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const userListings = await Listing.find({ owner: req.user._id });
    
    // Cloudinary URLs are already full URLs, no transformation needed
    const listings = userListings.map(listing => listing.toObject());
    
    res.json(listings);
  } catch (error) {
    console.error('Error in getUserListings:', error);
    res.status(500).json({ error: "Failed to fetch user listings" });
  }
};