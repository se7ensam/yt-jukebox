'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function JukeboxStatusChecker() {
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/jukebox/status');
      
      if (!response.ok) {
        setIsReady(false);
        return;
      }
      
      const data = await response.json();
      
      // Check if jukebox is fully ready
      // Note: Tokens are managed server-side, so we only check public status
      const ready = data.isActive && 
                   data.selectedPlaylistId && 
                   data.hostUserId;
      
      setIsReady(ready);
    } catch (err) {
      console.error('Error checking jukebox status:', err);
      setIsReady(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check status on mount
  useEffect(() => {
    checkStatus();
    // Re-check every 60 seconds (reduced from 30s for better performance)
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-2">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="text-sm text-muted-foreground">Checking jukebox status...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2">
      {isReady ? (
        <>
          <CheckCircle className="h-6 w-6 text-green-600" />
          <span className="text-sm font-medium text-green-600">Jukebox is ready</span>
        </>
      ) : (
        <>
          <XCircle className="h-6 w-6 text-gray-400" />
          <span className="text-sm text-muted-foreground">Jukebox not configured</span>
        </>
      )}
    </div>
  );
}
