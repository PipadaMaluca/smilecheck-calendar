import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Share, SquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => { deferred = null; listeners.forEach((l) => l()); });
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;

/** "Instalar a app": native prompt on Android/desktop; step-by-step hint on iOS. */
export function InstallAppButton() {
  const { t } = useTranslation();
  const [, force] = useState(0);
  const [showIos, setShowIos] = useState(false);
  useEffect(() => { const l = () => force((n) => n + 1); listeners.add(l); return () => { listeners.delete(l); }; }, []);

  if (isStandalone()) return <p className="text-sm text-muted-foreground">{t('pwa.installed')}</p>;

  if (isIos()) {
    return (
      <div className="space-y-2">
        <Button variant="outline" className="min-h-11" onClick={() => setShowIos((v) => !v)} aria-expanded={showIos}>
          <Download className="w-4 h-4 mr-2" aria-hidden />{t('pwa.install')}
        </Button>
        {showIos && (
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-5">
            <li className="flex-inline">{t('pwa.iosStep1')} <Share className="inline w-4 h-4 align-text-bottom" aria-hidden /></li>
            <li>{t('pwa.iosStep2')} <SquarePlus className="inline w-4 h-4 align-text-bottom" aria-hidden /></li>
          </ol>
        )}
      </div>
    );
  }

  if (!deferred) return <p className="text-sm text-muted-foreground">{t('pwa.unavailable')}</p>;
  return (
    <Button variant="outline" className="min-h-11" onClick={async () => { const d = deferred; if (!d) return; await d.prompt(); await d.userChoice; deferred = null; force((n) => n + 1); }}>
      <Download className="w-4 h-4 mr-2" aria-hidden />{t('pwa.install')}
    </Button>
  );
}
