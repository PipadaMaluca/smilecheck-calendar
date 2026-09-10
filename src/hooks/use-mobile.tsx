import { useIsMobileWidth } from "./use-device";

/**
 * Kept for backwards compatibility — delegates to the centralized
 * breakpoint API in `use-device.ts` (mobile = < 768px).
 */
export function useIsMobile() {
  return useIsMobileWidth();
}
