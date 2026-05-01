import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const LOGO_SRC = '/assets/smilecheck-logo-blue.png';

interface LogoProps {
  size?: number;
  variant?: 'auto' | 'blue' | 'white';
  forceInverse?: boolean;
  withWordmark?: boolean;
  className?: string;
  alt?: string;
  /** Render without the rounded app-icon frame around the logo. */
  unframed?: boolean;
}

function getDark() {
  if (typeof document === 'undefined') return true;
  return document.documentElement.classList.contains('dark');
}

export function Logo({
  size = 40,
  withWordmark = false,
  className,
  alt = 'SmileCheck',
  unframed = false,
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

  // Framed app-icon style per brand spec.
  const frameBg = dark ? '#0D2137' : '#FFFFFF';
  const frameBorder = dark ? '#1E3A5F' : '#D6E4F0';
  const framePadding = Math.max(2, Math.round(size * 0.08));
  const innerSize = size - framePadding * 2;
  const radius = Math.max(6, Math.round(size * 0.22));

  return (
    <span className={cn('inline-flex items-center gap-2 select-none', className)}>
      {unframed ? (
        <img
          src={LOGO_SRC}
          alt={alt}
          style={{ height: size, width: 'auto' }}
          className="object-contain"
          draggable={false}
        />
      ) : (
        <span
          aria-label={alt}
          style={{
            width: size,
            height: size,
            background: frameBg,
            border: `2px solid ${frameBorder}`,
            borderRadius: radius,
            padding: framePadding,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          <img
            src={LOGO_SRC}
            alt={alt}
            style={{ width: innerSize, height: innerSize }}
            className="object-contain"
            draggable={false}
          />
        </span>
      )}
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
