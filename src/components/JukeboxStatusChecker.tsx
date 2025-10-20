'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';

export function JukeboxStatusChecker() {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check status via API
      const response = await fetch('/api/jukebox/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch jukebox status');
      }
      
      const data = await response.json();
      setStatus(data);
      console.log('Jukebox Status:', data);
    } catch (err: any) {
      setError(err.message || 'Failed to check jukebox status');
      console.error('Error checking jukebox status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Jukebox Status Checker</span>
          <Button 
            onClick={checkStatus} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </>
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          Check the current jukebox configuration and connectivity
        </CardDescription>
      </CardHeader>
      
      {(status || error) && (
        <CardContent>
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}
          
          {status && (
            <div className="space-y-4">
              {/* Active Status */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Jukebox Active:</span>
                <div className="flex items-center gap-2">
                  {status.isActive ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-semibold">Yes</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-semibold">No</span>
                    </>
                  )}
                </div>
              </div>

              {/* Playlist ID */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Selected Playlist:</span>
                <span className="text-sm font-mono bg-background px-2 py-1 rounded">
                  {status.selectedPlaylistId || 'None'}
                </span>
              </div>

              {/* Host User ID */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Host User ID:</span>
                <span className="text-sm font-mono bg-background px-2 py-1 rounded truncate max-w-xs">
                  {status.hostUserId || 'None'}
                </span>
              </div>

              {/* Access Token */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Access Token:</span>
                <div className="flex items-center gap-2">
                  {status.accessToken ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Present</span>
                      <span className="text-xs font-mono bg-background px-2 py-1 rounded">
                        {status.accessToken.substring(0, 20)}...
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Missing</span>
                    </>
                  )}
                </div>
              </div>

              {/* Token Expiry */}
              {status.tokenExpiry && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">Token Expires:</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(status.tokenExpiry).toLocaleString()}
                    </span>
                    {status.tokenExpiry < Date.now() && (
                      <span className="text-xs text-red-600 font-semibold">
                        (EXPIRED)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Last Updated */}
              {status.lastUpdated && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">Last Updated:</span>
                  <span className="text-sm">
                    {new Date(status.lastUpdated).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 border-t border-border mt-4">
                {status.isActive && status.selectedPlaylistId && status.accessToken && status.tokenExpiry > Date.now() ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <strong>Status: Ready!</strong> Guests can add songs.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-orange-600">
                      <XCircle className="h-5 w-5" />
                      <strong>Status: Not Ready</strong>
                    </div>
                    <ul className="text-sm space-y-1 ml-7">
                      {!status.isActive && <li>• Jukebox not active</li>}
                      {!status.selectedPlaylistId && <li>• No playlist selected</li>}
                      {!status.accessToken && <li>• No access token</li>}
                      {status.tokenExpiry && status.tokenExpiry < Date.now() && <li>• Token expired</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
