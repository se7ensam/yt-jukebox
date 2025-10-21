/**
 * Server-side YouTube token refresh utility
 * Handles automatic token renewal using refresh tokens
 */

import { initializeFirebaseServer } from './firebase-server';
import { doc, getDoc } from 'firebase/firestore';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

/**
 * Get a valid access token, refreshing if necessary
 * This should only be called server-side (API routes)
 */
export async function getValidAccessTokenServer(userId: string): Promise<string | null> {
  try {
    const { firestore } = initializeFirebaseServer();
    
    // Get tokens from user's private auth storage
    const tokenRef = doc(firestore, 'users', userId, 'auth', 'youtube');
    const tokenSnap = await getDoc(tokenRef);
    
    if (!tokenSnap.exists()) {
      console.log('No YouTube tokens found for user:', userId);
      return null;
    }
    
    const tokenData = tokenSnap.data() as TokenData;
    const now = Date.now();
    
    // If token is still valid (with 5-minute buffer), return it
    if (tokenData.expiryDate && tokenData.expiryDate > now + 5 * 60 * 1000) {
      console.log('Access token is still valid');
      return tokenData.accessToken;
    }
    
    // Token expired or about to expire, refresh it
    console.log('Access token expired or expiring soon, refreshing...');
    
    if (!tokenData.refreshToken) {
      console.error('No refresh token available');
      return null;
    }
    
    const newTokenData = await refreshAccessToken(tokenData.refreshToken);
    
    if (!newTokenData) {
      console.error('Failed to refresh access token');
      return null;
    }
    
    // Update stored tokens
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(tokenRef, {
      accessToken: newTokenData.accessToken,
      expiryDate: newTokenData.expiryDate,
      // Keep the same refresh token (or update if provided)
      refreshToken: newTokenData.refreshToken || tokenData.refreshToken,
      lastRefreshed: now,
    });
    
    console.log('Access token refreshed successfully');
    return newTokenData.accessToken;
    
  } catch (error) {
    console.error('Error getting valid access token:', error);
    return null;
  }
}

/**
 * Refresh an access token using a refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<TokenData | null> {
  try {
    const YOUTUBE_CLIENT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
    const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
    
    if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
      console.error('YouTube OAuth credentials not configured');
      return null;
    }
    
    console.log('Calling Google token refresh endpoint...');
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Token refresh failed:', error);
      return null;
    }
    
    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Google may return a new refresh token
      expiryDate: Date.now() + (data.expires_in * 1000),
    };
    
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Get jukebox status from server-side (with valid access token)
 */
export async function getJukeboxStatusWithValidToken() {
  try {
    const { firestore } = initializeFirebaseServer();
    
    // Get public status
    const statusRef = doc(firestore, 'jukebox', 'status');
    const statusSnap = await getDoc(statusRef);
    
    if (!statusSnap.exists()) {
      return null;
    }
    
    const status = statusSnap.data();
    
    if (!status || !status.isActive || !status.hostUserId) {
      return null;
    }
    
    // Get valid access token for the host
    const accessToken = await getValidAccessTokenServer(status.hostUserId);
    
    if (!accessToken) {
      console.error('Failed to get valid access token for host:', status.hostUserId);
      return null;
    }
    
    return {
      isActive: status.isActive,
      selectedPlaylistId: status.selectedPlaylistId,
      hostUserId: status.hostUserId,
      accessToken: accessToken, // Fresh, valid token
    };
    
  } catch (error) {
    console.error('Error getting jukebox status with valid token:', error);
    return null;
  }
}

