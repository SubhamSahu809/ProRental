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
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this property.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    if (req.body.listing && req.body.listing.price) {
        req.body.listing.price = Number(req.body.listing.price); // Convert price to number
    }

    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        console.log(error);
        throw new ExpressError(400, msg);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log(error);
        throw new ExpressError(400, error);
        
    }else{
        next();
    }
}

module.exports.isReviewAuthor = async(req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this property.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}