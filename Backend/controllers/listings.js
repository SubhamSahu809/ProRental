const Listing = require("../models/listing");
const geocode = require("../utils/geocode");
const { deleteImages, deleteUploadedFiles, MAX_IMAGES } = require("../cloudConfig");

// Only expose public profile fields of users (never emails) on public endpoints.
const PUBLIC_USER_FIELDS = "firstName lastName";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toInt = (value, fallback, { min = 0, max = Infinity } = {}) => {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(Math.max(n, min), max);
};

const SORTS = {
    newest: { createdAt: -1, _id: -1 },
    price_asc: { price: 1, _id: 1 },
    price_desc: { price: -1, _id: -1 },
};

/**
 * GET /api/listings
 * Query: q, type (rent|buy), category, minPrice, maxPrice, bedrooms (min), furnishing,
 *        amenities (comma separated, all must match), sort (newest|price_asc|price_desc), page, limit
 * Returns: { listings, total, page, pages }
 */
module.exports.index = async (req, res) => {
    const { q, type, category, furnishing, amenities, sort } = req.query;
    const filter = {};

    if (typeof q === "string" && q.trim()) {
        const rx = new RegExp(escapeRegex(q.trim().slice(0, 100)), "i");
        filter.$or = [{ title: rx }, { location: rx }, { country: rx }, { description: rx }];
    }
    if (type === "rent" || type === "buy") filter.type = type;
    if (typeof category === "string" && category) filter.propertyCategory = category;
    if (typeof furnishing === "string" && furnishing) filter.furnishing = furnishing;

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if (Number.isFinite(minPrice) && minPrice > 0) filter.price = { ...filter.price, $gte: minPrice };
    if (Number.isFinite(maxPrice) && maxPrice > 0) filter.price = { ...filter.price, $lte: maxPrice };

    const bedrooms = Number(req.query.bedrooms);
    if (Number.isFinite(bedrooms) && bedrooms > 0) filter.bedrooms = { $gte: bedrooms };

    if (typeof amenities === "string" && amenities) {
        filter.amenities = { $all: amenities.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 20) };
    }

    const limit = toInt(req.query.limit, 12, { min: 1, max: 50 });
    const page = toInt(req.query.page, 1, { min: 1 });

    const [listings, total] = await Promise.all([
        Listing.find(filter)
            .sort(SORTS[sort] || SORTS.newest)
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-reviews -description")
            .lean(),
        Listing.countDocuments(filter),
    ]);

    res.json({ listings, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
};

// GET /api/listings/:id
module.exports.showListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            options: { sort: { createdAt: -1 } },
            populate: { path: "author", select: PUBLIC_USER_FIELDS },
        })
        .populate("owner", PUBLIC_USER_FIELDS)
        .lean();

    if (!listing) {
        return res.status(404).json({ error: "Property does not exist!" });
    }

    const ratings = listing.reviews.map((r) => r.rating).filter(Number.isFinite);
    listing.rating = {
        average: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null,
        count: ratings.length,
    };

    res.json(listing);
};

const filesToImages = (files = []) =>
    files.filter((f) => f && f.path).map((f) => ({ url: f.path, filename: f.filename }));

// POST /api/listings
module.exports.createListing = async (req, res) => {
    const images = filesToImages(req.files);
    if (images.length === 0) {
        return res.status(400).json({ error: "At least one property image is required" });
    }

    try {
        const { keepImages, ...listingData } = req.body.listing;
        const newListing = new Listing(listingData);
        newListing.owner = req.user._id;
        newListing.images = images;
        newListing.image = images[0];

        const geometry = await geocode(newListing.location, newListing.country);
        if (geometry) newListing.geometry = geometry;

        const savedListing = await newListing.save();
        res.status(201).json({ message: "New Property Created!", listing: savedListing.toObject() });
    } catch (err) {
        await deleteUploadedFiles(req.files);
        throw err;
    }
};

// GET /api/listings/:id/edit (owner only; isOwner loads the listing)
module.exports.renderEditForm = async (req, res) => {
    res.json(res.locals.listing);
};

// PUT /api/listings/:id (owner only)
// Final images = existing images listed in keepImages + new uploads; at least 1, at most MAX_IMAGES.
module.exports.updateListing = async (req, res) => {
    const listing = res.locals.listing;
    const { keepImages = [], ...updates } = req.body.listing;

    const existingImages = listing.images && listing.images.length > 0
        ? listing.images
        : listing.image && listing.image.url ? [listing.image] : [];

    const keptImages = existingImages.filter((img) => keepImages.includes(img.url));
    const newImages = filesToImages(req.files);
    const finalImages = [...keptImages, ...newImages];

    if (finalImages.length === 0 || finalImages.length > MAX_IMAGES) {
        await deleteUploadedFiles(req.files);
        return res.status(400).json({ error: `A property needs between 1 and ${MAX_IMAGES} images.` });
    }

    const locationChanged =
        (updates.location && updates.location !== listing.location) ||
        (updates.country && updates.country !== listing.country);

    // Fields that can be cleared from the form need to be explicitly unset.
    for (const field of ["deposit", "furnishing", "availableFrom", "preferredTenants", "petsAllowed", "bedrooms", "bathrooms", "area"]) {
        if (!(field in updates)) listing[field] = undefined;
    }
    Object.assign(listing, updates);
    listing.images = finalImages;
    listing.image = finalImages[0];

    // Listings created while geocoding was disabled were stored at [0, 0].
    const coords = listing.geometry && listing.geometry.coordinates;
    const hasValidGeometry = Array.isArray(coords) && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);

    if (locationChanged || !hasValidGeometry) {
        const geometry = await geocode(listing.location, listing.country);
        listing.geometry = geometry || undefined;
    }

    try {
        await listing.save();
    } catch (err) {
        await deleteUploadedFiles(req.files);
        throw err;
    }

    // Only delete removed images once the update has been saved.
    const removed = existingImages.filter((img) => !keepImages.includes(img.url));
    await deleteImages(removed);

    res.json({ message: "Property Details Updated!", listing: listing.toObject() });
};

// DELETE /api/listings/:id (owner only)
module.exports.destroyListing = async (req, res) => {
    const listing = res.locals.listing;
    const images = [...(listing.images || [])];
    if (listing.image && listing.image.filename && !images.some((i) => i.filename === listing.image.filename)) {
        images.push(listing.image);
    }

    await Listing.findByIdAndDelete(listing._id);
    await deleteImages(images);

    res.json({ message: "Property Deleted!" });
};

// GET /api/listings/owner/properties
module.exports.getUserListings = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(listings);
};
