import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminFirestore: Firestore | null = null;

/**
 * Initialize Firebase Admin SDK (server-side only)
 * This bypasses Firestore security rules and should only be used server-side
 */
export function initializeFirebaseAdmin() {
  if (adminApp) {
    return { app: adminApp, firestore: adminFirestore! };
  }

  try {
    if (getApps().length === 0) {
      // Initialize without service account for local development
      // In production, you should use a service account key
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      console.log('Firebase Admin initialized');
    } else {
      adminApp = getApps()[0];
    }
    
    adminFirestore = getFirestore(adminApp);
    
    return { app: adminApp, firestore: adminFirestore };
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw new Error('Firebase Admin initialization failed');
  }
}

/**
 * Get Firestore Admin instance (bypasses security rules)
 */
export function getFirestoreAdmin(): Firestore {
  const { firestore } = initializeFirebaseAdmin();
  return firestore;
}

/**
 * Get YouTube tokens for a user (server-side, bypasses security rules)
 */
export async function getYouTubeTokensAdmin(userId: string) {
  const { firestore } = initializeFirebaseAdmin();
  
  try {
    const tokensDoc = await firestore
      .collection('users')
      .doc(userId)
      .collection('auth')
      .doc('youtube')
      .get();
    
    if (tokensDoc.exists) {
      return tokensDoc.data();
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get YouTube tokens:', error);
    return null;
  }
}
