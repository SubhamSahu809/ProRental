const Listing = require("../models/listing");
const Review = require("../models/review");

// POST /api/listings/:id/reviews
module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate("reviews", "author");
    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }
    if (listing.owner && listing.owner.equals(req.user._id)) {
        return res.status(403).json({ error: "You can't review your own property." });
    }
    if (listing.reviews.some((r) => r.author && r.author.equals(req.user._id))) {
        return res.status(409).json({ error: "You have already reviewed this property." });
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    await newReview.save();

    await Listing.updateOne({ _id: listing._id }, { $push: { reviews: newReview._id } });

    res.status(201).json({
        message: "Review added successfully!",
        review: {
            ...newReview.toObject(),
            author: { _id: req.user._id, firstName: req.user.firstName, lastName: req.user.lastName },
        },
    });
};

// DELETE /api/listings/:id/reviews/:reviewId
module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: "Review deleted successfully!" });
};
