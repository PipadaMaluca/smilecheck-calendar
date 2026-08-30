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
  const hasStarted = useRef(false);
  const finishRef = useRef<() => void>(() => {});

  const handleFinish = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    markVideoSplashSeen(role);
    setFadeOut(true);
    setTimeout(() => onFinish(), 500);
  }, [role, onFinish]);

  finishRef.current = handleFinish;

  // Timers + playback start run exactly once per mount — no prop-identity reruns,
  // so the video is never restarted mid-playback.
  useEffect(() => {
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);
    const safetyTimer = setTimeout(() => finishRef.current(), 8000);

    const video = videoRef.current;
    if (video && !hasStarted.current) {
      hasStarted.current = true;
      video.muted = false;
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay with audio blocked — resume muted from the same position.
          video.muted = true;
          video.play().catch(() => finishRef.current());
        });
      }
    }

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(safetyTimer);
    };
  }, []);


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
