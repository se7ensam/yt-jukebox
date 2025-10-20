'use client';

import { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Search, Loader2, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { searchSongsAction, type SearchState } from '@/lib/actions';
import { AddSongButton } from './AddSongButton';
import { SearchSuggestions } from './SearchSuggestions';
import type { Video } from '@/lib/definitions';

const initialState: SearchState = {
  songs: [],
};

function SearchButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      size="icon" 
      aria-label="Search" 
      disabled={pending}
      className="h-9 w-9 sm:h-10 sm:w-10 p-0 flex-shrink-0"
    >
      {pending ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Search className="h-4 w-4 sm:h-5 sm:w-5" />}
    </Button>
  );
}

export function SearchComponent() {
  const [state, formAction] = useActionState(searchSongsAction, initialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<Video[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        console.log('SearchComponent: Clicked outside, closing suggestions');
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('SearchComponent: Input changed to:', value);
    setSearchQuery(value);
    const shouldShow = value.length >= 2;
    console.log('SearchComponent: Should show suggestions:', shouldShow);
    setShowSuggestions(shouldShow);
  };

  const handleSuggestionSelect = (video: Video) => {
    // Add to selected songs if not already selected
    if (!selectedSongs.find(song => song.id === video.id)) {
      setSelectedSongs(prev => [...prev, video]);
    }
    setSearchQuery('');
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemoveSelected = (videoId: string) => {
    setSelectedSongs(prev => prev.filter(song => song.id !== videoId));
  };

  const handleFormSubmit = (formData: FormData) => {
    // Clear selected songs after form submission
    setSelectedSongs([]);
    setSearchQuery('');
    setShowSuggestions(false);
    return formAction(formData);
  };

  return (
    <Card className="w-full max-w-full overflow-visible">
      <CardHeader className="px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-5 lg:px-6 lg:py-6">
        <CardTitle className="font-headline text-sm sm:text-base md:text-lg lg:text-xl break-words">Search for Songs</CardTitle>
        <CardDescription className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm mt-1 sm:mt-1.5 break-words">
          Search for songs and add them to the queue. Use suggestions for faster selection.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-5 lg:px-6 lg:py-6 overflow-visible">
        <div ref={containerRef} className="relative w-full max-w-full isolate">
          <form action={handleFormSubmit} className="flex w-full items-center gap-1.5 sm:gap-2 pb-2 sm:pb-3 md:pb-4 relative z-10">
            <div className="relative flex-1 min-w-0 z-20">
              <Input
                ref={inputRef}
                name="query"
                placeholder="Search for songs..."
                className="w-full text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-11 relative z-10"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              />
              <SearchSuggestions
                query={searchQuery}
                onSelect={handleSuggestionSelect}
                onClose={() => {
                  console.log('SearchComponent: Closing suggestions');
                  setShowSuggestions(false);
                }}
                isVisible={showSuggestions}
              />
            </div>
            <SearchButton />
          </form>

          {/* Selected Songs Preview */}
          {selectedSongs.length > 0 && (
            <div className="mb-2 sm:mb-3 md:mb-4 p-1.5 sm:p-2 md:p-3 bg-muted/50 rounded-lg border w-full max-w-full">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                <h4 className="text-[10px] sm:text-xs md:text-sm font-medium truncate">Selected Songs ({selectedSongs.length})</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSongs([])}
                  className="h-5 sm:h-6 md:h-7 px-1.5 sm:px-2 text-[9px] sm:text-[10px] md:text-xs flex-shrink-0"
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {selectedSongs.map((song) => (
                  <div key={song.id} className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-1.5 sm:p-2 bg-background rounded border min-w-0">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-8 h-6 sm:w-10 sm:h-7 md:w-12 md:h-8 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium truncate">{song.title}</p>
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-muted-foreground truncate">{song.channel}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSelected(song.id)}
                      className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 p-0 flex-shrink-0"
                    >
                      <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-1.5 sm:mt-2 md:mt-3 flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                {selectedSongs.map((song) => (
                  <AddSongButton key={song.id} video={song} />
                ))}
              </div>
            </div>
          )}

          {/* Traditional Search Results */}
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3 lg:space-y-4 w-full max-w-full">
            {state.songs && state.songs.map((song) => (
              <div key={song.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 md:gap-3 rounded-lg border p-1.5 sm:p-2 md:p-3 shadow-sm transition-all hover:bg-card/90 min-w-0">
                <div className="relative w-full sm:w-20 md:w-24 lg:w-32 aspect-video sm:aspect-auto sm:h-14 md:h-16 lg:h-20 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    alt="Thumbnail"
                    className="object-cover"
                    fill
                    sizes="(max-width: 430px) 100vw, (max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                    src={song.thumbnail}
                    data-ai-hint="music video"
                  />
                </div>
                <div className="flex-1 min-w-0 w-full overflow-hidden space-y-0.5">
                  <p className="font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base truncate leading-tight">{song.title}</p>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs xl:text-sm text-muted-foreground truncate leading-tight">{song.channel}</p>
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                  <AddSongButton video={song} />
                </div>
              </div>
            ))}
            {state.error && <p className="text-[10px] sm:text-xs md:text-sm text-destructive text-center pt-2 sm:pt-3 md:pt-4">{state.error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
