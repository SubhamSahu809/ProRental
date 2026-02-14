const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const { listingSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Always return JSON for API routes
        return res.status(401).json({ error: "You must be logged in to perform this action" });
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        // Listing not found
        if (!listing) {
            return res.status(404).json({ error: "Property does not exist!" });
        }

        // Not authenticated (defensive, isLoggedIn should run before this)
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        // Owner field missing or does not match current user
        if (!listing.owner || !listing.owner.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not the owner of this property." });
        }

        next();
    } catch (err) {
        next(err);
    }
}

module.exports.validateListing = (req, res, next) => {
    try {
        if (req.body && req.body.listing && req.body.listing.price) {
            req.body.listing.price = Number(req.body.listing.price); // Convert price to number
        }

        const { error } = listingSchema.validate(req.body || {});
        if (error) {
            const msg = error.details.map((el) => el.message).join(", ");
            console.error("Listing validation error:", msg);
            return next(new ExpressError(400, msg));
        }
        next();
    } catch (err) {
        next(err);
    }
};

module.exports.validateReview = (req, res, next) => {
    try {
        const { error } = reviewSchema.validate(req.body || {});
        if (error) {
            const errMsg = error.details.map((el) => el.message).join(", ");
            console.error("Review validation error:", errMsg);
            return next(new ExpressError(400, errMsg));
        }
        next();
    } catch (err) {
        next(err);
    }
};

module.exports.isReviewAuthor = async(req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ error: "Review does not exist!" });
        }

        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        if (!review.author || !review.author.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not the author of this review." });
        }

        next();
    } catch (err) {
        next(err);
    }
}