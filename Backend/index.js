// index.js
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


const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];
const corsOptions = {
    origin: function (origin, callback) {
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

store.on("error", (e) => {
    console.log("Session Store Error", e);
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

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy({
    usernameField: 'email' // Use email instead of username
}, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Wanderlust API!" });
});

// Use API-specific route prefixes
app.use("/api/listings/:id/reviews", reviewsRouter);
app.use("/api/users", userRouter);
app.use("/users", userRouter); // Also mount at /users for frontend compatibility
app.use("/api/listings", listingsRouter);


// Error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).json({ error: message });
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});