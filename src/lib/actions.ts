'use server';

import { revalidatePath } from 'next/cache';
import { addVideoToQueue, addVideoToPlaylist, searchVideos, isHostAuthenticated } from './youtube';
import type { Video } from './definitions';
import { sleep } from './utils';
import { redirect } from 'next/navigation';

export interface SearchState {
  songs?: Video[];
  error?: string | null;
}

export async function searchSongsAction(
  prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const query = formData.get('query') as string;

  if (!query) {
    return { songs: [] };
  }

  try {
    await sleep(500); // Simulate network delay
    const songs = await searchVideos(query);
    if (songs.length === 0) {
      return { songs: [], error: 'No songs found for your query.' };
    }
    return { songs };
  } catch (error) {
    return { error: 'Failed to search for songs.' };
  }
}

export async function addSongToPlaylistAction(video: Video) {
  try {
    await sleep(700); // Simulate network delay
    
    console.log('Adding song to playlist...');
    
    // Call the server-side API route that will check jukebox status
    // and add the song using the host's tokens
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const apiUrl = `${baseUrl}/api/youtube/add-to-playlist-guest`;
    
    console.log('Calling API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: video.id,
        videoTitle: video.title,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to add song:', error);
      return { error: error.error || 'Failed to add song to playlist.' };
    }

    const result = await response.json();
    console.log('Successfully added to YouTube playlist');
    
    // Only add to local queue if YouTube addition was successful
    await addVideoToQueue(video);
    console.log(`Added "${video.title}" to local queue for display`);
    
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding song:', error);
    return { error: error.message || 'Failed to add song to playlist.' };
  }
}
