import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VideoSplashScreenProps {
  role: string;
  onFinish: () => void;
}

const STORAGE_KEY_PREFIX = 'smilecheck_video_splash_';

export function hasSeenVideoSplash(role: string): boolean {
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${role}`) === 'done';
}

export function markVideoSplashSeen(role: string): void {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${role}`, 'done');
}

export function VideoSplashScreen({ role, onFinish }: VideoSplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const hasFinished = useRef(false);

  const handleFinish = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    markVideoSplashSeen(role);
    setFadeOut(true);
    setTimeout(() => onFinish(), 500);
  }, [role, onFinish]);

  useEffect(() => {
    // Show skip button after 2 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);
    // Safety timeout — if video doesn't end in 8 seconds, finish anyway
    const safetyTimer = setTimeout(() => handleFinish(), 8000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(safetyTimer);
    };
  }, [handleFinish]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try to play with audio first
    video.muted = false;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay with audio blocked — play muted
        if (video) {
          video.muted = true;
          video.play().catch(() => {
            // Can't play at all — skip
            handleFinish();
          });
        }
      });
    }
  }, [handleFinish]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] bg-background transition-opacity duration-500',
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        playsInline
        preload="auto"
        onEnded={handleFinish}
        src="/assets/loadingvideo.mp4"
      />

      {/* Skip button */}
      <button
        onClick={handleFinish}
        className={cn(
          'absolute top-6 right-6 z-10 text-sm text-white/70 hover:text-white transition-all duration-300',
          'px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm',
          showSkip ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        Saltar
      </button>
    </div>
  );
}
