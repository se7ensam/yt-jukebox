'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Video } from '@/lib/definitions';
import { Slider } from '@/components/ui/slider';

interface SimplePlayerProps {
  videos: Video[];
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi(): Promise<any> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return;
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existing) {
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    document.head.appendChild(script);
  });
}

export default function SimplePlayer({ videos }: SimplePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const monitorRef = useRef<number | null>(null);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const currentVideo = videos[currentIndex];

  const loadVideo = useCallback((index: number) => {
    const video = videos[index];
    if (!video || !playerRef.current) return;
    try {
      playerRef.current.loadVideoById(video.id);
    } catch (_) {}
  }, [videos]);

  const play = useCallback(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.playVideo();
      setIsPlaying(true);
    } catch (_) {}
  }, []);

  const pause = useCallback(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } catch (_) {}
  }, []);

  const skipNext = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, videos.length - 1);
    if (nextIndex !== currentIndex) {
      // Reset progress immediately when changing tracks
      setCurrentSeconds(0);
      setDurationSeconds(0);
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, videos.length]);

  const skipPrev = useCallback(() => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex !== currentIndex) {
      // Reset progress immediately when changing tracks
      setCurrentSeconds(0);
      setDurationSeconds(0);
      setCurrentIndex(prevIndex);
    }
  }, [currentIndex]);



  useEffect(() => {
    let cancelled = false;
    (async () => {
      const YT = await loadYouTubeApi();
      if (cancelled) return;
      if (!containerRef.current) return;
      
      playerRef.current = new YT.Player(containerRef.current, {
        height: '0', width: '0',
        playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
        events: { 
          onReady: () => setIsReady(true),
          onStateChange: (event: any) => {
            // Auto-advance to next track when current ends
            if (event.data === 0 && currentIndex < videos.length - 1) { // 0 = ended
              setCurrentIndex(prev => prev + 1);
            }
          }
        }
      });
    })();
    return () => { 
      cancelled = true; 
      try { playerRef.current?.destroy?.(); } catch (_) {} 
    };
  }, []);

  // Load video when index changes
  useEffect(() => {
    if (isReady && videos.length > 0) {
      loadVideo(currentIndex);
      // Reset playing state and progress when changing tracks
      setIsPlaying(false);
      setCurrentSeconds(0);
      setDurationSeconds(0);
    }
  }, [isReady, currentIndex, loadVideo]);

  // Monitor playback progress
  useEffect(() => {
    if (!isReady) return;
    if (monitorRef.current) window.clearInterval(monitorRef.current);
    
    monitorRef.current = window.setInterval(() => {
      if (!playerRef.current || !isPlaying) return;
      try {
        const duration = playerRef.current.getDuration?.() ?? 0;
        const current = playerRef.current.getCurrentTime?.() ?? 0;
        setDurationSeconds(duration || 0);
        if (!isSeeking) setCurrentSeconds(current || 0);
      } catch (_) {}
    }, 250) as unknown as number;
    
    return () => { 
      if (monitorRef.current) window.clearInterval(monitorRef.current); 
    };
  }, [isReady, isPlaying, isSeeking]);

  const formatTime = (s: number) => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

  const handleSeekCommit = (val: number) => {
    if (!playerRef.current) return;
    try { 
      playerRef.current.seekTo?.(val, true); 
    } catch (_) {}
    setIsSeeking(false);
  };

  return (
    <div className="w-full">
      <div className="absolute -left-[9999px] top-auto">
        <div ref={containerRef} />
      </div>
      
      {/* Now Playing */}
      <div className="flex items-center gap-3 mb-3">
        {currentVideo && (
          <img src={currentVideo.thumbnail} alt={currentVideo.title} className="w-14 h-10 rounded object-cover" />
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium truncate max-w-[60vw]">{currentVideo?.title || '—'}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[60vw]">{currentVideo?.channel || ''}</div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-1 rounded border"
          onClick={() => {
            if (!isPlaying) {
              play();
            } else {
              pause();
            }
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button 
          className="px-3 py-1 rounded border" 
          onClick={skipPrev} 
          disabled={currentIndex <= 0}
        >
          Prev
        </button>
        <button 
          className="px-3 py-1 rounded border" 
          onClick={skipNext} 
          disabled={currentIndex >= videos.length - 1}
        >
          Next
        </button>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatTime(currentSeconds)} / {formatTime(durationSeconds)}
        </span>
      </div>

      {/* Progress Slider */}
      <div className="mt-2">
        <Slider
          min={0}
          max={Math.max(1, Math.floor(durationSeconds))}
          step={1}
          value={[Math.floor(currentSeconds)]}
          onValueChange={(v) => { setIsSeeking(true); setCurrentSeconds(v[0] || 0); }}
          onValueCommit={(v) => handleSeekCommit(v[0] || 0)}
        />
      </div>
    </div>
  );
}