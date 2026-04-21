import { useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'sc:theme';
const LEGACY_KEY = 'sc-theme';
const EVENT = 'smilecheck:theme-change';

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved =
    localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
  return saved === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  localStorage.setItem(STORAGE_KEY, theme);
  localStorage.setItem(LEGACY_KEY, theme);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: theme }));
}

export function initThemeAtBoot() {
  applyTheme(getInitialTheme());
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent<Theme>).detail;
      if (next === 'light' || next === 'dark') setThemeState(next);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    setThemeState(t);
  }, []);

  return [theme, setTheme];
}