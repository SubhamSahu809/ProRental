const Listing = require("../models/listing");
const Enquiry = require("../models/enquiry");

// POST /api/listings/:id/enquiries  (public; logged-in users are linked as sender)
module.exports.createEnquiry = async (req, res) => {
    const listing = await Listing.findById(req.params.id).select("owner title");
    if (!listing) return res.status(404).json({ error: "Property does not exist!" });

    if (req.user && listing.owner && listing.owner.equals(req.user._id)) {
        return res.status(400).json({ error: "This is your own property." });
    }

    const enquiry = await Enquiry.create({
        ...req.body,
        visitDate: req.body.visitDate || undefined,
        listing: listing._id,
        owner: listing.owner,
        sender: req.user ? req.user._id : undefined,
    });

    res.status(201).json({ message: "Your message has been sent to the owner!", id: enquiry._id });
};

// GET /api/enquiries/received  (owner inbox)
module.exports.receivedEnquiries = async (req, res) => {
    const enquiries = await Enquiry.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .limit(200)
        .populate("listing", "title image")
        .lean();
    res.json(enquiries);
};

// PATCH /api/enquiries/:enquiryId/read
module.exports.markRead = async (req, res) => {
    const enquiry = await Enquiry.findOneAndUpdate(
        { _id: req.params.enquiryId, owner: req.user._id },
        { read: true },
        { new: true }
    );
    if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });
    res.json({ ok: true });
};
