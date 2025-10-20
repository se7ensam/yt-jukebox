import { doc, setDoc, getDoc, deleteDoc, Firestore, updateDoc } from 'firebase/firestore';
import { ensureFirebaseUser } from './youtube';

export interface YouTubeTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  scope: string;
  tokenType: string;
  lastUpdated: number;
}

/**
 * Get stored YouTube tokens for the current user
 */
export async function getYouTubeTokens(firestore: Firestore): Promise<YouTubeTokens | null> {
  try {
    const user = ensureFirebaseUser();
    const tokensRef = doc(firestore, 'users', user.uid, 'auth', 'youtube');
    const tokensDoc = await getDoc(tokensRef);
    
    if (tokensDoc.exists()) {
      const tokens = tokensDoc.data() as YouTubeTokens;
      console.log('YouTube tokens found in Firestore');
      console.log('- Access token exists:', !!tokens.accessToken);
      console.log('- Refresh token exists:', !!tokens.refreshToken);
      console.log('- Expires at:', new Date(tokens.expiryDate).toISOString());
      console.log('- Is expired:', tokens.expiryDate < Date.now());
      return tokens;
    }
    
    console.log('No YouTube tokens found in Firestore');
    return null;
  } catch (error) {
    console.error('Failed to get YouTube tokens:', error);
    return null;
  }
}

/**
 * Save YouTube tokens to Firestore
 */
export async function saveYouTubeTokens(
  firestore: Firestore,
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    scope?: string;
    tokenType?: string;
  }
): Promise<void> {
  try {
    const user = ensureFirebaseUser();
    const tokensRef = doc(firestore, 'users', user.uid, 'auth', 'youtube');
    
    const youtubeTokens: YouTubeTokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiryDate: Date.now() + (tokens.expiresIn * 1000),
      scope: tokens.scope || '',
      tokenType: tokens.tokenType || 'Bearer',
      lastUpdated: Date.now(),
    };
    
    await setDoc(tokensRef, youtubeTokens);
    console.log(`Saved YouTube tokens for user ${user.uid} to Firestore`);
    console.log('- Tokens will expire at:', new Date(youtubeTokens.expiryDate).toISOString());
  } catch (error) {
    console.error('Failed to save YouTube tokens:', error);
    throw error;
  }
}

/**
 * Update access token after refresh
 */
export async function updateAccessToken(
  firestore: Firestore,
  accessToken: string,
  expiresIn: number
): Promise<void> {
  try {
    const user = ensureFirebaseUser();
    const tokensRef = doc(firestore, 'users', user.uid, 'auth', 'youtube');
    
    await updateDoc(tokensRef, {
      accessToken,
      expiryDate: Date.now() + (expiresIn * 1000),
      lastUpdated: Date.now(),
    });
    
    console.log(`Updated access token for user ${user.uid}`);
  } catch (error) {
    console.error('Failed to update access token:', error);
    throw error;
  }
}

/**
 * Check if access token is expired or expiring soon
 */
export function isTokenExpired(tokens: YouTubeTokens, bufferMinutes: number = 5): boolean {
  const bufferMs = bufferMinutes * 60 * 1000;
  return tokens.expiryDate - bufferMs < Date.now();
}

/**
 * Refresh the access token using refresh token
 */
export async function refreshAccessToken(firestore: Firestore): Promise<string | null> {
  try {
    const tokens = await getYouTubeTokens(firestore);
    if (!tokens || !tokens.refreshToken) {
      console.log('No refresh token available');
      return null;
    }

    console.log('Refreshing access token...');
    
    const response = await fetch('/api/youtube/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: tokens.refreshToken,
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    // Update the access token in Firestore
    await updateAccessToken(firestore, data.accessToken, data.expiresIn);
    
    console.log('Access token refreshed successfully');
    return data.accessToken;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null;
  }
}

/**
 * Get valid access token (refresh if expired)
 */
export async function getValidAccessToken(firestore: Firestore): Promise<string | null> {
  try {
    const tokens = await getYouTubeTokens(firestore);
    if (!tokens) {
      return null;
    }

    // Check if token is expired or expiring soon
    if (isTokenExpired(tokens)) {
      console.log('Access token expired, refreshing...');
      return await refreshAccessToken(firestore);
    }

    return tokens.accessToken;
  } catch (error) {
    console.error('Failed to get valid access token:', error);
    return null;
  }
}

/**
 * Clear YouTube tokens from Firestore
 */
export async function clearYouTubeTokens(firestore: Firestore): Promise<void> {
  try {
    const user = ensureFirebaseUser();
    const tokensRef = doc(firestore, 'users', user.uid, 'auth', 'youtube');
    await deleteDoc(tokensRef);
    console.log(`Cleared YouTube tokens for user ${user.uid}`);
  } catch (error) {
    console.error('Failed to clear YouTube tokens:', error);
    throw error;
  }
}
