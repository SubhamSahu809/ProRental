// Best-effort geocoding: returns a GeoJSON Point or null. Never throws, so a
// geocoding outage can't stop people from listing properties.
const TIMEOUT_MS = 5000;

async function fetchJson(url, headers = {}) {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
    return res.json();
}

async function geocodeWithMapbox(query, token) {
    const url =
        "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        encodeURIComponent(query) +
        `.json?limit=1&access_token=${encodeURIComponent(token)}`;
    const data = await fetchJson(url);
    const feature = data.features && data.features[0];
    return feature ? feature.geometry.coordinates : null; // [lng, lat]
}

// OpenStreetMap Nominatim: free, no key, max ~1 request/second.
async function geocodeWithNominatim(query) {
    const url =
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(query);
    const data = await fetchJson(url, { "User-Agent": "ProRental/1.0 (property listing app)" });
    const hit = data[0];
    return hit ? [Number(hit.lon), Number(hit.lat)] : null;
}

// Queries to try, most specific first. Repeating the country ("Pune, India, India")
// makes geocoders return nothing, and a wrong country must not block a match.
function candidateQueries(location, country) {
    const loc = (location || "").trim();
    const ctry = (country || "").trim();
    if (!loc) return ctry ? [ctry] : [];
    if (!ctry || loc.toLowerCase().includes(ctry.toLowerCase())) return [loc];
    return [`${loc}, ${ctry}`, loc];
}

module.exports = async function geocode(location, country) {
    const queries = candidateQueries(location, country);
    if (queries.length === 0) return null;

    const providers = [];
    if (process.env.MAP_TOKEN) providers.push((q) => geocodeWithMapbox(q, process.env.MAP_TOKEN));
    providers.push(geocodeWithNominatim);

    for (const provider of providers) {
        for (const query of queries) {
            try {
                const coords = await provider(query);
                if (coords && coords.every(Number.isFinite)) {
                    return { type: "Point", coordinates: coords };
                }
            } catch (err) {
                console.warn("Geocoding failed:", err.message);
                break; // provider is down/unauthorized; try the next provider
            }
        }
    }
    return null;
};
