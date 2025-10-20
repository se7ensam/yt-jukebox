import { doc, setDoc, getDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { ensureFirebaseUser } from './youtube';

export interface PlaylistSettings {
  selectedPlaylistId: string | null;
  lastUpdated: number;
}

/**
 * Get the user's playlist settings from Firestore
 */
export async function getPlaylistSettings(firestore: Firestore): Promise<PlaylistSettings | null> {
  try {
    const user = ensureFirebaseUser();
    
    const settingsRef = doc(firestore, 'users', user.uid, 'settings', 'playlist');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data() as PlaylistSettings;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get playlist settings:', error);
    return null;
  }
}

/**
 * Update the user's selected playlist in Firestore
 */
export async function updateSelectedPlaylist(firestore: Firestore, playlistId: string | null): Promise<void> {
  try {
    const user = ensureFirebaseUser();
    
    const settingsRef = doc(firestore, 'users', user.uid, 'settings', 'playlist');
    const settings: PlaylistSettings = {
      selectedPlaylistId: playlistId,
      lastUpdated: Date.now(),
    };
    
    await setDoc(settingsRef, settings);
    console.log(`Updated selected playlist for user ${user.uid}: ${playlistId}`);
  } catch (error) {
    console.error('Failed to update selected playlist:', error);
    throw error;
  }
}

/**
 * Clear the user's playlist settings from Firestore
 */
export async function clearPlaylistSettings(firestore: Firestore): Promise<void> {
  try {
    const user = ensureFirebaseUser();
    
    const settingsRef = doc(firestore, 'users', user.uid, 'settings', 'playlist');
    await deleteDoc(settingsRef);
    console.log(`Cleared playlist settings for user ${user.uid}`);
  } catch (error) {
    console.error('Failed to clear playlist settings:', error);
    throw error;
  }
}
