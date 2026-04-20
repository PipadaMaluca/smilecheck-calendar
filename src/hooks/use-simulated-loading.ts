import { useState, useEffect } from 'react';

/**
 * Simulated loading flag, cached per session.
 * The first visit per `key` shows the skeleton for `duration` ms; subsequent
 * visits in the same browser session return `false` immediately.
 * Pass a unique `key` per screen (e.g. 'dashboard', 'agenda', 'profile').
 */
export function useSimulatedLoading(duration = 1200, key = 'global'): boolean {
  const storageKey = `sc:loaded:${key}`;

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true;
    return sessionStorage.getItem(storageKey) !== '1';
  });

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch {
        /* sessionStorage unavailable — ignore */
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [isLoading, duration, storageKey]);

  return isLoading;
}
