// index.js

// Load env variables (local only)
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const cors = require("cors"); // New: Import cors middleware

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Allow origins from environment variable or default to localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.json()); 

const DB_URL = process.env.ATLAS_DB_URL;

main().then(() => {
    console.log("Connected to DataBase");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(DB_URL);
}

const store = MongoStore.create({
    mongoUrl: DB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60,
});

store.on("error", err => {
    console.error("❌ Session Store Error:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, 
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
    },
};

/* =========================
   PASSPORT
========================= */
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

/* =========================
   ROUTES
========================= */
app.get("/", (req, res) => {
    res.json({ message: "🚀 Wanderlust API is running" });
});

app.use("/api/listings", listingsRouter);
app.use("/api/listings/:id/reviews", reviewsRouter);
app.use("/api/users", userRouter);

// Backward compatibility
app.use("/users", userRouter);

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                error: "File too large (max 5MB)",
            });
        }
        return res.status(400).json({ error: err.message });
    }

    const status = err.statusCode || 500;
    const message =
        typeof err.message === "object"
            ? err.message.message
            : err.message || "Something went wrong";

    res.status(status).json({ error: message });
});

/* =========================
   SERVER
========================= */
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
