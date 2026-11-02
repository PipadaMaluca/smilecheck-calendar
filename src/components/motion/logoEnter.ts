/**
 * Logo entrance (part of the central entrance-animation system, see ScreenEnter):
 * 'mount' swells on every mount; 'app' swells only while the app is opening, so
 * always-visible shells (sidebar, mobile header) don't replay on screen changes.
 * Reduced motion is handled in CSS.
 */
export type LogoEnter = 'mount' | 'app' | false;

let appOpenedAt: number | null = null;

export function logoEnterClass(mode: LogoEnter): string {
  if (!mode) return '';
  if (mode === 'app') {
    const now = Date.now();
    if (appOpenedAt === null) appOpenedAt = now;
    if (now - appOpenedAt > 1500) return '';
  }
  return 'sc-logo-enter';
}
