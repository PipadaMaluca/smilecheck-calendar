import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { OPEN_CONSENT_EVENT, readLocalConsent, saveConsent, syncConsentFromAccount } from '@/lib/consent';

/** First-visit consent banner (landing and app). Decline, Accept and Customise share the same visual weight. */
export function ConsentBanner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(() => readLocalConsent() === null);
  const [custom, setCustom] = useState(false);
  const [statistics, setStatistics] = useState(false);
  const [ads, setAds] = useState(false);

  useEffect(() => {
    if (!user) return;
    void syncConsentFromAccount(user.id).then((d) => {
      if (d) setOpen(false);
      else { const local = readLocalConsent(); if (local) void saveConsent(local, user.id); }
    });
  }, [user]);

  useEffect(() => {
    const h = () => {
      const c = readLocalConsent();
      setStatistics(c?.statistics ?? false); setAds(c?.ads ?? false); setCustom(true); setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, h);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, h);
  }, []);

  if (!open) return null;
  const decide = (choice: { statistics: boolean; ads: boolean }) => { void saveConsent(choice, user?.id); setOpen(false); };

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-0 bottom-0 z-toast p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card text-card-foreground shadow-lg p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <div className="space-y-1">
            <h2 id="consent-title" className="text-base font-semibold">{t('consent.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('consent.body')}</p>
          </div>
        </div>
        {custom && (
          <div className="space-y-2 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm"><span className="font-medium">{t('consent.necessary')}</span><span className="block text-xs text-muted-foreground">{t('consent.necessaryDesc')}</span></span>
              <Switch checked disabled aria-label={t('consent.necessary')} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm"><span className="font-medium">{t('consent.statistics')}</span><span className="block text-xs text-muted-foreground">{t('consent.statisticsDesc')}</span></span>
              <Switch checked={statistics} onCheckedChange={setStatistics} aria-label={t('consent.statistics')} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm"><span className="font-medium">{t('consent.ads')}</span><span className="block text-xs text-muted-foreground">{t('consent.adsDesc')}</span></span>
              <Switch checked={ads} onCheckedChange={setAds} aria-label={t('consent.ads')} />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button variant="outline" className="min-h-11" onClick={() => decide({ statistics: false, ads: false })}>{t('consent.decline')}</Button>
          {custom
            ? <Button variant="outline" className="min-h-11" onClick={() => decide({ statistics, ads })}>{t('consent.save')}</Button>
            : <Button variant="outline" className="min-h-11" onClick={() => setCustom(true)}>{t('consent.customise')}</Button>}
          <Button variant="outline" className="min-h-11" onClick={() => decide({ statistics: true, ads: true })}>{t('consent.accept')}</Button>
        </div>
        <a href="/privacidade#cookies" className="block text-xs text-primary underline">{t('consent.learnMore')}</a>
      </div>
    </div>
  );
}
