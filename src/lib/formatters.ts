import { getDateFnsLocale } from '@/lib/formatters';
import i18n from '@/i18n';
import type { Locale } from 'date-fns';
import { pt, fr, enGB } from 'date-fns/locale';

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


/** Number with locale grouping, also for 4 digits: "1 850" (PT/FR) / "1,850" (EN). */
export function formatNumber(n: number, opts: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(getActiveLocale(), { useGrouping: 'always', ...opts } as Intl.NumberFormatOptions).format(n);
}

/**
 * Euro amount in the active language: "24,99 €" (PT/FR) / "€24.99" (EN).
 * Whole amounts drop the decimals ("20 €") unless `decimals` forces them.
 */
export function formatCurrency(value: number, opts: { decimals?: boolean } = {}): string {
  const v = Number(value) || 0;
  const whole = Number.isInteger(v) && !opts.decimals;
  return new Intl.NumberFormat(getActiveLocale(), {
    style: 'currency',
    currency: 'EUR',
    useGrouping: 'always',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  } as Intl.NumberFormatOptions).format(v);
}

const DATE_FNS_LOCALES: Record<string, Locale> = { pt, fr, en: enGB };

/** date-fns locale for the active language — never hardcode `locale: getDateFnsLocale()`. */
export function getDateFnsLocale(): Locale {
  return DATE_FNS_LOCALES[(i18n.language || 'pt').slice(0, 2)] || pt;
}

/** Capitalises only the first letter of a sentence ("sábado, 31 de janeiro" → "Sábado, 31 de janeiro"). */
export function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
