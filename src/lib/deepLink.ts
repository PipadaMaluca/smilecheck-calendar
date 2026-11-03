/**
 * One-shot "deep link" handed from a notification (or any shortcut) to the
 * screen it opens: e.g. Health › Prescriptions, a specific conversation, an
 * achievement to highlight. The receiving screen consumes it once on mount.
 */
export interface DeepLink {
  tab: string;
  section?: string;
  appointmentId?: string;
  date?: string;
  conversationId?: string;
  achievementKey?: string;
  patientId?: string;
  conversationName?: string;
}

let pending: DeepLink | null = null;

export function setPendingDeepLink(link: DeepLink | null) {
  pending = link;
  if (link && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('smilecheck:deeplink', { detail: link }));
  }
}

/** Returns and clears the pending link when it targets `tab`. */
export function consumeDeepLink(tab: string): DeepLink | null {
  if (!pending || pending.tab !== tab) return null;
  const link = pending;
  pending = null;
  return link;
}

/** Scroll an element into view and flash a highlight ring once. */
export function revealElement(id: string) {
  if (typeof document === 'undefined') return;
  const run = () => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('deeplink-highlight');
    window.setTimeout(() => el.classList.remove('deeplink-highlight'), 2400);
    return true;
  };
  let tries = 0;
  const tick = () => {
    if (run() || ++tries > 20) return;
    window.setTimeout(tick, 100);
  };
  window.setTimeout(tick, 50);
}

/** Open Conversations on the thread with `name` (creates a draft thread when new). */
export function openChatWith(name: string) {
  setPendingDeepLink({ tab: 'conversas', conversationName: name });
  window.dispatchEvent(new CustomEvent('smilecheck:navigate', { detail: 'conversas' }));
  window.setTimeout(() => window.dispatchEvent(new CustomEvent('smilecheck:open-chat', { detail: name })), 150);
}

/** Generic shell navigation from deep inside a screen. */
export function navigateApp(tab: string) {
  window.dispatchEvent(new CustomEvent('smilecheck:navigate', { detail: tab }));
}
