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

/** Short numeric date: "31/01/2026" */
export function formatDateShort(d: Date | string | number): string {
  return formatDate(d, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Day of week, e.g. "Segunda-feira" / "Lundi" / "Monday" */
export function formatWeekday(d: Date | string | number, style: 'long' | 'short' = 'long'): string {
  return formatDate(d, { weekday: style });
}

/** Time, e.g. "14:30" */
export function formatTime(d: Date | string | number): string {
  return formatDate(d, { hour: '2-digit', minute: '2-digit' });
}

/** Number with locale grouping: 1.247 (PT) / 1 247 (FR) / 1,247 (EN) */
export function formatNumber(n: number, opts: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(getActiveLocale(), opts).format(n);
}

/** Currency in EUR: €20,00 (PT) / 20,00 € (FR) / €20.00 (EN) */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat(getActiveLocale(), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Relative time using the t() helper for compact "5 min ago" style strings */
export function formatRelativeTime(date: Date | string | number): string {
  const target = date instanceof Date ? date : new Date(date);
  const diffMs = Date.now() - target.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const diffH = Math.round(diffMs / 3600000);
  const diffD = Math.round(diffMs / 86400000);
  const t = i18n.t.bind(i18n);
  if (diffMin < 60) return t('common.minAgo', { n: Math.max(1, diffMin) });
  if (diffH < 24) return t('common.hoursAgo', { n: diffH });
  return t('common.daysAgo', { n: diffD });
}