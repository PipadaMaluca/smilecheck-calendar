import { supabase } from '@/integrations/supabase/client';

/** GDPR consent. Necessary cookies are always on; statistics and ads are off until the person opts in. */
export interface ConsentChoice { statistics: boolean; ads: boolean; decidedAt: string }

const KEY = 'sc:consent';
const EVENT = 'sc:consent-changed';

export const DEFAULT_CONSENT = { statistics: false, ads: false } as const;

export function readLocalConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return { statistics: v.statistics === true, ads: v.ads === true, decidedAt: String(v.decidedAt ?? '') };
  } catch { return null; }
}

/** Saves locally (always) and to the account when signed in. */
export async function saveConsent(choice: { statistics: boolean; ads: boolean }, userId?: string | null) {
  const value: ConsentChoice = { ...choice, decidedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
  if (userId) {
    await supabase.from('consent_preferences').upsert({ profile_id: userId, statistics: choice.statistics, ads: choice.ads, decided_at: value.decidedAt });
  }
  return value;
}

/** Loads the account choice into local storage after sign-in. */
export async function syncConsentFromAccount(userId: string) {
  const { data } = await supabase.from('consent_preferences').select('statistics, ads, decided_at').eq('profile_id', userId).maybeSingle();
  if (data) {
    const value: ConsentChoice = { statistics: data.statistics, ads: data.ads, decidedAt: data.decided_at };
    localStorage.setItem(KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
  }
  return data;
}

export function onConsentChange(cb: (c: ConsentChoice) => void) {
  const h = (e: Event) => cb((e as CustomEvent<ConsentChoice>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

/** Free-plan ads may only be personalised with explicit consent; never with health data. */
export const adsArePersonalised = (c: ConsentChoice | null) => c?.ads === true;

export const OPEN_CONSENT_EVENT = 'sc:open-consent';
