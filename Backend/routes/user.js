const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, authLimiter, validateBody } = require("../middleware.js");
const { signupSchema } = require("../schema.js");
const userController = require("../controllers/users.js");

router.post("/signup", authLimiter, validateBody(signupSchema), wrapAsync(userController.signup));

router.post(
    "/login",
    authLimiter,
    (req, res, next) => {
        passport.authenticate("local", (err, user) => {
            if (err) return next(err);
            if (!user) {
                // Same message for unknown email and wrong password
                return res.status(401).json({ error: "Invalid email or password" });
            }
            // passport >= 0.6 regenerates the session here (prevents session fixation)
            req.login(user, (loginErr) => (loginErr ? next(loginErr) : next()));
        })(req, res, next);
    },
    userController.login
);

// POST is the correct verb for a state change; GET kept for older clients.
router.post("/logout", userController.logout);
router.get("/logout", userController.logout);

router.get("/me", userController.getCurrentUser);

router.get("/wishlist", isLoggedIn, wrapAsync(userController.getWishlist));
router.post("/wishlist/:listingId", isLoggedIn, wrapAsync(userController.toggleWishlist));

module.exports = router;
