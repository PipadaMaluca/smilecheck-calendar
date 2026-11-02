/** Store destinations. While null, QR codes and badges open the web app. */
export const APP_STORE_URL: string | null = null;
export const PLAY_STORE_URL: string | null = null;

export const webAppUrl = () =>
  `${typeof window !== 'undefined' ? window.location.origin : ''}/app`;

export const appStoreTarget = () => APP_STORE_URL ?? webAppUrl();
export const playStoreTarget = () => PLAY_STORE_URL ?? webAppUrl();

// Official badges available locally (others fall back to English).
const APPLE_BADGES: Record<string, string> = { en: '/badges/app-store-en-us.svg' };
const PLAY_BADGES: Record<string, string> = {
  en: '/badges/google-play-en.png',
  fr: '/badges/google-play-fr.png',
};

const base = (lang: string) => (lang || 'en').slice(0, 2).toLowerCase();
export const appleBadgeSrc = (lang: string) => APPLE_BADGES[base(lang)] ?? APPLE_BADGES.en;
export const playBadgeSrc = (lang: string) => PLAY_BADGES[base(lang)] ?? PLAY_BADGES.en;
