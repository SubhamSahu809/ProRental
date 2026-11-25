const User = require("../models/user");
const Listing = require("../models/listing");

const toPublicUser = (user) => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "",
    wishlist: (user.wishlist || []).map(String),
});

// POST /users/signup
module.exports.signup = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const newUser = new User({ firstName, lastName, email });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            res.status(201).json({ message: "Account created!", user: toPublicUser(registeredUser) });
        });
    } catch (err) {
        if (err.name === "UserExistsError" || err.code === 11000) {
            return res.status(409).json({ error: "An account with this email already exists." });
        }
        next(err);
    }
};

// POST /users/login (passport has already authenticated the user)
module.exports.login = (req, res) => {
    res.status(200).json({ message: "Login successful!", user: toPublicUser(req.user) });
};

// POST /users/logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie("prorental.sid");
            res.status(200).json({ message: "You are logged out!" });
        });
    });
};

// GET /users/me
module.exports.getCurrentUser = (req, res) => {
    if (req.isAuthenticated() && req.user) {
        return res.status(200).json({ user: toPublicUser(req.user) });
    }
    res.status(401).json({ error: "Not authenticated" });
};

// GET /users/wishlist
module.exports.getWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: "wishlist",
        select: "-reviews -description",
    });
    // Drop references to listings that have since been deleted
    res.json(user.wishlist.filter(Boolean));
};

// POST /users/wishlist/:listingId  (toggles)
module.exports.toggleWishlist = async (req, res) => {
    const { listingId } = req.params;
    const exists = await Listing.exists({ _id: listingId });
    if (!exists) return res.status(404).json({ error: "Property does not exist!" });

    const saved = req.user.wishlist.some((id) => id.equals(listingId));
    const update = saved ? { $pull: { wishlist: listingId } } : { $addToSet: { wishlist: listingId } };
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });

    res.json({ saved: !saved, wishlist: user.wishlist.map(String) });
};
