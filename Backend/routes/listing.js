const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const { uploadImages } = require("../cloudConfig.js");

// Search / browse listings (filters + pagination)
router.get("/", wrapAsync(listingController.index));

// Listings owned by the current user. Must come before "/:id".
router.get("/owner/properties", isLoggedIn, wrapAsync(listingController.getUserListings));

router.get("/:id", wrapAsync(listingController.showListing));

router.post(
    "/",
    isLoggedIn,
    uploadImages("listing[images]", { required: true }),
    validateListing,
    wrapAsync(listingController.createListing)
);

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Accepts 0-8 new images (listing[images]) and listing[keepImages][] for existing URLs to keep.
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    uploadImages("listing[images]", { required: false }),
    validateListing,
    wrapAsync(listingController.updateListing)
);

router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
