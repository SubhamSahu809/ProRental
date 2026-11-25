const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Messages submitted through the site-wide "Get in touch" form.
const contactMessageSchema = new Schema(
    {
        firstName: { type: String, required: true, trim: true, maxlength: 100 },
        lastName: { type: String, trim: true, maxlength: 100 },
        email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
        phone: { type: String, trim: true, maxlength: 30 },
        message: { type: String, required: true, trim: true, maxlength: 2000 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
