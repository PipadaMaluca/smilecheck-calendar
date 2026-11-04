/** Landing in-page navigation: smooth scroll with fixed-header offset, then focus the section title. */
export const PRICING_TAB_EVENT = 'landing:pricing-tab';
export type PricingTab = 'patient' | 'dentist' | 'clinic';

export function scrollToLandingSection(sectionId: string, titleId?: string) {
  const target = document.getElementById(titleId ?? sectionId) ?? document.getElementById(sectionId);
  if (!target) return;
  const header = document.querySelector('header, nav[data-landing-nav]') as HTMLElement | null;
  const offset = (header?.getBoundingClientRect().height ?? 72) + 16;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  history.replaceState(null, '', `#${sectionId}`);
}

export function selectPricingTab(tab: PricingTab) {
  window.dispatchEvent(new CustomEvent<PricingTab>(PRICING_TAB_EVENT, { detail: tab }));
}
