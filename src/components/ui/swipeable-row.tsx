import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface SwipeAction {
  label: string;
  icon: React.ReactNode;
  color: string; // bg color class or hex
  onAction: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  className?: string;
  disabled?: boolean;
  rowId: string;
  activeRowId: string | null;
  onSwipeOpen: (id: string | null) => void;
}

const PARTIAL_THRESHOLD = 0.4;
const FULL_THRESHOLD = 0.6;
const ACTION_WIDTH = 80;

export function SwipeableRow({
  children,
  leftActions = [],
  rightActions = [],
  className,
  disabled = false,
  rowId,
  activeRowId,
  onSwipeOpen,
}: SwipeableRowProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const rowWidth = useRef(0);

  // Close when another row opens
  useEffect(() => {
    if (activeRowId !== rowId && offset !== 0) {
      setOffset(0);
    }
  }, [activeRowId, rowId]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || !isMobile) return;
    startX.current = e.touches[0].clientX;
    startOffset.current = offset;
    rowWidth.current = containerRef.current?.offsetWidth || 300;
    setIsDragging(true);
  }, [disabled, isMobile, offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX.current;
    let newOffset = startOffset.current + dx;

    const maxRight = leftActions.length * ACTION_WIDTH;
    const maxLeft = -(rightActions.length * ACTION_WIDTH);

    // Rubber band beyond limits
    if (newOffset > maxRight) {
      newOffset = maxRight + (newOffset - maxRight) * 0.3;
    } else if (newOffset < maxLeft) {
      newOffset = maxLeft + (newOffset - maxLeft) * 0.3;
    }

    // Don't swipe in a direction with no actions
    if (leftActions.length === 0 && newOffset > 0) newOffset = 0;
    if (rightActions.length === 0 && newOffset < 0) newOffset = 0;

    setOffset(newOffset);
  }, [isDragging, leftActions.length, rightActions.length]);

  const triggerAction = useCallback((action: SwipeAction, color: string) => {
    setFlashColor(color);
    setTimeout(() => {
      setFlashColor(null);
      setOffset(0);
      onSwipeOpen(null);
    }, 300);
    action.onAction();
  }, [onSwipeOpen]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const w = rowWidth.current;
    const ratio = Math.abs(offset) / w;

    if (offset > 0 && leftActions.length > 0) {
      if (ratio >= FULL_THRESHOLD) {
        // Auto-trigger first left action
        triggerAction(leftActions[0], 'rgba(76,175,80,0.3)');
      } else if (ratio >= PARTIAL_THRESHOLD) {
        setOffset(leftActions.length * ACTION_WIDTH);
        onSwipeOpen(rowId);
      } else {
        setOffset(0);
        onSwipeOpen(null);
      }
    } else if (offset < 0 && rightActions.length > 0) {
      if (ratio >= FULL_THRESHOLD) {
        triggerAction(rightActions[0], 'rgba(244,67,54,0.3)');
      } else if (ratio >= PARTIAL_THRESHOLD) {
        setOffset(-(rightActions.length * ACTION_WIDTH));
        onSwipeOpen(rowId);
      } else {
        setOffset(0);
        onSwipeOpen(null);
      }
    } else {
      setOffset(0);
    }
  }, [isDragging, offset, leftActions, rightActions, triggerAction, onSwipeOpen, rowId]);

  // Desktop: render children directly
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Left actions (revealed on swipe right) */}
      {leftActions.length > 0 && (
        <div className="absolute inset-y-0 left-0 flex">
          {leftActions.map((action, i) => (
            <button
              key={i}
              className="flex flex-col items-center justify-center text-white font-medium text-[11px] gap-1"
              style={{ width: ACTION_WIDTH, backgroundColor: action.color }}
              onClick={() => triggerAction(action, 'rgba(76,175,80,0.3)')}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Right actions (revealed on swipe left) */}
      {rightActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex">
          {rightActions.map((action, i) => (
            <button
              key={i}
              className="flex flex-col items-center justify-center text-white font-medium text-[11px] gap-1"
              style={{ width: ACTION_WIDTH, backgroundColor: action.color }}
              onClick={() => triggerAction(action, 'rgba(244,67,54,0.3)')}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div
        className={cn(
          "relative z-10 bg-card",
          !isDragging && "transition-transform duration-150 ease-out"
        )}
        style={{
          transform: `translateX(${offset}px)`,
          backgroundColor: flashColor || undefined,
          transition: flashColor 
            ? 'background-color 300ms ease, transform 200ms ease-out' 
            : isDragging ? 'none' : 'transform 200ms ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
