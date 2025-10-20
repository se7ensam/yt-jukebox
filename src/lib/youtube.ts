import { db } from '@/lib/data';
import type { Video } from '@/lib/definitions';
import placeholderData from '@/lib/placeholder-images.json';
import { getAuth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { getPlaylistSettings, updateSelectedPlaylist, clearPlaylistSettings } from '@/lib/playlist-db';

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  itemCount: number;
  thumbnail?: string;
}

const MOCK_SEARCH_RESULTS: Video[] = placeholderData.placeholderImages.map(
  (p, index) => ({
    id: `VIDEO_${index + 1}`,
    title: p.description,
    channel: 'Various Artists',
    thumbnail: p.imageUrl,
  })
);

export function ensureFirebaseUser() {
  const { auth } = initializeFirebase();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated. Please log in.');
  }
  return user;
}


// Simulate checking if the host is authenticated
export async function isHostAuthenticated(): Promise<boolean> {
  try {
    // Check if user is logged in
    const user = ensureFirebaseUser();
    
    // Check if we have tokens in memory
    if (db.tokens.accessToken) {
      return true;
    }
    
    // Try to load tokens from Firestore (persists across page refreshes)
    const { initializeFirebase } = await import('@/firebase');
    const { firestore } = initializeFirebase();
    const { getValidAccessToken } = await import('./youtube-tokens-db');
    
    const accessToken = await getValidAccessToken(firestore);
    if (accessToken) {
      // Load tokens into memory
      const { getYouTubeTokens } = await import('./youtube-tokens-db');
      const tokens = await getYouTubeTokens(firestore);
      if (tokens) {
        db.tokens = {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiryDate: tokens.expiryDate,
        };
        console.log('Loaded YouTube tokens from Firestore');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking host authentication:', error);
    return false;
  }
}

// Get the OAuth URL for YouTube authentication
export async function getAuthUrl(): Promise<string> {
  // Check if YouTube credentials are configured
  const YOUTUBE_CLIENT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
  
  if (!YOUTUBE_CLIENT_ID || YOUTUBE_CLIENT_ID === 'your_youtube_client_id_here') {
    // Fall back to mock auth if credentials not configured
    console.warn('YouTube credentials not configured, using mock authentication');
    return '/host?code=mock_auth_code';
  }
  
  // Generate real Google OAuth URL
  const user = ensureFirebaseUser();
  const YOUTUBE_REDIRECT_URI = process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI || 'http://localhost:9002/host';
  
  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    redirect_uri: YOUTUBE_REDIRECT_URI,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: user.uid, // Pass user ID for security
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Handle the OAuth callback and exchange code for tokens
export async function handleOAuthCallback(code?: string): Promise<void> {
  const user = ensureFirebaseUser();
  const YOUTUBE_CLIENT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
  const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
  
  // If no real credentials, use mock
  if (!YOUTUBE_CLIENT_ID || YOUTUBE_CLIENT_ID === 'your_youtube_client_id_here' || !code) {
    console.warn('Using mock authentication');
    db.tokens = {
      accessToken: 'mock_access_token_for_' + user.uid,
      refreshToken: 'mock_refresh_token',
      expiryDate: Date.now() + 3600 * 1000,
    };
    console.log(`Host authenticated for user ${user.uid} (mock tokens)`);
    return;
  }
  
  try {
    // Exchange authorization code for real tokens via server-side API
    // This keeps the client secret secure on the server
    const tokenResponse = await fetch('/api/youtube/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        userId: user.uid,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token exchange failed:', error);
      console.error('Status:', tokenResponse.status, tokenResponse.statusText);
      throw new Error(`Failed to exchange code for tokens: ${JSON.stringify(error)}`);
    }

    const tokens = await tokenResponse.json();
    
    // Store tokens in Firestore for persistence across page refreshes
    const { initializeFirebase } = await import('@/firebase');
    const { firestore } = initializeFirebase();
    const { saveYouTubeTokens } = await import('./youtube-tokens-db');
    
    await saveYouTubeTokens(firestore, tokens);
    
    // Also store in memory for immediate use
    db.tokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiryDate: Date.now() + (tokens.expiresIn * 1000),
    };
    
    console.log(`Host authenticated for user ${user.uid} with real YouTube tokens (saved to Firestore)`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
}

// Search for videos on YouTube
export async function searchVideos(query: string): Promise<Video[]> {
  console.log(`Searching for: ${query}`);
  
  if (!query) {
    return [];
  }

  try {
    // Check if we have YouTube authentication
    const isAuthenticated = await isHostAuthenticated();
    if (!isAuthenticated) {
      console.log('No YouTube authentication, using mock search results');
      return MOCK_SEARCH_RESULTS.filter((video) =>
        video.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Get the stored access token
    const accessToken = db.tokens.accessToken;
    if (!accessToken) {
      console.log('No access token, using mock search results');
      return MOCK_SEARCH_RESULTS.filter((video) =>
        video.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Search real YouTube videos
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=10`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('YouTube search API error:', error);
      throw new Error(`Search failed: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Transform YouTube API response to our Video format
    const videos: Video[] = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    })) || [];

    console.log(`Found ${videos.length} real YouTube videos for query: ${query}`);
    return videos;

  } catch (error) {
    console.error('Failed to search YouTube, falling back to mock data:', error);
    // Fallback to mock search results
    return MOCK_SEARCH_RESULTS.filter((video) =>
      video.title.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Add a video to the local queue (for guests)
export async function addVideoToQueue(video: Video): Promise<void> {
  // Check if song is already in the playlist
  if (db.playlist.some((item) => item.id === video.id)) {
    console.log('Video already in playlist');
    throw new Error('This song is already in the queue.');
  }
  db.playlist.push(video);
  console.log(`Added "${video.title}" to queue.`);
}

// Add a video to YouTube playlist using host's stored tokens (for guests)
export async function addVideoToYouTubePlaylist(video: Video, hostUserId: string, playlistId: string): Promise<void> {
  // Get the host's access token from Firestore
  const { initializeFirebase } = await import('@/firebase');
  const { firestore } = initializeFirebase();
  const { getValidAccessToken } = await import('./youtube-tokens-db');
  
  // Note: This will fail because we're trying to access another user's tokens
  // We need to do this on the server side instead
  console.log('Adding video to YouTube playlist for host:', hostUserId);
  
  try {
    const response = await fetch('/api/youtube/add-to-playlist-guest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: video.id,
        videoTitle: video.title,
        playlistId: playlistId,
        hostUserId: hostUserId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to add to YouTube playlist:', error);
      throw new Error(`Failed to add to YouTube playlist: ${error.details || error.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log(`Successfully added "${video.title}" to YouTube playlist`);
  } catch (error) {
    console.error('Failed to add to YouTube playlist:', error);
    throw error;
  }
}

// Add a video to the actual YouTube playlist (for host)
export async function addVideoToPlaylist(video: Video): Promise<void> {
  if (!await isHostAuthenticated()) {
    throw new Error('Host is not connected to YouTube');
  }
  
  // Get the selected playlist ID
  const selectedPlaylistId = await getSelectedPlaylistId();
  if (!selectedPlaylistId) {
    throw new Error('No playlist selected');
  }
  
  // Check if this is a real YouTube video ID or mock ID
  if (video.id.startsWith('VIDEO_')) {
    throw new Error('Mock videos cannot be added to YouTube playlists');
  }
  
  // Get the stored access token
  const accessToken = db.tokens.accessToken;
  if (!accessToken) {
    throw new Error('No access token available');
  }
  
  try {

    console.log('Adding video to YouTube playlist via API route');
    console.log('- Video ID:', video.id);
    console.log('- Playlist ID:', selectedPlaylistId);
    console.log('- Access Token available:', !!accessToken);

    // Add to real YouTube playlist via API route
    const response = await fetch('/api/youtube/add-to-playlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: video.id,
        videoTitle: video.title,
        playlistId: selectedPlaylistId,
        accessToken: accessToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to add to YouTube playlist via API:', error);
      throw new Error(`Failed to add to YouTube playlist: ${error.details || error.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log(`Successfully added "${video.title}" to YouTube playlist: ${selectedPlaylistId}`);
    console.log('Playlist item ID:', result.playlistItemId);

  } catch (error) {
    console.error('Failed to add to YouTube playlist:', error);
    throw error;
  }
}

// Simulate fetching the current playlist
export async function getPlaylist(): Promise<Video[]> {
  // In a real app, this might fetch from YouTube API or Firestore.
  // The 'db' object might not be initialized in some server environments.
  // We'll wrap this in a try-catch and return an empty array on failure.
  try {
    return [...db.playlist];
  } catch (error) {
    console.error('Failed to get playlist, returning empty array.', error);
    return [];
  }
}

// Fetch user's real YouTube playlists
export async function getUserPlaylists(): Promise<Playlist[]> {
  if (!await isHostAuthenticated()) {
    throw new Error('Host is not connected to a YouTube account.');
  }
  
  try {
    // Get the latest tokens from Firestore (not from memory)
    const { firestore } = initializeFirebase();
    const { getValidAccessToken } = await import('./youtube-tokens-db');
    const accessToken = await getValidAccessToken(firestore);
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    console.log('Fetching playlists from YouTube API...');
    console.log('- Access token available:', !!accessToken);

    // Fetch real playlists from YouTube API
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('YouTube API error:', error);
      throw new Error(`Failed to fetch playlists: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Transform YouTube API response to our Playlist format
    const playlists: Playlist[] = data.items?.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      itemCount: item.contentDetails?.itemCount || 0,
      thumbnail: item.snippet.thumbnails?.default?.url || 'https://placehold.co/120x90/1f2937/ffffff?text=Playlist'
    })) || [];

    console.log(`✅ Fetched ${playlists.length} real playlists from YouTube`);
    return playlists;

  } catch (error) {
    console.error('Failed to fetch real playlists, falling back to mock data:', error);
    
    // Fallback to mock playlists if real API fails
    return [
      {
        id: 'PL_MOCK_1',
        title: 'My Favorites',
        description: 'My personal favorite songs',
        itemCount: 25,
        thumbnail: 'https://placehold.co/120x90/1f2937/ffffff?text=My+Favorites'
      },
      {
        id: 'PL_MOCK_2', 
        title: 'Party Mix',
        description: 'Great songs for parties',
        itemCount: 50,
        thumbnail: 'https://placehold.co/120x90/1f2937/ffffff?text=Party+Mix'
      },
      {
        id: 'PL_MOCK_3',
        title: 'Chill Vibes',
        description: 'Relaxing music collection',
        itemCount: 30,
        thumbnail: 'https://placehold.co/120x90/1f2937/ffffff?text=Chill+Vibes'
      },
      {
        id: 'PL_MOCK_4',
        title: 'Jukebox Queue',
        description: 'Songs added by guests',
        itemCount: 0,
        thumbnail: 'https://placehold.co/120x90/1f2937/ffffff?text=Jukebox+Queue'
      }
    ];
  }
}

// Set the selected playlist for adding songs
export async function setSelectedPlaylist(playlistId: string): Promise<void> {
  if (!await isHostAuthenticated()) {
    throw new Error('Host is not connected to a YouTube account.');
  }
  
  const user = ensureFirebaseUser();
  const { firestore } = initializeFirebase();
  
  // Update user's personal playlist settings
  await updateSelectedPlaylist(firestore, playlistId);
  
  // Get the latest tokens from Firestore to ensure we have the access token
  const { getYouTubeTokens } = await import('./youtube-tokens-db');
  const tokens = await getYouTubeTokens(firestore);
  
  if (!tokens || !tokens.accessToken) {
    console.error('❌ Cannot update jukebox status: No access token found!');
    throw new Error('No access token available. Please reconnect to YouTube.');
  }
  
  // Update public jukebox status so guests know the jukebox is active
  // Also store the access token so guests can add songs
  console.log('🎵 Updating jukebox status in Firestore...');
  console.log('- isActive: true');
  console.log('- selectedPlaylistId:', playlistId);
  console.log('- hostUserId:', user.uid);
  console.log('- accessToken:', tokens.accessToken ? `${tokens.accessToken.substring(0, 20)}...` : 'NOT SET');
  console.log('- tokenExpiry:', tokens.expiryDate ? new Date(tokens.expiryDate).toISOString() : 'NOT SET');
  
  const { updateJukeboxStatus } = await import('./jukebox-status-db');
  await updateJukeboxStatus(firestore, {
    isActive: true,
    selectedPlaylistId: playlistId,
    hostUserId: user.uid,
    accessToken: tokens.accessToken,
    tokenExpiry: tokens.expiryDate,
  });
  
  console.log('✅ Jukebox status updated successfully in Firestore!');
  console.log('📍 Document path: /jukebox/status');
  
  // Also update in-memory for backward compatibility
  db.selectedPlaylistId = playlistId;
  db.tokens.accessToken = tokens.accessToken;
  db.tokens.refreshToken = tokens.refreshToken;
  db.tokens.expiryDate = tokens.expiryDate;
  
  console.log(`Selected playlist: ${playlistId} (jukebox status updated)`);
}

// Get the currently selected playlist ID
export async function getSelectedPlaylistId(): Promise<string | null> {
  if (!await isHostAuthenticated()) {
    return null;
  }
  
  try {
    const { firestore } = initializeFirebase();
    const settings = await getPlaylistSettings(firestore);
    
    if (settings && settings.selectedPlaylistId) {
      // Update in-memory for backward compatibility
      db.selectedPlaylistId = settings.selectedPlaylistId;
      return settings.selectedPlaylistId;
    }
    
    // Fallback to in-memory storage
    return db.selectedPlaylistId || null;
  } catch (error) {
    console.error('Failed to get selected playlist from database, using in-memory fallback:', error);
    return db.selectedPlaylistId || null;
  }
}

// Simulate host logging out
export async function logoutHost(): Promise<void> {
  try {
    // Clear playlist settings and YouTube tokens from Firestore
    const { firestore } = initializeFirebase();
    await clearPlaylistSettings(firestore);
    
    const { clearYouTubeTokens } = await import('./youtube-tokens-db');
    await clearYouTubeTokens(firestore);
    console.log('Cleared YouTube tokens from Firestore');
  } catch (error) {
    console.error('Failed to clear data from database:', error);
  }
  
  // Clear in-memory data
  db.tokens = {
    accessToken: null,
    refreshToken: null,
    expiryDate: null,
  };
  db.playlist = [];
  db.selectedPlaylistId = null;
  console.log('Host logged out, tokens and playlist cleared.');
}
