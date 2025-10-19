'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Search, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { searchSongsAction, type SearchState } from '@/lib/actions';
import { AddSongButton } from './AddSongButton';

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
  const [state, formAction] = useFormState(searchSongsAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Search for a Song</CardTitle>
        <CardDescription>Find a song on YouTube and add it to the queue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex w-full items-center space-x-2 pb-4">
          <Input name="query" placeholder="e.g., Daft Punk - Around the World" className="flex-1" />
          <SearchButton />
        </form>

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
      </CardContent>
    </Card>
  );
}
