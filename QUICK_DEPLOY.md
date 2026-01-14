# Quick Deployment Checklist

## Prerequisites
- [ ] GitHub account (to host your code)
- [ ] MongoDB Atlas account (free database)
- [ ] Cloudinary account (free file storage)
- [ ] Render account (free backend hosting)
- [ ] Vercel account (free frontend hosting)

## Step-by-Step Quick Guide

### 1. Database Setup (5 minutes)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create free cluster (M0 tier)
3. Create database user (Database Access)
4. Whitelist IP: `0.0.0.0/0` (Network Access)
5. Get connection string (replace `<password>` and add database name)

### 2. File Storage Setup (3 minutes)
1. Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
2. Copy: Cloud Name, API Key, API Secret from Dashboard

### 3. Deploy Backend (10 minutes)
1. Push code to GitHub
2. Go to [Render](https://render.com) → New Web Service
3. Connect GitHub repo
4. Settings:
   - Root Directory: `Backend`
   - Build: `npm install`
   - Start: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   ATLAS_DB_URL=<your_mongodb_connection_string>
   SECRET=<random_string>
   CLOUDINARY_CLOUD_NAME=<your_cloud_name>
   CLOUDINARY_API_KEY=<your_api_key>
   CLOUDINARY_API_SECRET=<your_api_secret>
   ALLOWED_ORIGINS=http://localhost:5173
   ```
6. Deploy and copy backend URL (e.g., `https://proRental-backend.onrender.com`)

### 4. Deploy Frontend (5 minutes)
1. Go to [Vercel](https://vercel.com) → Add New Project
2. Import GitHub repo
3. Settings:
   - Framework: Vite
   - Root Directory: `Frontend`
   - Build: `npm run build`
   - Output: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=<your_backend_url_from_step_3>
   ```
5. Deploy and copy frontend URL

### 5. Update Backend CORS (2 minutes)
1. Go back to Render backend settings
2. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=http://localhost:5173,<your_frontend_url>
   ```
3. Redeploy backend

## Done! 🎉

Your app should now be live. Test all features:
- [ ] User signup/login
- [ ] Add property
- [ ] View properties
- [ ] View property details

## Troubleshooting

**Backend not responding?**
- Check Render logs
- Verify all environment variables are set
- Wait 30-60 seconds after first request (free tier spin-up)

**CORS errors?**
- Verify frontend URL is in `ALLOWED_ORIGINS`
- Check browser console for exact error

**Database connection failed?**
- Verify MongoDB connection string
- Check IP whitelist includes `0.0.0.0/0`
- Verify database user credentials

## Cost: $0/month ✅

All services used have generous free tiers.
