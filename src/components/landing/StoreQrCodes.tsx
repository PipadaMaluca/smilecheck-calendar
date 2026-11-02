import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  APP_STORE_URL, PLAY_STORE_URL, appStoreTarget, playStoreTarget, appleBadgeSrc, playBadgeSrc,
} from '@/lib/storeLinks';

export function StoreQrCodes() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const lang = i18n.language;

  const stores = [
    { key: 'apple', url: appStoreTarget(), soon: !APP_STORE_URL, badge: appleBadgeSrc(lang),
      alt: t('landing.stores.appStoreAlt'), label: t('landing.stores.appStoreAria') },
    { key: 'play', url: playStoreTarget(), soon: !PLAY_STORE_URL, badge: playBadgeSrc(lang),
      alt: t('landing.stores.playAlt'), label: t('landing.stores.playAria') },
  ];

  return (
    <div className="flex justify-center gap-3 md:gap-4">
      {stores.map((s) => (
        <div key={s.key} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 md:p-4">
          {!isMobile && (
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG value={s.url} size={128} level="M" bgColor="#FFFFFF" fgColor="#000000" />
            </div>
          )}
          {s.soon && (
            <span className="text-xs font-medium text-muted-foreground">{t('landing.stores.soon')}</span>
          )}
          <a
            href={s.url}
            target={s.soon ? undefined : '_blank'}
            rel="noopener noreferrer"
            aria-label={s.label}
            className="flex min-h-11 items-center"
          >
            <img src={s.badge} alt={s.alt} className="h-11 w-auto" />
          </a>
        </div>
      ))}
    </div>
  );
}
