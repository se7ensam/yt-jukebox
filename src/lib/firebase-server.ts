/**
 * Server-side Firebase utilities using client SDK
 * This works without service account credentials in development
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc, collection } from 'firebase/firestore';
import { firebaseConfig as configFromFile } from '@/firebase/config';

let serverApp: FirebaseApp | null = null;
let serverFirestore: Firestore | null = null;

// Use the config from firebase/config.ts which has the actual values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || configFromFile.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || configFromFile.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || configFromFile.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || configFromFile.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || configFromFile.appId,
};

/**
 * Initialize Firebase for server-side use (without authentication)
 * This uses the client SDK but works in server context
 */
export function initializeFirebaseServer() {
  if (serverApp && serverFirestore) {
    return { app: serverApp, firestore: serverFirestore };
  }

  try {
    // Check if an app with our name already exists
    const existingApp = getApps().find(app => app.name === 'server-app');
    
    if (existingApp) {
      serverApp = existingApp;
    } else {
      // Initialize with explicit config (no auto-initialization)
      serverApp = initializeApp(firebaseConfig, 'server-app');
    }
    
    serverFirestore = getFirestore(serverApp);
    
    console.log('Firebase Server initialized with project:', firebaseConfig.projectId);
    return { app: serverApp, firestore: serverFirestore };
  } catch (error) {
    console.error('Failed to initialize Firebase Server:', error);
    throw new Error('Firebase Server initialization failed');
  }
}

/**
 * Get jukebox status (public document, no auth needed)
 */
export async function getJukeboxStatusServer() {
  const { firestore } = initializeFirebaseServer();
  
  try {
    const statusRef = doc(firestore, 'jukebox', 'status');
    const statusSnap = await getDoc(statusRef);
    
    if (statusSnap.exists()) {
      return statusSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get jukebox status:', error);
    return null;
  }
}

/**
 * Get YouTube tokens for a user (requires public read access or service account)
 * Note: This will only work if Firestore rules allow public read
 */
export async function getYouTubeTokensServer(userId: string) {
  const { firestore } = initializeFirebaseServer();
  
  try {
    const tokensRef = doc(firestore, 'users', userId, 'auth', 'youtube');
    const tokensSnap = await getDoc(tokensRef);
    
    if (tokensSnap.exists()) {
      return tokensSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get YouTube tokens:', error);
    // This will fail with security rules - we need to store tokens in a way that's accessible
    return null;
  }
}
