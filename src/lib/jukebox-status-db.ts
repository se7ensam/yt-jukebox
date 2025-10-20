import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

export interface JukeboxStatus {
  isActive: boolean;
  selectedPlaylistId: string | null;
  hostUserId: string;
  accessToken: string | null;  // Store access token for guest access
  tokenExpiry: number | null;
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
 */
export async function updateJukeboxStatus(
  firestore: Firestore,
  status: {
    isActive: boolean;
    selectedPlaylistId: string | null;
    hostUserId: string;
    accessToken?: string | null;
    tokenExpiry?: number | null;
  }
): Promise<void> {
  try {
    const statusRef = doc(firestore, 'jukebox', 'status');
    
    const jukeboxStatus: JukeboxStatus = {
      ...status,
      accessToken: status.accessToken || null,
      tokenExpiry: status.tokenExpiry || null,
      lastUpdated: Date.now(),
    };
    
    await setDoc(statusRef, jukeboxStatus);
    console.log('Updated jukebox status (with access token for guest access)');
  } catch (error) {
    console.error('Failed to update jukebox status:', error);
    throw error;
  }
}
