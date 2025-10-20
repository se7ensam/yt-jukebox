import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { getPlaylistSettings, updateSelectedPlaylist, type PlaylistSettings } from '@/lib/playlist-db';

export function usePlaylistSettings() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [settings, setSettings] = useState<PlaylistSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set up real-time listener for playlist settings
    const settingsRef = doc(firestore, 'users', user.uid, 'settings', 'playlist');
    
    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data() as PlaylistSettings);
        } else {
          setSettings(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error listening to playlist settings:', error);
        setError(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, firestore]);

  const updatePlaylist = async (playlistId: string | null) => {
    try {
      console.log('Updating playlist to:', playlistId);
      
      if (playlistId) {
        // Use setSelectedPlaylist from youtube.ts which updates BOTH:
        // 1. User's personal settings
        // 2. Public jukebox status (with access token)
        const { setSelectedPlaylist } = await import('@/lib/youtube');
        await setSelectedPlaylist(playlistId);
      } else {
        // If clearing the playlist, just update the personal settings
        await updateSelectedPlaylist(firestore, playlistId);
      }
      
      console.log('Playlist updated successfully');
    } catch (error) {
      console.error('Failed to update playlist:', error);
      throw error;
    }
  };

  return {
    settings,
    selectedPlaylistId: settings?.selectedPlaylistId || null,
    isLoading,
    error,
    updatePlaylist,
  };
}
