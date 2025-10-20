'use client';

import { useTransition, useState, useEffect } from 'react';
import { Check, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addSongToPlaylistAction } from '@/lib/actions';
import type { Video } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ButtonState = 'idle' | 'pending' | 'success' | 'error';

export function AddSongButton({ video }: { video: Video }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [state, setState] = useState<ButtonState>('idle');

  useEffect(() => {
    if (!isPending) return;
    setState('pending');
  }, [isPending]);

  const handleClick = () => {
    startTransition(async () => {
      const result = await addSongToPlaylistAction(video);
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: result.error,
        });
        setState('error');
      } else {
        setState('success');
        
        // Dispatch custom event to trigger playlist refresh
        window.dispatchEvent(new CustomEvent('songAdded', { 
          detail: { video } 
        }));
      }

      setTimeout(() => setState('idle'), 2000);
    });
  };

  const buttonContent = {
    idle: <><Plus className="mr-2 h-4 w-4" /> Add</>,
    pending: <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding</>,
    success: <><Check className="mr-2 h-4 w-4" /> Added</>,
    error: <><X className="mr-2 h-4 w-4" /> Error</>,
  };

  return (
    <Button
      size="sm"
      onClick={handleClick}
      disabled={state === 'pending' || state === 'success'}
      className={cn(
        "transition-all w-full sm:w-auto min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm touch-manipulation px-3 sm:px-4",
        state === 'success' && 'bg-green-500 hover:bg-green-600',
        state === 'error' && 'bg-destructive hover:bg-destructive/90'
      )}
    >
      {buttonContent[state]}
    </Button>
  );
}
