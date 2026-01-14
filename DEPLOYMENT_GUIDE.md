# Free Deployment Guide for proRental

This guide will help you deploy your proRental application completely free using various free-tier services.

## Architecture Overview

- **Frontend**: React + Vite (deploy to Vercel/Netlify)
- **Backend**: Node.js/Express (deploy to Render/Railway)
- **Database**: MongoDB Atlas (free tier)
- **File Storage**: Cloudinary (free tier)

---

## Step 1: Set Up MongoDB Atlas (Free Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster (choose the free M0 tier)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Save the username and password securely
5. Whitelist IP addresses:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
6. Get your connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<password>` with your actual password
   - Add your database name at the end: `mongodb+srv://.../proRental?retryWrites=true&w=majority`

---

## Step 2: Set Up Cloudinary (Free File Storage)

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Go to your Dashboard
4. Copy these values (you'll need them later):
   - Cloud Name
   - API Key
   - API Secret

---

## Step 3: Deploy Backend to Render (Free)

### Option A: Render (Recommended - Easiest)

1. Go to [Render](https://render.com) and sign up (free tier available)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `proRental-backend` (or any name)
   - **Root Directory**: `Backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free
5. Add Environment Variables:
   ```
   NODE_ENV=production
   ATLAS_DB_URL=your_mongodb_connection_string
   SECRET=your_random_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ALLOWED_ORIGINS=http://localhost:5173
   ```
   (You'll update `ALLOWED_ORIGINS` after deploying the frontend)
6. Click "Create Web Service"
7. Wait for deployment (takes 5-10 minutes)
8. Copy your backend URL (e.g., `https://proRental-backend.onrender.com`)

**Note**: Free tier on Render spins down after 15 minutes of inactivity. First request may take 30-60 seconds.

### Option B: Railway (Alternative)

1. Go to [Railway](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add service → Select "Backend" folder
5. Add environment variables (same as Render)
6. Deploy

### Option C: Fly.io (Alternative)

1. Install Fly CLI: `npm install -g @fly/cli`
2. Sign up at [Fly.io](https://fly.io)
3. Run `fly auth login`
4. In Backend folder: `fly launch`
5. Add secrets: `fly secrets set ATLAS_DB_URL=... SECRET=...`

---

## Step 4: Update Backend Configuration

The backend has been updated to:
- Use `process.env.PORT` (automatically set by deployment platforms)
- Accept CORS origins from `ALLOWED_ORIGINS` environment variable

After deploying your frontend, add your frontend URL to the backend's `ALLOWED_ORIGINS` environment variable (comma-separated if multiple).

---

## Step 5: Deploy Frontend to Vercel (Free - Recommended)

### Option A: Vercel (Easiest)

1. Go to [Vercel](https://vercel.com) and sign up
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
   (Replace with your actual backend URL from Step 3)
6. Click "Deploy"
7. Your app will be live at `https://your-project.vercel.app`

### Option B: Netlify (Alternative)

1. Go to [Netlify](https://www.netlify.com) and sign up
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select your repo
4. Configure:
   - **Base directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `Frontend/dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
6. Deploy

---

## Step 6: Update Frontend API Calls

The frontend code has been updated to use the `VITE_API_URL` environment variable. Make sure to set this in your deployment platform.

---

## Step 7: Update Backend CORS

After deploying the frontend, update the `ALLOWED_ORIGINS` environment variable in your backend deployment (Render/Railway) to include your frontend URL:

```
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-url.vercel.app
```

The backend will automatically pick up this change. If it doesn't, redeploy the backend.

---

## Environment Variables Summary

### Backend (.env or Render/Railway environment variables):
```
NODE_ENV=production
ATLAS_DB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/proRental?retryWrites=true&w=majority
SECRET=your_random_secret_string_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-url.vercel.app
PORT=8080
```

### Frontend (Vercel/Netlify environment variables):
```
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Troubleshooting

### Backend Issues:
- **Connection timeout**: Free tier services spin down after inactivity. First request may be slow.
- **CORS errors**: Make sure your frontend URL is in the `allowedOrigins` array
- **Database connection**: Verify your MongoDB connection string and IP whitelist

### Frontend Issues:
- **API calls failing**: Check that `VITE_API_URL` is set correctly
- **Build errors**: Make sure all dependencies are in `package.json`

### Common Errors:
- **"Not allowed by CORS"**: Update backend CORS settings
- **"Failed to fetch"**: Check backend URL and ensure backend is running
- **Database connection errors**: Verify MongoDB Atlas connection string

---

## Free Tier Limitations

### Render:
- Spins down after 15 minutes of inactivity
- 750 hours/month free
- First request after spin-down takes 30-60 seconds

### Vercel:
- Unlimited deployments
- 100GB bandwidth/month
- No spin-down

### MongoDB Atlas:
- 512MB storage
- Shared cluster resources

### Cloudinary:
- 25GB storage
- 25GB monthly bandwidth

---

## Cost: $0/month ✅

All services mentioned above have generous free tiers that should be sufficient for development and small-scale production use.

---

## Next Steps After Deployment

1. Test all features (login, signup, add property, etc.)
2. Monitor your application logs
3. Set up custom domains (optional, may have costs)
4. Consider upgrading if you need more resources

---

## Support

If you encounter issues:
1. Check the deployment platform logs
2. Verify all environment variables are set correctly
3. Ensure database and file storage services are accessible
4. Check browser console for frontend errors
