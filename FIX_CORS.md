# Fix CORS Error - Quick Guide

## The Problem
Your frontend at `https://pro-rental-ko8uyuqe9-sks93398195-gmailcoms-projects.vercel.app` is being blocked by CORS because it's not in the backend's allowed origins list.

## The Solution

### Step 1: Update Environment Variable in Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your backend service (`prorental`)
3. Go to **Environment** tab
4. Find the `ALLOWED_ORIGINS` variable
5. Update it to include your Vercel frontend URL:

```
ALLOWED_ORIGINS=http://localhost:5173,https://pro-rental-ko8uyuqe9-sks93398195-gmailcoms-projects.vercel.app
```

**Important Notes:**
- Use comma-separated values (no spaces after commas)
- Include `http://localhost:5173` for local development
- Use the exact URL from your Vercel deployment (check your Vercel dashboard)

### Step 2: Redeploy Backend

After updating the environment variable:
1. Click **Manual Deploy** → **Deploy latest commit** (or just wait for auto-deploy)
2. Wait for deployment to complete (2-3 minutes)

### Step 3: Verify

1. Check Render logs to see if CORS is working
2. Refresh your frontend
3. The CORS errors should be gone!

## Alternative: If You Have a Custom Domain

If you're using a custom domain for your Vercel app, make sure to add that URL too:

```
ALLOWED_ORIGINS=http://localhost:5173,https://your-custom-domain.com,https://pro-rental-ko8uyuqe9-sks93398195-gmailcoms-projects.vercel.app
```

## Troubleshooting

**Still getting CORS errors?**
1. Double-check the URL in `ALLOWED_ORIGINS` matches exactly (including `https://`)
2. Make sure there are no extra spaces
3. Check Render logs for CORS error messages
4. Wait a few minutes after updating environment variables

**Need to find your exact Vercel URL?**
1. Go to Vercel dashboard
2. Click on your project
3. Go to **Settings** → **Domains**
4. Copy the exact URL shown there
