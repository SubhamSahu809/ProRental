// Usage: start the backend (+ optionally the Vite dev server), then:
//   node scripts/e2e.mjs http://localhost:5173   (through the Vite proxy)
//   node scripts/e2e.mjs http://localhost:8080   (backend directly)
// Creates test users/listings, so point the backend at a LOCAL database, not production:
//   ATLAS_DB_URL=mongodb://127.0.0.1:27017/prorental_test npm start
// End-to-end API flow through the Vite proxy (same-origin, like production behind vercel.json).
const BASE = process.argv[2] || "http://localhost:8080";
let failures = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
  if (!cond) failures++;
};

function client() {
  let cookie = "";
  return async (path, { method = "GET", json, form } = {}) => {
    const headers = { Accept: "application/json" };
    if (cookie) headers.Cookie = cookie;
    let body;
    if (json) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
    if (form) body = form;
    const res = await fetch(BASE + path, { method, headers, body });
    const set = res.headers.getSetCookie?.() || [];
    for (const c of set) cookie = c.split(";")[0];
    const data = await res.json().catch(() => null);
    return { status: res.status, data, setCookie: set };
  };
}

// 1x1 PNG
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==", "base64");

const owner = client();
const tenant = client();
const stamp = Date.now();

let r = await owner("/users/signup", { method: "POST", json: { firstName: "Owner", lastName: "Test", email: `owner${stamp}@example.com`, password: "short" } });
check("signup rejects short password", r.status === 400, r.data?.error);

r = await owner("/users/signup", { method: "POST", json: { firstName: "Owner", lastName: "Test", email: `owner${stamp}@example.com`, password: "password123" } });
check("owner signup", r.status === 201, r.setCookie.join(" | "));
check("cookie is SameSite=Lax HttpOnly", /SameSite=Lax/i.test(r.setCookie.join()) && /HttpOnly/i.test(r.setCookie.join()));
const ownerId = r.data.user.id;

r = await owner("/users/signup", { method: "POST", json: { firstName: "X", lastName: "Y", email: `owner${stamp}@example.com`, password: "password123" } });
check("duplicate email -> 409", r.status === 409, r.data?.error);

r = await tenant("/users/signup", { method: "POST", json: { firstName: "Tenant", lastName: "Test", email: `tenant${stamp}@example.com`, password: "password123" } });
check("tenant signup", r.status === 201);

// invalid listing (missing title) must be rejected and its image cleaned up
let fd = new FormData();
fd.append("listing[description]", "x"); fd.append("listing[location]", "Patia, Bhubaneswar"); fd.append("listing[price]", "100");
fd.append("listing[images]", new Blob([png], { type: "image/png" }), "a.png");
r = await owner("/api/listings", { method: "POST", form: fd });
check("invalid listing rejected", r.status === 400, r.data?.error);

fd = new FormData();
const fields = { title: "2BHK near Infocity", description: "Bright flat close to offices.", location: "Patia, Bhubaneswar", country: "India", price: "15000", bedrooms: "2", bathrooms: "2", area: "980", type: "rent", propertyCategory: "apartment", deposit: "30000", furnishing: "semi-furnished", availableFrom: "2026-12-15", preferredTenants: "family", petsAllowed: "false" };
for (const [k, v] of Object.entries(fields)) fd.append(`listing[${k}]`, v);
["Parking", "Power Backup"].forEach((a) => fd.append("listing[amenities][]", a));
fd.append("listing[images]", new Blob([png], { type: "image/png" }), "a.png");
r = await owner("/api/listings", { method: "POST", form: fd });
check("create listing", r.status === 201, r.data?.error || "");
const listing = r.data?.listing || {};
check("rental fields saved", listing.deposit === 30000 && listing.furnishing === "semi-furnished" && listing.petsAllowed === false && listing.amenities?.length === 2);
check("geocoded (not 0,0)", Array.isArray(listing.geometry?.coordinates) && listing.geometry.coordinates[0] !== 0, JSON.stringify(listing.geometry));
const id = listing._id;

r = await tenant(`/api/listings/${id}`, { method: "PUT", json: { listing: { title: "hacked" } } });
check("non-owner cannot edit", r.status === 403);

r = await owner(`/api/listings?type=rent&q=infocity&minPrice=10000&maxPrice=20000&bedrooms=2&amenities=Parking`);
check("search + filters find it", r.data?.total === 1 && r.data.listings[0]._id === id);
r = await owner(`/api/listings?type=buy`);
check("type filter excludes it", r.data?.total === 0);

r = await owner(`/api/listings/${id}/reviews`, { method: "POST", json: { review: { rating: 5, comment: "Great place" } } });
check("owner cannot review own listing", r.status === 403);
r = await tenant(`/api/listings/${id}/reviews`, { method: "POST", json: { review: { rating: 4, comment: "Nice and clean" } } });
check("tenant review", r.status === 201);
const reviewCreated = new Date(r.data.review.createdAt);
check("review timestamp is now (Date.now bug fixed)", Math.abs(Date.now() - reviewCreated) < 60000, r.data.review.createdAt);
r = await tenant(`/api/listings/${id}/reviews`, { method: "POST", json: { review: { rating: 3, comment: "Second one" } } });
check("duplicate review -> 409", r.status === 409);

r = await tenant(`/api/listings/${id}`);
check("show: rating summary", r.data.rating?.average === 4 && r.data.rating.count === 1, JSON.stringify(r.data.rating));
check("show: no emails leaked", !JSON.stringify(r.data).includes("@example.com"));

r = await tenant(`/api/listings/${id}/enquiries`, { method: "POST", json: { name: "Tenant Test", email: `tenant${stamp}@example.com`, phone: "+91 98765 43210", message: "Is it available?", visitDate: "2026-12-20" } });
check("enquiry sent", r.status === 201, r.data?.error || "");
r = await owner(`/api/enquiries/received`);
check("owner sees enquiry", r.data?.length === 1 && r.data[0].listing?.title === fields.title);
const enqId = r.data?.[0]?._id;
r = await tenant(`/api/enquiries/${enqId}/read`, { method: "PATCH" });
check("other user cannot mark enquiry", r.status === 404);
r = await owner(`/api/enquiries/${enqId}/read`, { method: "PATCH" });
check("owner marks read", r.status === 200);

r = await tenant(`/users/wishlist/${id}`, { method: "POST" });
check("wishlist add", r.data?.saved === true);
r = await tenant(`/users/wishlist`);
check("wishlist list", r.data?.length === 1);
r = await tenant(`/users/me`);
check("me includes wishlist", r.data?.user?.wishlist?.includes(id));

// edit: change rent, drop deposit, keep the image
fd = new FormData();
for (const [k, v] of Object.entries({ ...fields, price: "16000" })) if (k !== "deposit") fd.append(`listing[${k}]`, v);
fd.append("listing[keepImages][]", listing.images[0].url);
r = await owner(`/api/listings/${id}`, { method: "PUT", form: fd });
check("edit listing", r.status === 200 && r.data.listing.price === 16000 && r.data.listing.deposit === undefined, r.data?.error || "");

r = await owner(`/api/contact`, { method: "POST", json: { firstName: "A", email: "a@example.com", message: "Hello there" } });
check("contact form", r.status === 201);

r = await owner(`/api/listings/${id}`, { method: "DELETE" });
check("delete listing", r.status === 200);
r = await owner(`/api/enquiries/received`);
check("enquiries removed with listing", r.data?.length === 0);

r = await owner(`/users/logout`, { method: "POST" });
check("logout", r.status === 200);
r = await owner(`/users/me`);
check("logged out -> 401", r.status === 401);

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
