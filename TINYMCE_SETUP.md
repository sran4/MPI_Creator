# TinyMCE API Key Setup Guide

## Step 1: Get Your TinyMCE API Key

1. Go to [https://www.tiny.cloud/](https://www.tiny.cloud/)
2. Sign up for a free account
3. Go to your dashboard
4. Create a new app or use an existing one
5. Copy your API key

## Step 2: Add API Key to Environment Variables

Create or update your `.env.local` file in the project root with:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mpi-creator

# JWT Secret for authentication
JWT_SECRET=your-jwt-secret-key-here

# Admin Signup Key (for admin registration security)
ADMIN_SIGNUP_KEY=your-admin-signup-key-here

# TinyMCE API Key (get your free API key from https://www.tiny.cloud/)
# Note: Use NEXT_PUBLIC_ prefix for client-side access
NEXT_PUBLIC_TINYMCE_API_KEY=your-actual-tinymce-api-key-here
```

## Step 3: Replace the API Key

Replace `your-actual-tinymce-api-key-here` with your actual TinyMCE API key.

**Important:** The environment variable must be named `NEXT_PUBLIC_TINYMCE_API_KEY` (with the `NEXT_PUBLIC_` prefix) because TinyMCE runs on the client-side and needs access to the environment variable.

## Step 4: Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Features Available with API Key

With a valid API key, you'll get:
- ✅ Full TinyMCE functionality
- ✅ No "TinyMCE Cloud" branding
- ✅ All premium plugins
- ✅ Better performance
- ✅ No usage limits

## Free Tier Limits

The free tier includes:
- 1,000 monthly active users
- All core features
- Premium plugins
- No credit card required
