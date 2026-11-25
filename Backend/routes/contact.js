const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { validateBody, formLimiter } = require("../middleware.js");
const { contactSchema } = require("../schema.js");
const ContactMessage = require("../models/contactMessage.js");

// POST /api/contact - site-wide "Get in touch" form
router.post(
    "/",
    formLimiter,
    validateBody(contactSchema),
    wrapAsync(async (req, res) => {
        await ContactMessage.create(req.body);
        res.status(201).json({ message: "Thanks! We'll get back to you soon." });
    })
);

module.exports = router;
