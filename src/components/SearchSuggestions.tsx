'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Music, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Video } from '@/lib/definitions';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (video: Video) => void;
  onClose: () => void;
  isVisible: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string;
}

export function SearchSuggestions({ query, onSelect, onClose, isVisible }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log('SearchSuggestions: Rendered with isVisible:', isVisible, 'query:', query);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchSuggestions = async () => {
      console.log('SearchSuggestions: Starting search for:', query);
      setIsLoading(true);
      try {
        // Get access token from the in-memory database (same as used by other functions)
        // We need to import the db and check if host is authenticated
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&maxResults=8`);
        
        console.log('SearchSuggestions: Response status:', response.status);
        const data = await response.json();
        console.log('SearchSuggestions: Response data:', data);
        
        setSuggestions(data.videos || []);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('SearchSuggestions: Failed to fetch search suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onClose]);

  const handleSelect = (video: SearchResult) => {
    const videoObj: Video = {
      id: video.id,
      title: video.title,
      channel: video.channel,
      thumbnail: video.thumbnail,
    };
    onSelect(videoObj);
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  // Show loading state even if no suggestions yet
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg">
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
        </div>
      </div>
    );
  }

  // Show "No results" if not loading and no suggestions
  if (suggestions.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg">
        <div className="p-4 text-center text-sm text-muted-foreground">
          No results found for "{query}"
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto"
    >
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
        </div>
      ) : (
        <div className="py-2">
          {suggestions.map((video, index) => (
            <button
              key={video.id}
              onClick={() => handleSelect(video)}
              className={cn(
                "w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors",
                selectedIndex === index && "bg-muted"
              )}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-16 h-12 object-cover rounded"
                  loading="lazy"
                />
                {video.duration && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    {video.duration}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm line-clamp-2">
                  {video.title}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Music className="h-3 w-3" />
                  {video.channel}
                </div>
              </div>
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </div>
      )}
    </div>
  );
}
