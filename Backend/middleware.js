const rateLimit = require("express-rate-limit");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const { deleteUploadedFiles } = require("./cloudConfig.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to perform this action" });
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: "Property does not exist!" });
        }
        if (!listing.owner || !listing.owner.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not the owner of this property." });
        }
        res.locals.listing = listing;
        next();
    } catch (err) {
        next(err);
    }
};

// Multipart form fields all arrive as strings; turn them into the types the schema expects.
function normalizeListingBody(listing) {
    const numberFields = ["price", "bedrooms", "bathrooms", "area", "deposit"];
    for (const field of numberFields) {
        if (listing[field] === "" || listing[field] === undefined) delete listing[field];
        else listing[field] = Number(listing[field]);
    }

    for (const field of ["furnishing", "preferredTenants", "availableFrom", "type", "propertyCategory", "country"]) {
        if (listing[field] === "") delete listing[field];
    }

    if (listing.petsAllowed === "" || listing.petsAllowed === undefined) delete listing.petsAllowed;
    else if (typeof listing.petsAllowed === "string") listing.petsAllowed = listing.petsAllowed === "true";

    // Amenities may arrive as an array, a single string, or a JSON-encoded array (older clients).
    let { amenities } = listing;
    if (typeof amenities === "string") {
        try {
            const parsed = JSON.parse(amenities);
            amenities = Array.isArray(parsed) ? parsed : [amenities];
        } catch {
            amenities = amenities ? [amenities] : [];
        }
    }
    listing.amenities = Array.isArray(amenities) ? amenities.filter(Boolean) : [];

    if (listing.keepImages !== undefined && !Array.isArray(listing.keepImages)) {
        listing.keepImages = [listing.keepImages];
    }
    return listing;
}

module.exports.validateListing = async (req, res, next) => {
    try {
        if (req.body && req.body.listing) normalizeListingBody(req.body.listing);

        const { error, value } = listingSchema.validate(req.body || {}, { abortEarly: false });
        if (error) {
            // Uploads already went to Cloudinary before validation; don't leave them orphaned.
            await deleteUploadedFiles(req.files);
            const msg = error.details.map((el) => el.message.replace(/"/g, "")).join(", ");
            return next(new ExpressError(400, msg));
        }
        req.body = value;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports.validateBody = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body || {}, { abortEarly: false, stripUnknown: true });
    if (error) {
        const msg = error.details.map((el) => el.message.replace(/"/g, "")).join(", ");
        return next(new ExpressError(400, msg));
    }
    req.body = value;
    next();
};

module.exports.validateReview = module.exports.validateBody(reviewSchema);

module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review does not exist!" });
        }
        if (!review.author || !review.author.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not the author of this review." });
        }
        next();
    } catch (err) {
        next(err);
    }
};

const limiterMessage = (msg) => ({ error: msg });

// Brute-force protection for login/signup
module.exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: limiterMessage("Too many attempts. Please wait 15 minutes and try again."),
});

// Spam protection for public forms (enquiries, contact)
module.exports.formLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: limiterMessage("Too many messages sent. Please try again later."),
});
