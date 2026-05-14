import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type LogoVariant = 'icon' | 'full' | 'horizontal';

const SOURCES: Record<LogoVariant, { dark: string; light: string }> = {
  icon: {
    dark: '/logos/logo_icon_dark.png',
    light: '/logos/logo_icon_light.png',
  },
  full: {
    dark: '/logos/logo_full_dark.png',
    light: '/logos/logo_full_light.png',
  },
  horizontal: {
    dark: '/logos/logo_horizontal_dark.png',
    light: '/logos/logo_horizontal_light.png',
  },
};

const RADIUS: Record<LogoVariant, number> = {
  icon: 16,
  full: 20,
  horizontal: 12,
};

interface LogoProps {
  variant?: LogoVariant | 'square' | 'auto' | 'blue' | 'white';
  size?: number;
  className?: string;
  alt?: string;
  /** Force a specific theme variant (useful when container theme is fixed). */
  theme?: 'dark' | 'light';
  /** Deprecated, kept for backward-compat. No-op. */
  withWordmark?: boolean;
  /** Deprecated, kept for backward-compat. No-op. */
  unframed?: boolean;
  /** Deprecated, kept for backward-compat. No-op. */
  forceInverse?: boolean;
}

function getDark() {
  if (typeof document === 'undefined') return true;
  return document.documentElement.classList.contains('dark');
}

function normalizeVariant(v: LogoProps['variant']): LogoVariant {
  if (v === 'horizontal' || v === 'full' || v === 'icon') return v;
  // Legacy variants ('square', 'auto', 'blue', 'white') → icon
  return 'icon';
}

export function Logo({
  variant = 'icon',
  size = 40,
  className,
  alt = 'SmileCheck',
  theme,
}: LogoProps) {
  const [dark, setDark] = useState<boolean>(getDark);

  useEffect(() => {
    const update = () => setDark(getDark());
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('smilecheck:theme-change', update);
    return () => {
      obs.disconnect();
      window.removeEventListener('smilecheck:theme-change', update);
    };
  }, []);

  const v = normalizeVariant(variant);
  const isDark = theme ? theme === 'dark' : dark;
  const src = isDark ? SOURCES[v].dark : SOURCES[v].light;
  const borderRadius = RADIUS[v];

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      className={cn('select-none', className)}
      style={{ width: size, height: 'auto', borderRadius, display: 'block' }}
      draggable={false}
    />
  );
}
