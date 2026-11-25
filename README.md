## ProRental

ProRental is a full-stack property rental platform. Owners list properties for free, and tenants and buyers search, save favourites, leave reviews and contact owners directly.

- **Backend** (`Backend/`): Node.js, Express, MongoDB (Mongoose), Passport sessions, Joi validation, Multer + Cloudinary image uploads, helmet, rate limiting, and geocoding (Mapbox, with OpenStreetMap Nominatim as a fallback)
- **Frontend** (`Frontend/`): React 19, Vite, React Router and Tailwind CSS

### Features

- Search with filters for text, rent/buy, property type, budget, bedrooms, furnishing and amenities, plus sorting and pagination. Filters are stored in the URL, so searches can be shared.
- Listings with 1–8 photos and rental terms: deposit, furnishing, available-from date, preferred tenants and pets.
- Property page with a photo gallery, map, reviews and star ratings, and a "contact owner / request a visit" form.
- Owner dashboard (`/my-properties`) for managing listings, with an enquiries inbox.
- Wishlist of saved properties.
- Login and signup in a modal or on the `/login` page.

### Project structure

```
Backend/
  index.js              app setup (security headers, CORS, sessions, routes)
  models/               Listing, Review, User, Enquiry, ContactMessage
  controllers/ routes/  listings, reviews, enquiries, users, contact
  middleware.js         auth/ownership checks, validation, rate limiters
  schema.js             Joi request schemas
  utils/geocode.js      best-effort geocoding
  scripts/              e2e test + one-off data fix
Frontend/
  src/pages/            route pages (lazy-loaded)
  src/components/       Layout, Navbar, PropertyCard, PropertyForm, Reviews, ...
  src/context/          AuthContext (user, wishlist, login modal), ToastContext
  src/utils/            api() fetch helper, property constants/formatters
```

### Backend setup

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```bash
ATLAS_DB_URL=mongodb://127.0.0.1:27017/prorental   # or your Atlas URL
SECRET=a_long_random_string

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

MAP_TOKEN=...            # optional: Mapbox token; falls back to OpenStreetMap if missing/invalid
CLIENT_URL=https://prorental.vercel.app   # comma-separated list of allowed frontend origins
```

```bash
npm run dev      # restarts on file changes, port 8080
```

### Frontend setup

```bash
cd Frontend
npm install
npm run dev      # http://localhost:5173
```

In development, Vite proxies `/api` and `/users` to `http://localhost:8080`, so no API URL configuration is needed.

### Deployment

The frontend calls the API through relative URLs. On Vercel, `Frontend/vercel.json` proxies `/api/*` and `/users/*` to the Render backend. This makes the session cookie first-party, so login works in Safari and in browsers that block third-party cookies.

- **Render (backend):** set `NODE_ENV=production` along with the variables above.
- **Vercel (frontend):** no API variable is needed. The old `VITE_API_BASE_URL` is ignored and can be deleted. If the backend URL changes, update it in `vercel.json`.

### Testing

`Backend/scripts/e2e.mjs` runs the main flows end to end: signup, listing creation, search, reviews, enquiries, wishlist, edit and delete. It creates data, so run it against a **local** database:

```bash
# terminal 1
cd Backend && ATLAS_DB_URL=mongodb://127.0.0.1:27017/prorental_test npm start
# terminal 2
cd Backend && npm run test:e2e
```

### Fixing older listings

Listings created while geocoding was disabled are stored at coordinates `[0, 0]`, and their country is a hard-coded "USA". To preview the fix, then apply it:

```bash
cd Backend
node scripts/fix-existing-listings.js --country=India           # dry run
node scripts/fix-existing-listings.js --country=India --apply
```
