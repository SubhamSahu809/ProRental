const mongoose = require("mongoose");
const Review = require("./review.js");

const Schema = mongoose.Schema;

const imageSchema = new Schema(
    {
        filename: String,
        url: String,
    },
    { _id: false }
);

const listingSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        image: imageSchema, // Primary image (first of `images`) - kept for backward compatibility
        images: [imageSchema], // All property images (1-8)
        price: { type: Number, min: 0 },
        location: { type: String, trim: true },
        country: { type: String, trim: true, default: "India" },
        bedrooms: Number,
        bathrooms: Number,
        area: Number,
        type: {
            type: String,
            enum: ["buy", "rent"],
            default: "rent",
        },
        propertyCategory: String,
        amenities: [String],

        // Rental-specific details (only meaningful when type === "rent")
        deposit: { type: Number, min: 0 },
        furnishing: {
            type: String,
            enum: ["unfurnished", "semi-furnished", "fully-furnished"],
        },
        availableFrom: Date,
        preferredTenants: {
            type: String,
            enum: ["any", "family", "bachelors", "students", "company"],
        },
        petsAllowed: Boolean,

        reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
        owner: { type: Schema.Types.ObjectId, ref: "User" },

        // Set by geocoding when it succeeds; optional so a geocoding outage never blocks listing creation.
        geometry: {
            type: { type: String, enum: ["Point"] },
            coordinates: { type: [Number], default: undefined },
        },
    },
    { timestamps: true }
);

listingSchema.index({ type: 1, price: 1 });
listingSchema.index({ owner: 1 });
listingSchema.index({ createdAt: -1 });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
        await mongoose.model("Enquiry").deleteMany({ listing: listing._id });
    }
});

module.exports = mongoose.model("Listing", listingSchema);
