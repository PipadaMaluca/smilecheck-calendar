import * as React from "react";

/**
 * Single source of truth for responsive breakpoints.
 *
 * mobile   : < 768px
 * tablet   : 768px – 1023px
 * desktop  : >= 1024px
 *
 * PROJECT RULE: tablet FOLLOWS DESKTOP composition. Use `useIsDesktopLayout()`
 * (>= 768px) for layout/composition decisions, and `useDevice()` only when a
 * genuine tablet-specific tweak (density, columns) is needed.
 */
export const BREAKPOINTS = {
  /** narrow phones — per-column min-width / scroll-snap tweaks */
  narrow: 500,
  /** mobile -> tablet boundary; also the desktop-composition boundary */
  tablet: 768,
  /** tablet -> desktop boundary */
  desktop: 1024,
} as const;

export type DeviceKind = "mobile" | "tablet" | "desktop";

function query(q: string) {
  return typeof window !== "undefined" && window.matchMedia(q).matches;
}

function useMediaQuery(q: string, initial = false) {
  const [matches, setMatches] = React.useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(q).matches : initial
  );

  React.useEffect(() => {
    const mql = window.matchMedia(q);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [q]);

  return matches;
}

export function getDevice(): DeviceKind {
  if (query(`(min-width: ${BREAKPOINTS.desktop}px)`)) return "desktop";
  if (query(`(min-width: ${BREAKPOINTS.tablet}px)`)) return "tablet";
  return "mobile";
}

export function useDevice(): DeviceKind {
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);
  const isTabletUp = useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`);
  return isDesktop ? "desktop" : isTabletUp ? "tablet" : "mobile";
}

/** true for tablet AND desktop — tablet follows desktop composition. */
export function useIsDesktopLayout() {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`, true);
}

/** true only below 768px. */
export function useIsMobileWidth() {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.tablet - 1}px)`);
}

/** true only below 500px (narrow phones). */
export function useIsNarrowWidth() {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.narrow - 1}px)`);
}
