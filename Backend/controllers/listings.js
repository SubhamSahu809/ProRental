const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// All Listings (GET /api/listings)
// Returns all listings as a JSON array.
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  
  // Transform image URLs to full URLs
  const listingsWithFullUrls = allListings.map(listing => {
    const listingObj = listing.toObject();
    if (listingObj.image && listingObj.image.url && !listingObj.image.url.startsWith('http')) {
      // Convert relative URL to full URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      listingObj.image.url = baseUrl + listingObj.image.url;
    }
    return listingObj;
  });
  
  res.json(listingsWithFullUrls);
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
  
  // Transform image URL to full URL
  const listingObj = listing.toObject();
  if (listingObj.image && listingObj.image.url && !listingObj.image.url.startsWith('http')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    listingObj.image.url = baseUrl + listingObj.image.url;
  }
  
  res.json(listingObj);
};

// Create Listing (POST /api/listings)
// Creates a new listing and returns the created object or a success message as JSON.
module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  // Construct URL for local file storage
  const filename = req.file.filename;
  const url = `/uploads/${filename}`;
  
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
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;
  let savedListing = await newListing.save();

  // Transform image URL to full URL
  const listingObj = savedListing.toObject();
  if (listingObj.image && listingObj.image.url && !listingObj.image.url.startsWith('http')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    listingObj.image.url = baseUrl + listingObj.image.url;
  }

  // Return a success message and the new listing data.
  res.status(201).json({
    message: "New Property Created!",
    listing: listingObj,
  });
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
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    const filename = req.file.filename;
    const url = `/uploads/${filename}`;
    listing.image = { url, filename };
    await listing.save();
  }
  
  // Return a success message and the updated listing data.
  res.json({ message: "Property Details Updated!", listing });
};

// Delete Listing (DELETE /api/listings/:id)
// Deletes a listing and returns a success message as JSON.
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
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
    
    // Transform image URLs to full URLs
    const listingsWithFullUrls = userListings.map(listing => {
      const listingObj = listing.toObject();
      if (listingObj.image && listingObj.image.url && !listingObj.image.url.startsWith('http')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        listingObj.image.url = baseUrl + listingObj.image.url;
      }
      return listingObj;
    });
    
    res.json(listingsWithFullUrls);
  } catch (error) {
    console.error('Error in getUserListings:', error);
    res.status(500).json({ error: "Failed to fetch user listings" });
  }
};