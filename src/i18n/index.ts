import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

const STORAGE_KEY = 'smilecheck-language';

const savedLang = localStorage.getItem(STORAGE_KEY) || 'pt';

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

// Persist language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
