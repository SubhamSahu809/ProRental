const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateBody, formLimiter } = require("../middleware.js");
const { enquirySchema } = require("../schema.js");
const enquiryController = require("../controllers/enquiries.js");

// Mounted at /api/listings/:id/enquiries
const listingEnquiries = express.Router({ mergeParams: true });
listingEnquiries.post("/", formLimiter, validateBody(enquirySchema), wrapAsync(enquiryController.createEnquiry));

// Mounted at /api/enquiries
const ownerEnquiries = express.Router();
ownerEnquiries.get("/received", isLoggedIn, wrapAsync(enquiryController.receivedEnquiries));
ownerEnquiries.patch("/:enquiryId/read", isLoggedIn, wrapAsync(enquiryController.markRead));

module.exports = { listingEnquiries, ownerEnquiries };
