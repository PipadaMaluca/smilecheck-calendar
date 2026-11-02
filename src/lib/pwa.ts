/**
 * The only service-worker registrar. Refuses (and cleans up) in dev, iframes and Lovable previews.
 * The worker caches the app shell and static assets only — never API responses or health data.
 */
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
const LOVABLE_PREVIEW_DOMAINS = ['.lovable.app', '.gpt-eng.com', '.gptengineer.run'];
const DELEGATED_PREVIEW_HOST = 'id-preview--32406e4d-a317-44f1-9a40-adff5c8d9619.lovable.app';
const PROJECT_DEV_LABEL = 'project--32406e4d-a317-44f1-9a40-adff5c8d9619-dev';

export function isRefusedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  try { if (window.self !== window.top) return true; } catch { return true; }
  const host = window.location.hostname.toLowerCase();
  const label = host.split('.')[0];
  if (LOVABLE_PREVIEW_DOMAINS.some((d) => host.endsWith(d)) && (PREVIEW_LABEL.test(label) || label === PROJECT_DEV_LABEL)) return true;
  if (host === DELEGATED_PREVIEW_HOST) return true;
  if (host === 'lovableproject.com' || host.endsWith('.lovableproject.com')) return true;
  if (host === 'lovableproject-dev.com' || host.endsWith('.lovableproject-dev.com')) return true;
  if (host === 'beta.lovable.dev' || host.endsWith('.beta.lovable.dev')) return true;
  if (new URLSearchParams(window.location.search).get('sw') === 'off') return true;
  return false;
}

async function unregisterAppWorkers() {
  if (!('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.filter((r) => (r.active || r.installing || r.waiting)?.scriptURL.endsWith('/sw.js')).map((r) => r.unregister()));
}

export function registerAppServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (isRefusedContext()) { void unregisterAppWorkers(); return; }
  window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js', { scope: '/' }); });
}
