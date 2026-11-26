// ==============================
// Environment Setup
// ==============================
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// ==============================
// Imports
// ==============================
const dns = require("dns");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cors = require("cors");
const helmet = require("helmet");

const User = require("./models/user");

// Routes
const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const enquiryRouter = require("./routes/enquiry");
const userRouter = require("./routes/user");
const contactRouter = require("./routes/contact");

// ==============================
// App Initialization
// ==============================
const app = express();
app.set("trust proxy", 1); // Required for secure cookies behind Render/Vercel

const isProd = process.env.NODE_ENV === "production";

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
// "mongodb+srv://" URLs need a DNS SRV lookup. Some hosts' resolvers (seen on Render)
// fail it with "querySrv ENOTFOUND" even though the record exists, so on that error
// we switch to public DNS resolvers and retry with backoff instead of crash-looping.
const MAX_DB_ATTEMPTS = 6;
const PUBLIC_DNS = ["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let usingPublicDns = false;

async function connectDB() {
    for (let attempt = 1; ; attempt++) {
        try {
            await mongoose.connect(DB_URL, { serverSelectionTimeoutMS: 15000 });
            console.log(`Connected to Database${usingPublicDns ? " (via public DNS)" : ""}`);
            return mongoose;
        } catch (err) {
            console.error(`MongoDB connection failed (attempt ${attempt}/${MAX_DB_ATTEMPTS}):`, err.message);

            if (!usingPublicDns && /querySrv|ENOTFOUND|ECONNREFUSED|ETIMEOUT/i.test(err.message)) {
                dns.setServers(PUBLIC_DNS);
                dns.promises.setServers(PUBLIC_DNS);
                usingPublicDns = true;
                console.warn("Retrying with public DNS servers for the SRV lookup");
            }
            if (attempt >= MAX_DB_ATTEMPTS) {
                console.error("Giving up on MongoDB. Check ATLAS_DB_URL and Atlas Network Access (allow 0.0.0.0/0 for Render).");
                process.exit(1);
            }
            await sleep(Math.min(30000, 1000 * 2 ** attempt));
        }
    }
}

const dbReady = connectDB();

// ==============================
// Security headers + CORS
// ==============================
app.use(helmet());

// Only our own frontends may make credentialed requests.
// CLIENT_URL may hold several origins separated by commas.
const allowedOrigins = new Set(
    [
        ...(process.env.CLIENT_URL || "").split(","),
        "https://prorental.vercel.app",
        "http://localhost:5173",
    ]
        .map((o) => o.trim().replace(/\/$/, ""))
        .filter(Boolean)
);

const corsOptions = {
    origin(origin, cb) {
        // Same-origin requests (e.g. via the Vercel proxy) and tools like curl send no Origin.
        if (!origin || allowedOrigins.has(origin)) return cb(null, true);
        return cb(null, false);
    },
    credentials: true,
};
app.use(cors(corsOptions));

// ==============================
// Wait for the database
// ==============================
// On a cold start (e.g. Render free tier waking up) the server accepts requests
// before MongoDB is connected. Without this, the first logins fail after mongoose's
// 10s buffering timeout with a 500. Hold requests briefly instead, then answer 503.
const DB_WAIT_MS = 25000;

function waitForDb(timeoutMs) {
    if (mongoose.connection.readyState === 1) return Promise.resolve(true);
    return new Promise((resolve) => {
        const onConnected = () => {
            clearTimeout(timer);
            resolve(true);
        };
        const timer = setTimeout(() => {
            mongoose.connection.off("connected", onConnected);
            resolve(false);
        }, timeoutMs);
        mongoose.connection.once("connected", onConnected);
    });
}

app.use(async (req, res, next) => {
    if (req.path === "/" || req.path === "/api/health") return next();
    if (await waitForDb(DB_WAIT_MS)) return next();
    res.set("Retry-After", "5")
        .status(503)
        .json({ error: "The server is starting up. Please try again in a few seconds." });
});

// ==============================
// Body parsing
// ==============================
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(express.json({ limit: "100kb" }));

// ==============================
// Session Store
// ==============================
// Reuse mongoose's connection instead of opening a second one (which would repeat the DNS lookup)
const store = MongoStore.create({
    clientPromise: dbReady.then(() => mongoose.connection.getClient()),
    crypto: { secret: SESSION_SECRET },
    touchAfter: 24 * 60 * 60, // 1 day
});

store.on("error", (err) => {
    console.error("Session Store Error:", err);
});

app.use(
    session({
        name: "prorental.sid",
        store,
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            // The frontend talks to the API through a same-site proxy (vercel.json),
            // so "lax" works and protects against cross-site request forgery.
            // Set COOKIE_SAMESITE=none only if the frontend calls the API cross-site.
            sameSite: process.env.COOKIE_SAMESITE || "lax",
            secure: isProd,
        },
    })
);

// ==============================
// Passport Configuration
// ==============================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==============================
// Routes
// ==============================
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the ProRental API!" });
});

app.get("/api/health", (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({ ok: dbConnected, db: dbConnected ? "connected" : "connecting" });
});

app.use("/api/listings/:id/reviews", reviewsRouter);
app.use("/api/listings/:id/enquiries", enquiryRouter.listingEnquiries);
app.use("/api/enquiries", enquiryRouter.ownerEnquiries);
app.use("/api/listings", listingsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/users", userRouter);
app.use("/users", userRouter); // Frontend compatibility

app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// ==============================
// Global Error Handler
// ==============================
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong!";

    if (err.name === "ValidationError") {
        statusCode = 400;
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid data format";
    }

    if (statusCode >= 500) {
        console.error("Unhandled error:", err);
        // Never leak internal error details to clients
        message = "Something went wrong. Please try again.";
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
