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
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-5 lg:px-6 lg:py-6">
        <div className="flex items-center justify-between gap-1 sm:gap-2 min-w-0">
          <CardTitle className="font-headline flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg lg:text-xl min-w-0 flex-1">
            <Music4 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0" />
            <span className="truncate">Current Queue</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={refreshPlaylist}
            disabled={isRefreshing}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-5 lg:px-6 lg:py-6">
        <div className="space-y-2 sm:space-y-3 md:space-y-4 w-full">
          {playlist.length > 0 ? (
            playlist.map((song, index) => (
              <div key={`${song.id}-${index}`} className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 min-w-0 w-full">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-muted-foreground min-w-[1rem] sm:min-w-[1.25rem] md:min-w-[1.5rem] text-right flex-shrink-0">{index + 1}</span>
                <div className="relative flex-shrink-0 w-12 h-9 sm:w-14 sm:h-10 md:w-16 md:h-12 overflow-hidden rounded-md">
                  <Image
                    alt="Thumbnail"
                    className="object-cover"
                    fill
                    sizes="(max-width: 430px) 48px, (max-width: 640px) 56px, 64px"
                    src={song.thumbnail}
                    data-ai-hint="music album"
                  />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="truncate font-medium text-[11px] sm:text-xs md:text-sm lg:text-base leading-tight">{song.title}</p>
                  <p className="truncate text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-muted-foreground leading-tight mt-0.5">{song.channel}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground text-center py-4 sm:py-6 md:py-8">The queue is empty. Add a song to get started!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
