import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

export interface JukeboxStatus {
  isActive: boolean;
  selectedPlaylistId: string | null;
  hostUserId: string;
  // Removed: accessToken and tokenExpiry (now handled server-side only)
  lastUpdated: number;
}

/**
 * Get the current jukebox status (public, can be read by anyone)
 */
export async function getJukeboxStatus(firestore: Firestore): Promise<JukeboxStatus | null> {
  try {
    const statusRef = doc(firestore, 'jukebox', 'status');
    const statusDoc = await getDoc(statusRef);
    
    if (statusDoc.exists()) {
      return statusDoc.data() as JukeboxStatus;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get jukebox status:', error);
    return null;
  }
}

/**
 * Update jukebox status (only host can do this)
 * Tokens are stored separately in user's private auth collection
 */
export async function updateJukeboxStatus(
  firestore: Firestore,
  status: {
    isActive: boolean;
    selectedPlaylistId: string | null;
    hostUserId: string;
  }
): Promise<void> {
  try {
    const statusRef = doc(firestore, 'jukebox', 'status');
    
    const jukeboxStatus: JukeboxStatus = {
      isActive: status.isActive,
      selectedPlaylistId: status.selectedPlaylistId,
      hostUserId: status.hostUserId,
      lastUpdated: Date.now(),
    };
    
    await setDoc(statusRef, jukeboxStatus);
    console.log('Updated jukebox status (tokens managed separately server-side)');
  } catch (error) {
    console.error('Failed to update jukebox status:', error);
    throw error;
  }
}
