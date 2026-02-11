// ==============================
// Environment Setup
// ==============================
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// ==============================
// Imports
// ==============================
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cors = require("cors");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

// Routes
const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");

// ==============================
// App Initialization
// ==============================
const app = express();
app.set("trust proxy", 1); // Required for secure cookies behind Render/Vercel/etc

// ==============================
// Environment Validation
// ==============================
const DB_URL = process.env.ATLAS_DB_URL;
const SESSION_SECRET = process.env.SECRET;

if (!DB_URL) throw new Error("Missing required env var: ATLAS_DB_URL");
if (!SESSION_SECRET) throw new Error("Missing required env var: SECRET");

// ==============================
// Database Connection
// ==============================
(async function connectDB() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected to Database");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
})();

// ==============================
// CORS Configuration
// ==============================
// Default allowed origins so the app "just works" in common setups,
// even if CLIENT_URL is not configured correctly in the environment.
const defaultAllowedOrigins = [
    "http://localhost:5173",          // Vite dev server
    "http://localhost:3000",          // Common React dev port
    "http://localhost:8080",          // Fallback local backend
    "https://prorental.vercel.app",   // Production frontend on Vercel
];

const envAllowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// Merge env + defaults, removing duplicates
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests (Postman, curl, server-to-server)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn("Blocked by CORS. Origin not allowed:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


// ==============================
// Middleware
// ==============================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// ==============================
// Session Store
// ==============================
const store = MongoStore.create({
    mongoUrl: DB_URL,
    crypto: { secret: SESSION_SECRET },
    touchAfter: 24 * 60 * 60, // 1 day
});

store.on("error", (err) => {
    console.error("Session Store Error:", err);
});

app.use(
    session({
        store,
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        },
    })
);

// ==============================
// Passport Configuration
// ==============================
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(
        { usernameField: "email" },
        User.authenticate()
    )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==============================
// Routes
// ==============================
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Wanderlust API!" });
});

app.use("/api/listings/:id/reviews", reviewsRouter);
app.use("/api/listings", listingsRouter);
app.use("/api/users", userRouter);
app.use("/users", userRouter); // Frontend compatibility

// ==============================
// Global Error Handler
// ==============================
app.use((err, req, res, next) => {
    console.error("Global error handler:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
    });

    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong!";

    if (err.name === "ValidationError") {
        statusCode = 400;
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid data format";
    } else if (err.message?.includes("Cloudinary")) {
        statusCode = 500;
        message = "Image upload failed. Check Cloudinary configuration.";
    }

    res.status(statusCode).json({ error: message });
});

// ==============================
// Server
// ==============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
