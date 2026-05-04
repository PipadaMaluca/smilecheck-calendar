import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LEVEL_FRAME_RING } from '@/data/pointsData';

/** Bottom-right "level pip" dot color per level. Lata is hidden. */
const LEVEL_PIP_BG: Record<string, string> = {
  lata: '',
  bronze: 'bg-amber-700',
  prata: 'bg-slate-300',
  ouro: 'bg-amber-400',
  platina: 'bg-purple-400',
  diamante: 'bg-blue-400',
  adamantino: 'bg-amber-300',
};

export type AvatarFrameVariant =
  | 'full'   // 1.5px ring, always visible. Use on profile headers, leaderboard top 3, search "Destaque", own header.
  | 'pip'    // No ring; small 8px colored dot at bottom-right. Use on chat list, consultation rows, dashboard list items.
  | 'auto';  // Tiny avatars (<size threshold) → pip; otherwise full. Default.

interface AvatarFrameProps {
  levelKey: string;
  size?: number; // px — used to decide auto behavior
  className?: string;
  children: ReactNode;
  shape?: 'circle' | 'square';
  variant?: AvatarFrameVariant;
}

/**
 * Wraps an avatar with a colored ring (full) or a tiny colored pip in the corner (pip)
 * matching the user's level. Lata → no frame/pip. Adamantino full → animated golden shimmer.
 * Auto picks pip for avatars under 40px and full for larger.
 */
export function AvatarFrame({ levelKey, size, className, children, shape = 'circle', variant = 'auto' }: AvatarFrameProps) {
  const ring = LEVEL_FRAME_RING[levelKey] || '';
  const pip = LEVEL_PIP_BG[levelKey] || '';
  const isAdam = levelKey === 'adamantino';
  const style = size ? { width: size, height: size } : undefined;
  const radius = shape === 'square' ? 'rounded-2xl' : 'rounded-full';

  const effectiveVariant: 'full' | 'pip' | 'none' = (() => {
    if (variant === 'full') return ring ? 'full' : 'none';
    if (variant === 'pip') return pip ? 'pip' : 'none';
    // auto: tiny → pip, larger → full ring
    const px = size ?? 40;
    if (px < 40) return pip ? 'pip' : 'none';
    return ring ? 'full' : 'none';
  })();

  if (effectiveVariant === 'none') {
    return <div className={cn('relative shrink-0', radius, className)} style={style}>{children}</div>;
  }

  if (effectiveVariant === 'pip') {
    return (
      <div className={cn('relative shrink-0', radius, className)} style={style}>
        {children}
        <span
          aria-hidden
          className={cn(
            'absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-background',
            pip,
            isAdam && 'level-frame-shimmer',
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative shrink-0 ring-[1.5px] ring-offset-2 ring-offset-background',
        radius,
        ring,
        isAdam && 'level-frame-shimmer',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}