# Cloudinary Setup for Image Storage

## Problem Fixed
Your images were being stored locally in `Backend/uploads/`, but on Render (and most cloud platforms), the filesystem is **ephemeral** - files get deleted when the server restarts or redeploys. This caused 404 errors for all property images.

## Solution
Updated the code to use **Cloudinary** for cloud-based image storage. Images are now stored permanently in the cloud.

## What Changed

### 1. Updated `Backend/cloudConfig.js`
- Now uses Cloudinary in production
- Falls back to local storage for development
- Automatically detects which to use based on environment variables

### 2. Updated `Backend/controllers/listings.js`
- Handles Cloudinary URLs (which are full URLs)
- Still supports local storage for development

## Setup Instructions

### Step 1: Get Cloudinary Credentials
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy these values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 2: Add Environment Variables in Render
Go to Render Dashboard → Your Backend Service → Environment tab

Add these environment variables (if not already added):
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Redeploy Backend
1. Commit and push your code changes
2. Render will auto-deploy (or manually trigger deploy)
3. Wait 2-3 minutes for deployment

## How It Works

### Production (Render)
- Images uploaded → Stored in Cloudinary
- Database stores Cloudinary URL (full URL like `https://res.cloudinary.com/...`)
- Images load from Cloudinary CDN (fast and reliable)

### Development (Local)
- Images uploaded → Stored locally in `Backend/uploads/`
- Database stores relative URL like `/uploads/property-xxx.jpg`
- Images load from local server

## Important Notes

### Existing Images
⚠️ **Old images in your database** still have local URLs and will show 404 errors. You have two options:

1. **Re-upload images** (Recommended)
   - Delete old properties and add them again with new images
   - New images will be stored in Cloudinary

2. **Migrate existing images** (Advanced)
   - Write a migration script to upload existing images to Cloudinary
   - Update database URLs

### New Images
✅ All **new images** uploaded after this change will work perfectly!

## Testing

1. Deploy the updated code
2. Add a new property with an image
3. Check that the image loads correctly
4. Verify the image URL in the database starts with `https://res.cloudinary.com/`

## Troubleshooting

**Images still not loading?**
- Check Render logs for Cloudinary errors
- Verify environment variables are set correctly
- Make sure Cloudinary credentials are valid

**Getting Cloudinary errors?**
- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set
- Check Cloudinary dashboard for account status

## Cost
Cloudinary free tier includes:
- 25GB storage
- 25GB monthly bandwidth
- Perfect for small to medium projects!
