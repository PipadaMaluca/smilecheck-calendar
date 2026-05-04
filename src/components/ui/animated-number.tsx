import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

/**
 * Tween a numeric value using requestAnimationFrame.
 * Respects prefers-reduced-motion (snaps to final value).
 */
export function AnimatedNumber({ value, duration = 600, format, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [pulse, setPulse] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || value === display) {
      setDisplay(value);
      return;
    }
    setPulse(value > display ? 'up' : 'down');
    fromRef.current = display;
    startRef.current = null;
    const target = value;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = fromRef.current + (target - fromRef.current) * eased;
      setDisplay(Math.round(next * 100) / 100);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else { setDisplay(target); setTimeout(() => setPulse(null), 300); }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span className={cn('num-tween', pulse === 'up' && 'flash-up', pulse === 'down' && 'flash-down', className)}>
      {format ? format(display) : Math.round(display).toLocaleString()}
    </span>
  );
}