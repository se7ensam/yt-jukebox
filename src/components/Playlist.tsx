'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music4, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Video } from '@/lib/definitions';
import { useState, useEffect } from 'react';

export function Playlist({ initialPlaylist }: { initialPlaylist: Video[] }) {
  const [playlist, setPlaylist] = useState<Video[]>(initialPlaylist);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPlaylist = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/playlist');
      if (response.ok) {
        const data = await response.json();
        setPlaylist(data.playlist || []);
      }
    } catch (error) {
      console.error('Failed to refresh playlist:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    refreshPlaylist();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshPlaylist, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for song added events and refresh immediately
  useEffect(() => {
    const handleSongAdded = () => {
      refreshPlaylist();
    };

    window.addEventListener('songAdded', handleSongAdded);
    return () => window.removeEventListener('songAdded', handleSongAdded);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline flex items-center gap-2">
            <Music4 className="h-6 w-6" />
            Current Queue
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={refreshPlaylist}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {playlist.length > 0 ? (
            playlist.map((song, index) => (
              <div key={`${song.id}-${index}`} className="flex items-center gap-4">
                <span className="text-lg font-semibold text-muted-foreground">{index + 1}</span>
                <Image
                  alt="Thumbnail"
                  className="rounded-md object-cover"
                  height="36"
                  src={song.thumbnail}
                  width="64"
                  data-ai-hint="music album"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{song.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{song.channel}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">The queue is empty. Add a song to get started!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
