const User = require("../models/user");


// signup (POST)
// Handles user registration and returns a JSON response.
module.exports.signup = async (req, res, next) => {
    try {
        let { firstName, lastName, email, password } = req.body;
        const newUser = new User({ firstName, lastName, email });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            // Send success message as JSON
            res.status(201).json({ 
                message: "User registered successfully!", 
                user: {
                    id: registeredUser._id,
                    firstName: registeredUser.firstName,
                    lastName: registeredUser.lastName,
                    email: registeredUser.email
                }
            });
        });
    } catch (err) {
        // Send error message as JSON
        res.status(400).json({ error: err.message });
    }
};


// login (POST)
// Handles user login and returns a JSON response with user info.
module.exports.login = async (req, res) => {
    // A successful login through Passport will set req.user
    res.status(200).json({ 
        message: "Login successful!", 
        user: {
            id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email
        }
    });
};

// logout (GET)
// Handles user logout and returns a JSON success message.
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.status(200).json({ message: "You are logged out!" });
    });
};

// getCurrentUser (GET)
// Returns the current logged-in user information.
module.exports.getCurrentUser = (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.status(200).json({
            user: {
                id: req.user._id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email
            }
        });
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
};