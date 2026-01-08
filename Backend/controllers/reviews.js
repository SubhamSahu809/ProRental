const Listing = require("../models/listing");
const Review = require("../models/review");

// createReview (POST /api/listings/:id/reviews)
// Creates a new review and returns the created review as JSON.
module.exports.createReview = async (req, res, next) => {
    try {
        let listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }
        
        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();
        
        // Populate author before sending response
        await newReview.populate('author');
        
        // Send a 201 Created status and the new review object.
        res.status(201).json({ 
            message: "Review added successfully!",
            review: newReview 
        });
    } catch (error) {
        next(error);
    }
};

// destroyReview (DELETE /api/listings/:id/reviews/:reviewId)
// Deletes a review and returns a success message as JSON.
module.exports.destroyReview = async (req, res, next) => {
    try {
        let { id, reviewId } = req.params;
        
        // Check if review exists
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }
        
        // Atomically remove the review reference from the listing.
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        
        // Delete the review document itself.
        await Review.findByIdAndDelete(reviewId);
        
        // Send a success message with a 200 OK status.
        res.status(200).json({ message: "Review deleted successfully!" });
    } catch (error) {
        next(error);
    }
};