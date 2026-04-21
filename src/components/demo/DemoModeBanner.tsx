import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const STORAGE_KEY = 'demoBannerDismissed';

export function DemoModeBanner() {
  const { t } = useTranslation();
  const location = useLocation();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  });

  const params = new URLSearchParams(location.search);
  const isDemo = params.get('demo') === 'true';

  // Expose banner height as CSS var so layouts can offset if needed
  useEffect(() => {
    const visible = isDemo && !dismissed;
    document.documentElement.style.setProperty('--demo-banner-height', visible ? '28px' : '0px');
    return () => {
      document.documentElement.style.setProperty('--demo-banner-height', '0px');
    };
  }, [isDemo, dismissed]);

  if (!isDemo || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full flex items-center justify-center relative px-10"
      style={{ height: 28, backgroundColor: '#1565C0' }}
    >
      <span className="text-white text-[12px] font-medium truncate text-center">
        {t('demoBanner.label')}
      </span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t('demoBanner.dismiss')}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/90 hover:text-white p-1 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}