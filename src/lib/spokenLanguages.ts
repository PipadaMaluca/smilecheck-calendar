import { getActiveLocale } from '@/lib/formatters';

/** Closed list of spoken languages (ISO 639-1). Mirrors the server check in `validate_search_fields`. */
export const SPOKEN_LANGUAGES = ['pt', 'fr', 'en', 'es', 'it', 'de', 'ar', 'nl', 'ro', 'pl', 'ru', 'uk', 'zh', 'tr'] as const;
export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number];

const PRIORITY: readonly string[] = ['pt', 'fr', 'en'];

/** Fallback names (English endonym-free) when Intl.DisplayNames is unavailable. */
const FALLBACK: Record<SpokenLanguage, string> = {
  pt: 'Português', fr: 'Français', en: 'English', es: 'Español', it: 'Italiano', de: 'Deutsch',
  ar: 'العربية', nl: 'Nederlands', ro: 'Română', pl: 'Polski', ru: 'Русский', uk: 'Українська',
  zh: '中文', tr: 'Türkçe',
};

export function isSpokenLanguage(code: string): code is SpokenLanguage {
  return (SPOKEN_LANGUAGES as readonly string[]).includes(code);
}

/** Language name in the app's active language ("inglês" / "anglais" / "English"), first letter capitalised. */
export function spokenLanguageName(code: SpokenLanguage, locale = getActiveLocale()): string {
  try {
    const name = new Intl.DisplayNames([locale], { type: 'language' }).of(code);
    if (name && name !== code) return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
  } catch { /* fall through */ }
  return FALLBACK[code];
}

/** PT/FR/EN first, then the rest alphabetically in the app's language. */
export function sortedSpokenLanguages(locale = getActiveLocale()): { code: SpokenLanguage; name: string }[] {
  const all = SPOKEN_LANGUAGES.map(code => ({ code, name: spokenLanguageName(code, locale) }));
  const head = PRIORITY.map(c => all.find(l => l.code === c)!);
  const rest = all.filter(l => !PRIORITY.includes(l.code)).sort((a, b) => a.name.localeCompare(b.name, locale));
  return [...head, ...rest];
}
