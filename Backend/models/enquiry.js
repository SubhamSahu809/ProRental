const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// A message from a prospective tenant/buyer to a listing's owner.
const enquirySchema = new Schema(
    {
        listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        sender: { type: Schema.Types.ObjectId, ref: "User" }, // set when the sender is logged in
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
        phone: { type: String, trim: true, maxlength: 30 },
        message: { type: String, required: true, trim: true, maxlength: 2000 },
        visitDate: Date, // optional preferred date for a property visit
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

enquirySchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Enquiry", enquirySchema);
