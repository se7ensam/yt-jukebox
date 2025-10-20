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
    <Button type="submit" size="icon" aria-label="Search" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Search for Songs</CardTitle>
        <CardDescription>
          Search for songs and add them to the queue. Use suggestions for faster selection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative">
          <form action={handleFormSubmit} className="flex w-full items-center space-x-2 pb-4">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                name="query"
                placeholder="Search for songs... (e.g., Daft Punk, Taylor Swift)"
                className="flex-1"
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
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Selected Songs ({selectedSongs.length})</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSongs([])}
                  className="h-6 px-2 text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-2">
                {selectedSongs.map((song) => (
                  <div key={song.id} className="flex items-center gap-3 p-2 bg-background rounded border">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-12 h-8 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground">{song.channel}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSelected(song.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                {selectedSongs.map((song) => (
                  <AddSongButton key={song.id} video={song} />
                ))}
              </div>
            </div>
          )}

          {/* Traditional Search Results */}
          <div className="space-y-4">
            {state.songs && state.songs.map((song) => (
              <div key={song.id} className="flex items-center gap-4 rounded-lg border p-3 shadow-sm transition-all hover:bg-card/90">
                <Image
                  alt="Thumbnail"
                  className="aspect-video rounded-md object-cover"
                  height="72"
                  src={song.thumbnail}
                  width="128"
                  data-ai-hint="music video"
                />
                <div className="flex-1">
                  <p className="font-semibold">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.channel}</p>
                </div>
                <AddSongButton video={song} />
              </div>
            ))}
            {state.error && <p className="text-sm text-destructive text-center pt-4">{state.error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
