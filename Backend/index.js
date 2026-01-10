// index.js

// Load env variables (local only)
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  
  const express = require("express");
  const mongoose = require("mongoose");
  const path = require("path");
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
  
  const app = express();
  
  /* =========================
     CONFIG
  ========================= */
  const PORT = process.env.PORT || 8080;
  const DB_URL = process.env.ATLAS_DB_URL;
  
  /* =========================
     DATABASE
  ========================= */
  mongoose
    .connect(DB_URL)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ DB Error:", err));
  
  /* =========================
     MIDDLEWARE
  ========================= */
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride("_method"));
  
  // Serve uploads
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  
  /* =========================
     CORS
  ========================= */
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL, // production frontend
  ];
  
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );
  
  app.options("*", cors());
  
  /* =========================
     SESSION STORE
  ========================= */
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
  
  app.use(
    session({
      store,
      name: "wanderlust-session",
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      },
    })
  );
  
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
  