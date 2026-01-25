const { ref } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review.js");
const User = require("./user.js");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type: String,
        require: true,
    },
    description: String,
    image: {
        filename: String,
        url: String,
    }, // Main/primary image (first image) - kept for backward compatibility
    images: [{
        filename: String,
        url: String,
    }], // Array of all property images (1-8 images)
    price: Number,
    location: String,
    country: String,
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    type: {
        type: String,
        enum: ["buy", "rent"],
        default: "buy"
    },
    propertyCategory: String,
    amenities: [String],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;