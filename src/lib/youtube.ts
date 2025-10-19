import { db } from '@/lib/data';
import type { Video } from '@/lib/definitions';
import placeholderData from '@/lib/placeholder-images.json';

const MOCK_SEARCH_RESULTS: Video[] = placeholderData.placeholderImages.map(
  (p, index) => ({
    id: `VIDEO_${index + 1}`,
    title: p.description,
    channel: 'Various Artists',
    thumbnail: p.imageUrl,
  })
);

// Simulate checking if the host is authenticated
export async function isHostAuthenticated(): Promise<boolean> {
  return !!db.tokens.accessToken;
}

// Simulate getting the OAuth URL
export async function getAuthUrl(): Promise<string> {
  // In a real app, this would generate a Google OAuth URL.
  // Here, we just simulate the flow by providing a link that "completes" the auth.
  return '/host?authed=true';
}

// Simulate handling the OAuth callback
export async function handleOAuthCallback(): Promise<void> {
  // In a real app, you'd exchange the code for tokens.
  // Here, we'll just store mock tokens.
  db.tokens = {
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
    expiryDate: Date.now() + 3600 * 1000,
  };
  console.log('Host authenticated, tokens stored.');
}

// Simulate searching for videos on YouTube
export async function searchVideos(query: string): Promise<Video[]> {
  console.log(`Searching for: ${query}`);
  // In a real app, this would call the YouTube API.
  // Here, we return a filtered list from our mock data or the full list if query is empty.
  if (!query) {
    return [];
  }
  return MOCK_SEARCH_RESULTS.filter((video) =>
    video.title.toLowerCase().includes(query.toLowerCase())
  );
}

// Simulate adding a video to the playlist
export async function addVideoToPlaylist(video: Video): Promise<void> {
  // Check if song is already in the playlist
  if (db.playlist.some((item) => item.id === video.id)) {
    console.log('Video already in playlist');
    throw new Error('This song is already in the queue.');
  }
  db.playlist.push(video);
  console.log(`Added "${video.title}" to playlist.`);
}

// Simulate fetching the current playlist
export async function getPlaylist(): Promise<Video[]> {
  // In a real app, this might fetch from YouTube API or Firestore.
  return [...db.playlist];
}

// Simulate host logging out
export async function logoutHost(): Promise<void> {
  db.tokens = {
    accessToken: null,
    refreshToken: null,
    expiryDate: null,
  };
  // Also clear the playlist when host logs out
  db.playlist = [];
  console.log('Host logged out and playlist cleared.');
}
