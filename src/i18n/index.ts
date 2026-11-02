import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

const STORAGE_KEY = 'smilecheck-language';

export const LANGUAGE_CHOSEN_KEY = 'smilecheck-language-chosen';
const SUPPORTED = ['pt', 'fr', 'en'] as const;

/** Browser language (pt/fr/en) used until the user picks one explicitly. */
export function detectBrowserLanguage(): string {
  const list = typeof navigator !== 'undefined' ? [...(navigator.languages || []), navigator.language] : [];
  for (const l of list) {
    const base = (l || '').slice(0, 2).toLowerCase();
    if ((SUPPORTED as readonly string[]).includes(base)) return base;
  }
  return 'pt';
}

/** BCP-47 tag for <html lang> and Intl formatting. */
export const HTML_LANG: Record<string, string> = { pt: 'pt-PT', fr: 'fr-FR', en: 'en-GB' };

const savedLang = localStorage.getItem(STORAGE_KEY) || detectBrowserLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      fr: { translation: fr },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'fr', 'en'],
    interpolation: { escapeValue: false },
  });

// Every {{count}} is printed with the active locale's grouping ("1 850 pontos").
i18n.services.formatter?.add('number', (value, lng) =>
  new Intl.NumberFormat(HTML_LANG[(lng || 'pt').slice(0, 2)] || 'pt-PT', { useGrouping: 'always' } as unknown as Intl.NumberFormatOptions).format(Number(value)),
);

// Persist language changes
const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = HTML_LANG[lng] || 'pt-PT';
};
syncHtmlLang(savedLang);
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  syncHtmlLang(lng);
});

export default i18n;
