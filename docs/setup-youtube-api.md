# YouTube API Setup Guide

## Quick Setup for Real YouTube Search

To enable real YouTube search for all users (no authentication required), you need to get a YouTube Data API key.

### Step 1: Get YouTube API Key

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project** (or create a new one)
3. **Enable YouTube Data API v3**:
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

### Step 2: Add to Environment

Add the API key to your `.env.local` file:

```env
YOUTUBE_API_KEY=your_actual_api_key_here
```

### Step 3: Test

1. **Restart your development server**:
   ```bash
   npm run dev
   ```
2. **Go to the jukebox page** and try searching
3. **Check console logs** - you should see:
   ```
   Search API: Using real YouTube API with API key
   Search API: Returning real YouTube videos: 8
   ```

### Benefits

- ✅ **Real YouTube search** - No more mock data
- ✅ **Works for everyone** - No authentication required
- ✅ **Real thumbnails** - Actual YouTube thumbnails
- ✅ **Real video IDs** - Actual YouTube video IDs
- ✅ **Always up-to-date** - Real YouTube search results

### Security Note

The API key is used server-side only and is safe to use. You can optionally restrict it to:
- Only YouTube Data API v3
- Only your domain (for production)

### Troubleshooting

If you see "YouTube API key not configured":
1. Make sure you added `YOUTUBE_API_KEY` to `.env.local`
2. Restart your development server
3. Check that the API key is valid in Google Cloud Console

If you see "YouTube API error":
1. Check your API key is correct
2. Make sure YouTube Data API v3 is enabled
3. Check your API quota in Google Cloud Console

