import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const LOGO_SQUARE_SRC = '/logos/smilecheck-square.png';
const LOGO_HORIZONTAL_SRC = '/logos/smilecheck-horizontal.png';

interface LogoProps {
  size?: number;
  variant?: 'square' | 'horizontal' | 'auto' | 'blue' | 'white';
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
  variant = 'square',
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

  // Light-mode adaptation: the logo PNGs ship with a dark #0A1929 background.
  // We wrap them in an intentional dark "badge" container in light mode so the
  // dark rectangle reads as a deliberate design choice instead of a rendering
  // artifact. In dark mode the badge bg simply blends with the page bg.
  if (variant === 'horizontal') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center select-none',
          !dark && 'bg-[#0A1929]',
          className,
        )}
        style={{
          padding: !dark ? '6px 14px' : 0,
          borderRadius: !dark ? 16 : 0,
        }}
      >
        <img
          src={LOGO_HORIZONTAL_SRC}
          alt={alt}
          style={{ width: size, height: 'auto', display: 'block' }}
          className="object-contain"
          draggable={false}
        />
      </span>
    );
  }

  // Framed app-icon style per brand spec.
  // The new logo artwork already ships with its own dark rounded square,
  // so we render it unframed on top of any background and it looks intentional.
  const LOGO_SRC = LOGO_SQUARE_SRC;
  const frameBg = dark ? '#0D2137' : '#FFFFFF';
  const frameBorder = dark ? '#1E3A5F' : '#D6E4F0';
  const framePadding = Math.max(2, Math.round(size * 0.08));
  const innerSize = size - framePadding * 2;
  const radius = Math.max(6, Math.round(size * 0.22));

  const squareRadius = Math.max(12, Math.round(size * 0.22));

  return (
    <span className={cn('inline-flex items-center gap-2 select-none', className)}>
      {(unframed || true) ? (
        <span
          className="inline-flex items-center justify-center"
          style={{
            background: !dark ? '#0A1929' : 'transparent',
            borderRadius: !dark ? 20 : 0,
            padding: !dark ? 8 : 0,
          }}
        >
          <img
            src={LOGO_SRC}
            alt={alt}
            style={{
              height: size,
              width: size,
              borderRadius: !dark ? 12 : squareRadius,
              overflow: 'hidden',
            }}
            className="object-contain"
            draggable={false}
          />
        </span>
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
