'use client';

import { usePlaylistSettings } from '@/hooks/use-playlist-settings';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function HostStatus() {
  const { selectedPlaylistId, isLoading } = usePlaylistSettings();

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (!selectedPlaylistId) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>⚠️ Host Setup Required</strong>
          <p className="mt-1">The host needs to log in and select a YouTube playlist before you can add songs.</p>
          <p className="mt-1 text-sm">Songs can only be added to a real YouTube playlist. Please wait for the host to complete setup.</p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800 dark:text-green-200">
        <strong>Ready to Rock!</strong> The host has set up the playlist. You can now add songs to the queue!
      </AlertDescription>
    </Alert>
  );
}
