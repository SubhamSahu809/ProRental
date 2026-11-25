// One-off maintenance for listings created before the geocoding fix:
//  - geocodes listings stored at [0, 0] (or with no location) so the map shows
//  - optionally sets the country on listings that still have the old hard-coded "USA"
//
// Dry run (shows what would change, writes nothing):
//   node scripts/fix-existing-listings.js
// Apply changes:
//   node scripts/fix-existing-listings.js --apply
// Also replace country "USA" with "India":
//   node scripts/fix-existing-listings.js --apply --country=India
require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
require("../models/enquiry");
const geocode = require("../utils/geocode");

const apply = process.argv.includes("--apply");
const countryArg = process.argv.find((a) => a.startsWith("--country="));
const newCountry = countryArg ? countryArg.split("=")[1] : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    await mongoose.connect(process.env.ATLAS_DB_URL);
    const listings = await Listing.find({});
    let changed = 0;

    for (const listing of listings) {
        const updates = {};
        if (newCountry && listing.country === "USA") updates.country = newCountry;

        const coords = listing.geometry && listing.geometry.coordinates;
        const missing = !Array.isArray(coords) || coords.length !== 2 || (coords[0] === 0 && coords[1] === 0);
        if (missing && listing.location) {
            const geometry = await geocode(listing.location, updates.country || listing.country);
            await sleep(1100); // respect Nominatim's 1 request/second limit
            if (geometry) updates.geometry = geometry;
        }

        if (Object.keys(updates).length) {
            changed++;
            console.log(`${apply ? "UPDATE" : "WOULD UPDATE"} ${listing._id} "${listing.title}":`, JSON.stringify(updates));
            if (apply) await Listing.updateOne({ _id: listing._id }, { $set: updates });
        }
    }

    console.log(`\n${changed} of ${listings.length} listings ${apply ? "updated" : "would be updated (dry run, pass --apply to write)"}.`);
    await mongoose.disconnect();
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
