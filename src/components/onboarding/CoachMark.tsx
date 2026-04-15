import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

const LS_PREFIX = 'smilecheck_coachmark_';

interface CoachMarkProps {
  id: string;
  targetId: string;
  title: string;
  description: string;
  /** Set false to suppress (e.g. while loading skeletons) */
  enabled?: boolean;
}

/**
 * A lightweight, per-section coach-mark tooltip.
 * Shows once on first visit; dismissed permanently via "Percebi!".
 * Only one CoachMark renders at a time (first mounted wins).
 */
// Global lock so only one coach mark shows at a time
let activeCoachMarkId: string | null = null;
const listeners = new Set<() => void>();
function claimSlot(id: string): boolean {
  if (!activeCoachMarkId) {
    activeCoachMarkId = id;
    listeners.forEach(fn => fn());
    return true;
  }
  return activeCoachMarkId === id;
}
function releaseSlot(id: string) {
  if (activeCoachMarkId === id) {
    activeCoachMarkId = null;
    listeners.forEach(fn => fn());
  }
}

export function CoachMark({ id, targetId, title, description, enabled = true }: CoachMarkProps) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(`${LS_PREFIX}${id}`) === '1');
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; arrowSide: 'top' | 'bottom' } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Subscribe to global slot changes
  useEffect(() => {
    const handler = () => {
      if (activeCoachMarkId !== id) setVisible(false);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, [id]);

  const compute = useCallback(() => {
    const el = document.getElementById(targetId);
    if (!el) { setPos(null); return; }
    const rect = el.getBoundingClientRect();
    const tooltipW = 280;
    const tooltipH = 120;
    const gap = 10;

    let top = rect.bottom + gap;
    let arrowSide: 'top' | 'bottom' = 'top';
    if (top + tooltipH > window.innerHeight - 20) {
      top = rect.top - tooltipH - gap;
      arrowSide = 'bottom';
    }
    let left = rect.left + rect.width / 2 - tooltipW / 2;
    if (left < 8) left = 8;
    if (left + tooltipW > window.innerWidth - 8) left = window.innerWidth - tooltipW - 8;

    setPos({ top, left, arrowSide });
  }, [targetId]);

  useEffect(() => {
    if (dismissed || !enabled) return;
    // Wait for DOM to settle
    const timer = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (!el) return;
      if (claimSlot(id)) {
        compute();
        setVisible(true);
      }
    }, 1500);
    return () => { clearTimeout(timer); releaseSlot(id); };
  }, [dismissed, enabled, id, targetId, compute]);

  useEffect(() => {
    if (!visible) return;
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [visible, compute]);

  const dismiss = () => {
    localStorage.setItem(`${LS_PREFIX}${id}`, '1');
    setDismissed(true);
    setVisible(false);
    releaseSlot(id);
  };

  if (!visible || !pos) return null;

  return (
    <div
      ref={ref}
      className="fixed z-[80] w-[280px] animate-fade-in"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="bg-[hsl(214,45%,24%)] border border-[hsl(214,45%,34%)] rounded-lg p-3.5 shadow-xl relative">
        {/* Arrow */}
        <div
          className={cn(
            'absolute w-2.5 h-2.5 bg-[hsl(214,45%,24%)] border-[hsl(214,45%,34%)] rotate-45',
            pos.arrowSide === 'top' && '-top-[5px] left-1/2 -translate-x-1/2 border-l border-t',
            pos.arrowSide === 'bottom' && '-bottom-[5px] left-1/2 -translate-x-1/2 border-r border-b',
          )}
        />
        <h4 className="text-[14px] font-bold text-foreground mb-1">{title}</h4>
        <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{description}</p>
        <button
          onClick={dismiss}
          className="text-[12px] text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Percebi!
        </button>
      </div>
    </div>
  );
}

/** Reset all coach marks (for "Rever Tutorial" in settings) */
export function resetAllCoachMarks() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(LS_PREFIX));
  keys.forEach(k => localStorage.removeItem(k));
  activeCoachMarkId = null;
  listeners.forEach(fn => fn());
}
