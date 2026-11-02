import { useTranslation } from 'react-i18next';
import { appStoreTarget, playStoreTarget, appleBadgeSrc, playBadgeSrc } from '@/lib/storeLinks';

/** Official store badges (App Store first), clickable. Falls back to the web app until store links exist. */
export function StoreQrCodes() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const items = [
    { href: appStoreTarget(), src: appleBadgeSrc(lang), alt: t('landing.stores.appStoreAlt'), aria: t('landing.stores.appStoreAria') },
    { href: playStoreTarget(), src: playBadgeSrc(lang), alt: t('landing.stores.playAlt'), aria: t('landing.stores.playAria') },
  ];
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center gap-4">
        {items.map((it) => (
          <a
            key={it.src}
            href={it.href}
            aria-label={it.aria}
            className="inline-flex rounded-lg transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <img src={it.src} alt={it.alt} className="h-11 md:h-12 w-auto" draggable={false} />
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t('landing.stores.comingSoonLine')}</p>
    </div>
  );
}
