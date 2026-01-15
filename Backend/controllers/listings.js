const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { cloudinary } = require("../cloudConfig.js");

// All Listings (GET /api/listings)
// Returns all listings as a JSON array.
module.exports.index = async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.json(allListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

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
    return res.status(404).json({ error: "Property does not exist!" });
  }
  
  res.json(listing);
};

// Create Listing (POST /api/listings)
// Creates a new listing and returns the created object or a success message as JSON.
module.exports.createListing = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Handle geocoding - make it optional in case of API failures
    let geometry = null;
    if (mapToken && req.body.listing && req.body.listing.location) {
      try {
        let geocodeResponse = await geocodingClient
          .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
          })
          .send();
        
        if (geocodeResponse.body && geocodeResponse.body.features && geocodeResponse.body.features.length > 0) {
          geometry = geocodeResponse.body.features[0].geometry;
        }
      } catch (geocodeError) {
        console.error('Geocoding error (continuing without geometry):', geocodeError);
        // Continue without geometry if geocoding fails
      }
    }

    // Handle image URL - Cloudinary provides full URL in path, local storage uses filename
    let imageUrl, imageFilename;
    if (req.file.path) {
      // Cloudinary storage - path contains full URL
      imageUrl = req.file.path;
      imageFilename = req.file.filename || req.file.originalname;
    } else {
      // Local storage - construct relative URL
      imageFilename = req.file.filename;
      imageUrl = `/uploads/${imageFilename}`;
    }
    
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
    newListing.image = { url: imageUrl, filename: imageFilename };
    if (geometry) {
      newListing.geometry = geometry;
    }
    
    let savedListing = await newListing.save();

    // Image URL is already full URL if using Cloudinary, transform if local
    const listingObj = savedListing.toObject();
    if (listingObj.image && listingObj.image.url && !listingObj.image.url.startsWith('http')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      listingObj.image.url = baseUrl + listingObj.image.url;
    }

    // Return a success message and the new listing data.
    res.status(201).json({
      message: "New Property Created!",
      listing: savedListing,
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: error.message || "Failed to create listing" });
  }
};

// Get Listing for Edit (GET /api/listings/:id/edit)
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
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    // Handle image URL - Cloudinary provides full URL in path, local storage uses filename
    let imageUrl, imageFilename;
    if (req.file.path) {
      // Cloudinary storage - path contains full URL
      imageUrl = req.file.path;
      imageFilename = req.file.filename || req.file.originalname;
    } else {
      // Local storage - construct relative URL
      imageFilename = req.file.filename;
      imageUrl = `/uploads/${imageFilename}`;
    }
    listing.image = { url: imageUrl, filename: imageFilename };
    await listing.save();
  }

  // Update other listing fields
  Object.assign(listing, req.body.listing);
  await listing.save();
  
  // Return a success message and the updated listing data.
  res.json({ message: "Property Details Updated!", listing });
};

// Delete Listing (DELETE /api/listings/:id)
// Deletes a listing and returns a success message as JSON.
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  // Delete image from Cloudinary if it exists
  if (listing.image && listing.image.filename) {
    try {
      await cloudinary.uploader.destroy(listing.image.filename);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      // Continue with listing deletion even if image deletion fails
    }
  }

  // Delete the listing from database
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
    res.json(userListings);
  } catch (error) {
    console.error('Error in getUserListings:', error);
    res.status(500).json({ error: "Failed to fetch user listings" });
  }
};