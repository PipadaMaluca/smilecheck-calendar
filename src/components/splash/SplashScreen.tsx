import { useState, useEffect } from 'react';
import smileIcon from '@/assets/smilecheck-icon.png';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  userRole: 'patient' | 'dentist' | 'clinic';
  onFinish: () => void;
}

export function SplashScreen({ userRole, onFinish }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const showPro = userRole !== 'patient';

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const removeTimer = setTimeout(() => onFinish(), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500',
        fadeOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Logo */}
      <img
        src={smileIcon}
        alt="SmileCheck"
        className="w-[120px] h-[120px] animate-fade-in"
      />

      {/* Pro Badge */}
      {showPro && (
        <span
          className="mt-4 px-4 py-1 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 text-sm font-bold animate-fade-in"
          style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
        >
          Pro
        </span>
      )}
    </div>
  );
}
