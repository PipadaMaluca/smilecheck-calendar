import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LEVEL_FRAME_RING } from '@/data/pointsData';

interface AvatarFrameProps {
  levelKey: string;
  size?: number; // px
  className?: string;
  children: ReactNode;
  shape?: 'circle' | 'square';
}

/**
 * Wraps an avatar (photo or initials circle) with a colored ring matching the user's level.
 * Lata level → no frame. Adamantino → animated golden shimmer ring.
 */
export function AvatarFrame({ levelKey, size, className, children, shape = 'circle' }: AvatarFrameProps) {
  const ring = LEVEL_FRAME_RING[levelKey] || '';
  const isAdam = levelKey === 'adamantino';
  const style = size ? { width: size, height: size } : undefined;
  const radius = shape === 'square' ? 'rounded-2xl' : 'rounded-full';

  if (!ring) {
    return <div className={cn('relative shrink-0', radius, className)} style={style}>{children}</div>;
  }

  return (
    <div
      className={cn(
        'relative shrink-0 ring-[3px] ring-offset-2 ring-offset-background',
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