import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';

/**
 * Central entrance animation for a screen/tab. Runs ONCE each time `screenKey`
 * changes (never on data re-renders, scroll or language change).
 *
 * Targets inside the wrapper:
 *  - `[data-enter="button"]` (Button default variant marks itself): scale pulse, transform only.
 *  - `[data-enter="text"|"block"]` plus the screen's top-level blocks: fade + short rise.
 *    Lists/tables animate as one block because only top-level children are picked.
 * Skipped: dialogs/toasts, fixed/sticky bars, `[data-enter="none"]`, reduced motion.
 * Above-the-fold content never starts invisible; a 1.5 s fallback jumps to the end.
 */
export function ScreenEnter({
  screenKey, clinical = false, blocks = true, className, children,
}: { screenKey: string; clinical?: boolean; blocks?: boolean; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const k = clinical ? 0.5 : 1;          // amplitude
    const speed = clinical ? 0.7 : 1;      // ~30% faster
    const excluded = (el: Element) =>
      !!el.closest('[role="dialog"],[role="alertdialog"],[data-sonner-toaster],[data-enter="none"]');
    const pinned = (el: Element) => {
      const p = getComputedStyle(el).position;
      return p === 'fixed' || p === 'sticky';
    };
    const vh = window.innerHeight;
    const aboveFold = (el: Element) => el.getBoundingClientRect().top < vh;

    // Text/blocks: top-level children of the screen (descend through single-child wrappers).
    let textTargets: HTMLElement[] = [];
    if (blocks) {
      let level: Element = root;
      for (let i = 0; i < 3 && level.children.length === 1; i++) level = level.children[0];
      textTargets = Array.from(level.children) as HTMLElement[];
      root.querySelectorAll<HTMLElement>('[data-enter="text"],[data-enter="block"]').forEach((el) => {
        if (!textTargets.some((t) => t.contains(el))) textTargets.push(el);
      });
      textTargets = textTargets.filter((el) => !excluded(el) && !pinned(el) && el.offsetParent !== null).slice(0, 12);
    }
    const buttons = Array.from(root.querySelectorAll<HTMLElement>('[data-enter="button"]'))
      .filter((el) => !excluded(el) && el.offsetParent !== null && aboveFold(el))
      .slice(0, 8);

    const tweens: gsap.core.Tween[] = [];
    textTargets.forEach((el, i) => {
      tweens.push(gsap.from(el, {
        y: 12 * k,
        opacity: aboveFold(el) ? 0.35 : 0, // never invisible above the fold
        duration: 0.4 * speed,
        delay: i * 0.05 * speed,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      }));
    });
    buttons.forEach((el, i) => {
      tweens.push(gsap.fromTo(el, { scale: 1 }, {
        keyframes: [{ scale: 1 + 0.05 * k, duration: 0.175 * speed }, { scale: 1, duration: 0.175 * speed }],
        delay: 0.15 * speed + i * 0.06 * speed,
        ease: 'power1.out',
        clearProps: 'transform',
      }));
    });

    // Background tabs pause rAF: jump everything to the final state.
    const fallback = window.setTimeout(() => tweens.forEach((t) => t.progress(1)), 1500);
    return () => {
      window.clearTimeout(fallback);
      tweens.forEach((t) => t.progress(1).kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  return <div ref={ref} className={className} data-screen={screenKey}>{children}</div>;
}

const CLINICAL = ['agenda', 'consultas', 'dossier', 'paciente', 'teleconsulta', 'receitas', 'cartas', 'triagem', 'saude'];
export const isClinicalScreen = (key: string) => CLINICAL.some((c) => key.startsWith(c));
