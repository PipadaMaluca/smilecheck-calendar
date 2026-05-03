import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LEVEL_FRAME_RING } from '@/data/pointsData';

interface AvatarFrameProps {
  levelKey: string;
  size?: number; // px
  className?: string;
  children: ReactNode;
}

/**
 * Wraps an avatar (photo or initials circle) with a colored ring matching the user's level.
 * Lata level → no frame. Adamantino → animated golden shimmer ring.
 */
export function AvatarFrame({ levelKey, size, className, children }: AvatarFrameProps) {
  const ring = LEVEL_FRAME_RING[levelKey] || '';
  const isAdam = levelKey === 'adamantino';
  const style = size ? { width: size, height: size } : undefined;

  if (!ring) {
    return <div className={cn('relative shrink-0', className)} style={style}>{children}</div>;
  }

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-full ring-[3px] ring-offset-2 ring-offset-background',
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