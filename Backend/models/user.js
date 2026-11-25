const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: { type: String, trim: true },
        wishlist: [{ type: Schema.Types.ObjectId, ref: "Listing" }],
    },
    { timestamps: true }
);

// Brute-force protection is done per IP by the rate limiter on the auth routes.
userSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
    usernameLowerCase: true,
});

module.exports = mongoose.model("User", userSchema);
