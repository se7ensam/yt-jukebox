/**
 * Server-side YouTube utilities
 * This file should only be imported in API routes and server components
 */

import type { Video } from './definitions';
import { getJukeboxStatusWithValidToken } from './youtube-token-refresh';

/**
 * Fetch the current playlist from YouTube (server-side only)
 * This function uses Firebase Admin SDK and should only be called server-side
 */
export async function getPlaylist(): Promise<Video[]> {
  try {
    // Get jukebox status with valid access token (auto-refreshed if needed)
    const status = await getJukeboxStatusWithValidToken();
    
    if (!status || !status.selectedPlaylistId || !status.accessToken) {
      console.log('No active jukebox or playlist selected, returning empty queue');
      return [];
    }
    
    // Fetch playlist items from YouTube with valid token
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${status.selectedPlaylistId}&maxResults=50`,
      {
        headers: {
          'Authorization': `Bearer ${status.accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch playlist items from YouTube');
      return [];
    }
    
    const data = await response.json();
    
    // Transform YouTube playlist items to Video format
    const videos: Video[] = data.items?.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle || item.snippet.videoOwnerChannelTitle || 'Unknown',
      thumbnail: item.snippet.thumbnails?.default?.url || 'https://placehold.co/120x90/1f2937/ffffff?text=Video',
    })) || [];
    
    console.log(`Fetched ${videos.length} songs from YouTube playlist`);
    return videos;
    
  } catch (error) {
    console.error('Failed to get playlist from YouTube, returning empty array:', error);
    return [];
  }
}

