'use server';

import { revalidatePath } from 'next/cache';
import { addVideoToPlaylist, searchVideos } from './youtube';
import type { Video } from './definitions';
import { sleep } from './utils';

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
    // Simulate auth check
    // const isAuthenticated = await isHostAuthenticated();
    // if (!isAuthenticated) {
    //   return { error: 'Host is not authenticated.' };
    // }
    await sleep(700); // Simulate network delay
    await addVideoToPlaylist(video);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to add song to playlist.' };
  }
}
