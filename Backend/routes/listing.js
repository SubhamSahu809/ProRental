const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const { uploadArray, uploadSingle, handleMulterError } = require("../cloudConfig.js");

// All Listing Route: Fetches all listings and returns them as JSON.
router.get("/", wrapAsync(listingController.index));

// Get User's Properties Route: Returns all listings owned by the current user.
// MUST be before /:id route to avoid route conflicts
// Using "owner" prefix to avoid conflicts with listing IDs
router.get("/owner/properties", isLoggedIn, wrapAsync(listingController.getUserListings));

// Create a new listing
// The "new" route for rendering a form is not needed in a pure API.
// The frontend will handle its own form rendering.

// Show Route: Fetches a single listing and returns it as JSON.
router.get("/:id", wrapAsync(listingController.showListing));

// Create Route: Handles form data submission and returns the new listing as JSON.
router.post(
  "/",
  isLoggedIn,
  uploadArray("listing[images]", 8), // Handle 1-8 images with error handling
  validateListing,
  wrapAsync(listingController.createListing)
);

// Edit Route: Fetches a single listing's data for editing and returns it as JSON.
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Update Route: Handles an update request and returns the updated listing as JSON.
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  uploadSingle("listing[image]"), // Wrapped upload with error handling
  validateListing,
  wrapAsync(listingController.updateListing)
);

// Delete Route: Deletes a listing and returns a success message as JSON.
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);

module.exports = router;