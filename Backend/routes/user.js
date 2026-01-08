const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

// SignUp Route: Handles user registration. The form rendering part is removed.
router.post("/signup", wrapAsync(userController.signup));

// Login Route: Handles user login with proper JSON error handling.
router.post(
    "/login", 
    saveRedirectUrl,
    (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                return res.status(500).json({ error: err.message || "An error occurred during authentication" });
            }
            if (!user) {
                return res.status(401).json({ error: info?.message || "Invalid email or password" });
            }
            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({ error: "Login failed" });
                }
                next();
            });
        })(req, res, next);
    },
    userController.login
);

// Logout Route: Handles user logout.
router.get("/logout", userController.logout);

// Get Current User Route: Returns current logged-in user info.
router.get("/me", userController.getCurrentUser);

module.exports = router;