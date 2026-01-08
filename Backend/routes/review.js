const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const { createListing } = require("../controllers/listings.js");

const reviewController = require("../controllers/reviews.js");

// Create Route 
router.post(
    "/", 
    validateReview, 
    isLoggedIn, 
    wrapAsync(reviewController.createReview));

// delete Review Route
router.delete(
    "/:reviewId", 
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview));

module.exports = router;