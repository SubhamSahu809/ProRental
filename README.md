## proRental

proRental is a full‑stack rental property platform with:

- **Backend**: Node.js + Express + MongoDB (Mongoose), authentication with Passport, sessions, validation with Joi, file uploads with Multer + Cloudinary, and Mapbox integration for location/maps.
- **Frontend**: React + Vite + React Router, styled with Tailwind CSS, providing pages for browsing properties, adding new listings, managing your own properties, and basic auth flows.

### Project structure

- **Backend**: `Backend/` – Express server, models, routes, controllers, middleware, and utility helpers.
- **Frontend**: `Frontend/` – React SPA built with Vite, Tailwind, and component/page structure.

### Prerequisites

- **Node.js**: version `22.13.1` (or compatible with that engine)
- **MongoDB**: a running MongoDB instance (local or hosted)
- **Cloudinary account**: for image upload and storage
- **Mapbox access token**: for map and geocoding features

### Backend setup (`Backend/`)

1. **Install dependencies**

   ```bash
   cd Backend
   npm install
   ```

2. **Environment variables**

   Create a `.env` file in `Backend/` with values appropriate for your environment, for example:

   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_KEY=your_cloudinary_key
   CLOUDINARY_SECRET=your_cloudinary_secret

   MAPBOX_TOKEN=your_mapbox_token

   MONGODB_URI=mongodb://127.0.0.1:27017/prorental

   SESSION_SECRET=change_this_secret
   PORT=3000
   ```

3. **Run the server**

   ```bash
   npm start
   ```

   By default the API will run on `http://localhost:3000` (or the `PORT` you set).

### Frontend setup (`Frontend/`)

1. **Install dependencies**

   ```bash
   cd Frontend
   npm install
   ```

2. **Development server**

   ```bash
   npm run dev
   ```

   This starts Vite (by default on something like `http://localhost:5173`). The frontend is expected to talk to the backend running on `http://localhost:3000` – update any API base URL in `src/utils/api.js` if your setup differs.

3. **Build for production**

   ```bash
   npm run build
   ```

### Key features

- **Property listings**: create, view, and manage rental properties.
- **User accounts & auth**: sign up, log in, and manage your own listings (Passport + sessions).
- **Image uploads**: upload property images via Cloudinary.
- **Maps & locations**: Mapbox‑powered location handling for properties.
- **Modern UI**: responsive React frontend with Tailwind CSS and React Router.

### Scripts overview

- **Backend**
  - `npm start` – start the Express server.

- **Frontend**
  - `npm run dev` – start the Vite dev server.
  - `npm run build` – build the production bundle.
  - `npm run preview` – preview the production build.
  - `npm run lint` – run ESLint for the frontend.

