'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isHostAuthenticated, logoutHost, getAuthUrl, handleOAuthCallback, getUserPlaylists, type Playlist } from '@/lib/youtube';
import { usePlaylistSettings } from '@/hooks/use-playlist-settings';
import { CheckCircle, LogIn, LogOut, Loader2, Music, Settings } from 'lucide-react';
import { useUser } from '@/firebase';
import { useEffect, useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

function HostPageContent() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Use the playlist settings hook for real-time updates
  const { selectedPlaylistId, updatePlaylist, isLoading: playlistSettingsLoading } = usePlaylistSettings();
  
  // Debug logging
  console.log('Host page - selectedPlaylistId:', selectedPlaylistId);
  console.log('Host page - playlistSettingsLoading:', playlistSettingsLoading);
  console.log('Host page - user:', user?.uid);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  useEffect(() => {
    // Redirect to login if user is not loaded and not present
    if (!isUserLoading && !user) {
      router.push('/login');
      return;
    }

    // Only proceed if we have a user
    if (user) {
      const checkYouTubeAuth = async () => {
        setIsCheckingAuth(true);
        const code = searchParams.get('code');
        
        // If there's an auth code in the URL, handle the callback first
        if (code) {
          await handleOAuthCallback(code);
          // Use replace to remove the code from URL and prevent re-running on refresh
          router.replace('/host'); 
        }

        const authenticated = await isHostAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          const url = await getAuthUrl();
          setAuthUrl(url);
          setIsCheckingAuth(false);
        } else {
          // Load playlists when authenticated
          console.log('🔐 Host is authenticated, loading playlists...');
          setIsCheckingAuth(false);
          
          // Load playlists directly here since we know we're authenticated
          setIsLoadingPlaylists(true);
          try {
            const userPlaylists = await getUserPlaylists();
            console.log(`✅ Loaded ${userPlaylists.length} playlists:`, userPlaylists);
            setPlaylists(userPlaylists);
          } catch (error) {
            console.error('❌ Failed to load playlists:', error);
            console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
          } finally {
            setIsLoadingPlaylists(false);
          }
        }
      };
      
      checkYouTubeAuth();
    }
  }, [user, isUserLoading, searchParams, router]);

  // Effect to ensure selected playlist is properly displayed when both playlists and settings are loaded
  useEffect(() => {
    if (isAuthenticated && playlists.length > 0 && selectedPlaylistId && !playlistSettingsLoading) {
      console.log('Host page - ensuring selected playlist is displayed:', selectedPlaylistId);
      // The Select component should automatically show the selected value
      // This effect just ensures we have all the data needed
    }
  }, [isAuthenticated, playlists, selectedPlaylistId, playlistSettingsLoading]);

  const loadPlaylists = async () => {
    if (!isAuthenticated) {
      console.log('❌ Cannot load playlists: Host not authenticated');
      return;
    }
    
    console.log('📋 Loading playlists...');
    setIsLoadingPlaylists(true);
    try {
      const userPlaylists = await getUserPlaylists();
      console.log(`✅ Loaded ${userPlaylists.length} playlists:`, userPlaylists);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('❌ Failed to load playlists:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoadingPlaylists(false);
      console.log('📋 Finished loading playlists');
    }
  };

  const handlePlaylistSelect = async (playlistId: string) => {
    try {
      console.log('Host page - selecting playlist:', playlistId);
      await updatePlaylist(playlistId);
      console.log('Host page - playlist selection completed');
    } catch (error) {
      console.error('Failed to select playlist:', error);
    }
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutHost(); // Clears YouTube tokens and playlist
      if (auth) {
        await signOut(auth); // Signs out from Firebase
      }
      // The useEffect will catch the user change and redirect to /login
    });
  };

  if (isUserLoading || isCheckingAuth || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-3 py-6 sm:px-4 sm:py-8 md:p-6 lg:p-8 overflow-x-hidden">
      <div className="w-full max-w-2xl space-y-3 sm:space-y-4 md:space-y-6">
        {/* Main Host Panel */}
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-headline">Host Control Panel</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {isAuthenticated
                ? 'You are connected to YouTube.'
                : 'Connect your YouTube account to get started.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-green-500" />
                <p className="text-base md:text-lg font-semibold">YouTube Account Connected!</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Guests can now add songs to your selected playlist.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-muted-foreground">
                  To allow guests to add songs, you need to connect your YouTube account.
                </p>
                <Button asChild size="lg" disabled={!authUrl}>
                  {authUrl ? (
                     <Link href={authUrl}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Connect with Google
                    </Link>
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </Button>
              </div>
            )}
            <div className="flex flex-col items-center gap-2">
              <Button onClick={handleLogout} variant="destructive" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                Log Out
              </Button>
              <Button variant="link" asChild className="mt-2">
                <Link href="/">Back to Jukebox</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Playlist Selection */}
        {isAuthenticated && (
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Playlist Selection
              </CardTitle>
              <CardDescription>
                Choose which playlist guests can add songs to.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingPlaylists || playlistSettingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">
                    {isLoadingPlaylists && playlistSettingsLoading ? 'Loading playlists and settings...' :
                     isLoadingPlaylists ? 'Loading playlists...' : 'Loading settings...'}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <Select value={selectedPlaylistId || ""} onValueChange={handlePlaylistSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a playlist">
                        {selectedPlaylistId ? 
                          playlists.find(p => p.id === selectedPlaylistId)?.title || "Selected playlist" 
                          : "Select a playlist"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map((playlist) => (
                        <SelectItem key={playlist.id} value={playlist.id}>
                          <div className="flex items-center gap-3">
                            {playlist.thumbnail && (
                              <img 
                                src={playlist.thumbnail} 
                                alt={playlist.title}
                                className="w-8 h-6 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium">{playlist.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {playlist.itemCount} songs
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedPlaylistId && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Active Playlist:</span>
                        <span className="text-green-700 dark:text-green-300 font-semibold">
                          {playlists.find(p => p.id === selectedPlaylistId)?.title}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Guests can now add songs to this playlist
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function HostPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    }>
      <HostPageContent />
    </Suspense>
  );
}
