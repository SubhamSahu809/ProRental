const Listing = require("../models/listing");
const Review = require("../models/review");

// createReview (POST /api/listings/:id/reviews)
// Creates a new review and returns the created review as JSON.
module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }
    
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    
    // Send a 201 Created status and the new review object.
    res.status(201).json({ 
        message: "Review added successfully!",
        review: newReview 
    });
};

// destroyReview (DELETE /api/listings/:id/reviews/:reviewId)
// Deletes a review and returns a success message as JSON.
module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    
    // Atomically remove the review reference from the listing.
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    
    // Delete the review document itself.
    await Review.findByIdAndDelete(reviewId);
    
    // Send a success message with a 200 OK status.
    res.status(200).json({ message: "Review deleted successfully!" });
};