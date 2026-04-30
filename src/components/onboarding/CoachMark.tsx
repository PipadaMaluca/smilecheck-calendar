import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';

const LS_PREFIX = 'smilecheck_coachmark_';

/**
 * Returns true if the onboarding tutorial (carousel + tooltips) is still in
 * progress for any role, OR if the explicit completion flag has not been set.
 * Coach marks must NEVER appear during the onboarding flow.
 */
function isOnboardingInProgress(): boolean {
  // Explicit user-controlled flag
  if (localStorage.getItem('sc:onboarding-completed') === 'true') return false;
  // Fallback: at least one role must have completed the legacy onboarding flow
  const roles = ['patient', 'dentist', 'clinic'];
  const anyCompleted = roles.some(
    (r) => localStorage.getItem(`smilecheck_onboarding_${r}`) === 'done'
  );
  return !anyCompleted;
}

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
  const { t } = useTranslation();
  const isMobile = useIsMobile();
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
    if (isMobile) { setPos({ top: 0, left: 0, arrowSide: 'top' }); return; }
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
  }, [targetId, isMobile]);

  useEffect(() => {
    if (dismissed || !enabled) return;
    // Wait for DOM to settle
    const timer = setTimeout(() => {
      // Suppress while the onboarding carousel/tooltips are still active
      if (isOnboardingInProgress()) return;
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

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <>
        <div
          className="fixed inset-0 z-[79] bg-background/40 animate-fade-in"
          onClick={dismiss}
        />
        <div
          ref={ref}
          className="fixed left-0 right-0 bottom-0 z-[80] animate-slide-in-right"
          style={{ animationDuration: '200ms' }}
        >
          <div className="mx-3 mb-[max(env(safe-area-inset-bottom),16px)] rounded-2xl p-4 bg-popover border border-border shadow-[0_4px_16px_rgba(33,150,243,0.18)]">
            <h4 className="text-[15px] font-bold text-primary mb-1">{title}</h4>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">{description}</p>
            <button
              onClick={dismiss}
              className="w-full h-10 rounded-lg bg-primary/10 text-primary font-semibold text-[14px] hover:bg-primary/20 transition-colors"
            >
              {t('coachmarks.gotIt')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      ref={ref}
      className="fixed z-[80] w-[280px] animate-fade-in"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="bg-popover border border-border rounded-lg p-3.5 shadow-[0_4px_16px_rgba(33,150,243,0.18)] relative">
        {/* Arrow */}
        <div
          className={cn(
            'absolute w-2.5 h-2.5 bg-popover border-border rotate-45',
            pos.arrowSide === 'top' && '-top-[5px] left-1/2 -translate-x-1/2 border-l border-t',
            pos.arrowSide === 'bottom' && '-bottom-[5px] left-1/2 -translate-x-1/2 border-r border-b',
          )}
        />
        <h4 className="text-[14px] font-bold text-primary mb-1">{title}</h4>
        <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{description}</p>
        <button
          onClick={dismiss}
          className="text-[12px] text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {t('coachmarks.gotIt')}
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
