import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const BLUE = '/assets/smilecheck-logo-blue.png';
const WHITE = '/assets/smilecheck-logo-white.png';

interface LogoProps {
  size?: number;
  variant?: 'auto' | 'blue' | 'white';
  forceInverse?: boolean;
  withWordmark?: boolean;
  className?: string;
  alt?: string;
}

function getDark() {
  if (typeof document === 'undefined') return true;
  return document.documentElement.classList.contains('dark');
}

export function Logo({
  size = 40,
  variant = 'auto',
  forceInverse,
  withWordmark = false,
  className,
  alt = 'SmileCheck',
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

  const src =
    variant === 'blue'
      ? BLUE
      : variant === 'white'
      ? WHITE
      : forceInverse
      ? dark ? BLUE : WHITE
      : dark
      ? WHITE
      : BLUE;

  return (
    <span className={cn('inline-flex items-center gap-2 select-none', className)}>
      <img
        src={src}
        alt={alt}
        style={{ height: size, width: 'auto' }}
        className="object-contain"
        draggable={false}
      />
      {withWordmark && (
        <span
          className="font-bold tracking-tight text-foreground"
          style={{ fontSize: Math.round(size * 0.55) }}
        >
          SmileCheck
        </span>
      )}
    </span>
  );
}
