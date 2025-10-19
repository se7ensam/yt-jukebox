import type { Video } from '@/lib/definitions';

// In-memory store to simulate a database like Firestore
interface Db {
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
    expiryDate: number | null;
  };
  playlist: Video[];
}

// Initialize the mock database
export const db: Db = {
  tokens: {
    accessToken: null,
    refreshToken: null,
    expiryDate: null,
  },
  playlist: [],
};
