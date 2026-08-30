import i18n from '@/i18n';

/**
 * Locale-aware formatting helpers.
 *
 * Always derive the active locale from i18next so a single source of truth
 * (the language switcher) drives every date/number/currency rendering in
 * the app. Use these in any new code; migrate existing hot paths gradually.
 */

const LOCALE_MAP: Record<string, string> = {
  pt: 'pt-PT',
  fr: 'fr-FR',
  en: 'en-GB', // EU English: 31/01/2026 ordering, comma-decimal-free numbers
};

export function getActiveLocale(): string {
  const lng = (i18n.language || 'pt').slice(0, 2);
  return LOCALE_MAP[lng] || LOCALE_MAP.pt;
}

/** Long form: "31 de Janeiro de 2026" / "31 janvier 2026" / "January 31, 2026" */
export function formatDate(
  d: Date | string | number,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
): string {
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat(getActiveLocale(), opts).format(date);
}

/** Time, e.g. "14:30" */
export function formatTime(d: Date | string | number): string {
  return formatDate(d, { hour: '2-digit', minute: '2-digit' });
}


/** Number with locale grouping: 1.247 (PT) / 1 247 (FR) / 1,247 (EN) */
export function formatNumber(n: number, opts: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(getActiveLocale(), opts).format(n);
}
