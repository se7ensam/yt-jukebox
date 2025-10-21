# Environment Setup Guide

This guide explains how to set up environment variables for the YouTube Jukebox application.

## Quick Setup

1. **Copy the template file:**
   ```bash
   cp env.template .env.local
   ```

2. **Edit `.env.local` with your actual values**

## Environment Variables Explained

### Firebase Configuration
These are already configured in `src/firebase/config.ts`, but you can override them:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
```

### YouTube API Configuration (Optional)
For real YouTube integration instead of mock authentication:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project or select existing one**
3. **Enable YouTube Data API v3**
4. **Create OAuth 2.0 credentials**
5. **Add authorized redirect URIs:**
   - `http://localhost:9002/host` (development)
   - `https://yourdomain.com/host` (production)

### YouTube Data API Key (for Public Search)

1. **Go to Google Cloud Console** → "APIs & Services" → "Credentials"
2. **Click "Create Credentials" → "API Key"**
3. **Copy the API key** and add it to your `.env.local` file
4. **Optional: Restrict the API key** to YouTube Data API v3 for security

```env
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_youtube_client_id_here
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret_here
NEXT_PUBLIC_YOUTUBE_REDIRECT_URI=http://localhost:9002/host

# YouTube Data API Key (for public search - no authentication required)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Application Configuration
```env
NEXT_PUBLIC_APP_URL=http://localhost:9002
NODE_ENV=development
```

### Admin Credentials
Default credentials for the admin login (you can change these):

```env
ADMIN_EMAIL=admin@jukebox.com
ADMIN_PASSWORD=admin123
```

## Current Project Configuration

The project is currently configured with these Firebase settings:
- **Project ID:** `studio-8682155854-b49db`
- **Auth Domain:** `studio-8682155854-b49db.firebaseapp.com`
- **App ID:** `1:239720895221:web:c3fb8b1c1e9e933a7aabbc`

## Development vs Production

### Development (.env.local)
- Use `http://localhost:9002` for URLs
- Set `NODE_ENV=development`
- Use test YouTube API credentials

### Production (.env)
- Use your actual domain for URLs
- Set `NODE_ENV=production`
- Use production YouTube API credentials
- Ensure all `NEXT_PUBLIC_` variables are set correctly

## Security Notes

- **Never commit `.env.local` or `.env` files to git**
- **Keep `YOUTUBE_CLIENT_SECRET` secure** (server-side only)
- **Use different credentials for development and production**
- **Rotate API keys regularly**

## Troubleshooting

### Firebase Authentication Issues
- Ensure Firebase project has Authentication enabled
- Check that Google sign-in is enabled in Firebase Console
- Verify API keys are correct

### YouTube API Issues
- Ensure YouTube Data API v3 is enabled
- Check OAuth 2.0 credentials are properly configured
- Verify redirect URIs match exactly

### Environment Variables Not Loading
- Restart the development server after changing `.env.local`
- Ensure variable names start with `NEXT_PUBLIC_` for client-side access
- Check for typos in variable names

