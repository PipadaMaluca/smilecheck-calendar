import { adsArePersonalised, readLocalConsent } from '@/lib/consent';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clapperboard, Gift, ShieldCheck, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_CURRENT_PLAN } from '@/lib/planRules';
import {
  ADS_FOR_REWARD, ADS_VIDEOS_FOR_BREAK, EMPTY_AD_STATE, demoAdStep, fetchAdState, recordAdView, type AdState,
} from '@/data/adsSource';
import { formatTime } from '@/lib/formatters';

/** Demo placeholder length; real ads are capped at 30 s (AD_MAX_SECONDS). */
const DEMO_AD_SECONDS = 3;

export function useAdsPlan() {
  const { user, profile, role } = useAuth();
  const plan = user ? profile?.plan ?? 'free' : DEMO_CURRENT_PLAN[role as 'patient' | 'dentist' | 'clinic'] ?? 'free';
  return { plan, isFree: plan === 'free', isReal: !!user, userId: user?.id };
}

function useCountdown(until: string | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!until) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [until]);
  const left = until ? new Date(until).getTime() - now : 0;
  return left > 0 ? left : 0;
}

const hms = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** "Remover anúncios" (5 videos → 8 h) and "Ganhar pontos" (10 ads → 2 reward points, once a day). Free plans only. */
export function AdsPanel() {
  const { t } = useTranslation();
  const { isFree, isReal, userId } = useAdsPlan();
  const [state, setState] = useState<AdState>(EMPTY_AD_STATE);
  const [playing, setPlaying] = useState<null | 'video' | 'ad'>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const left = useCountdown(state.adFreeUntil);

  useEffect(() => {
    if (isReal && userId && isFree) fetchAdState(userId).then(setState).catch(() => {});
  }, [isReal, userId, isFree]);

  useEffect(() => {
    if (!playing) return;
    setSecondsLeft(DEMO_AD_SECONDS);
    const id = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (!playing || secondsLeft > 0) return;
    const kind = playing;
    setPlaying(null);
    const apply = (r: AdState & { pointsAwarded: boolean }) => {
      setState(r);
      if (r.pointsAwarded) toast.success(t('ads.pointsAwarded', { count: 2 }));
      else if (kind === 'ad' && r.adsSeen === 0 && !r.phoneVerified) toast.info(t('ads.phoneRequired'));
      if (kind === 'video' && r.adFreeUntil && r.videosWatched === 0) toast.success(t('ads.adFreeStarted'));
    };
    if (isReal) recordAdView(kind).then(apply).catch((e) => toast.error(String(e?.message).includes('daily_limit') ? t('ads.dailyLimit') : t('ads.error')));
    else apply(demoAdStep(state, kind));
  }, [secondsLeft, playing, isReal, state, t]);

  if (!isFree) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center gap-3 py-4">
          <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
          <p className="text-sm text-foreground">{t('ads.noAdsOnPlan')}</p>
        </CardContent>
      </Card>
    );
  }

  const adFree = left > 0;
  return (
    <Card className="border-border">
      <CardHeader className="pb-2"><CardTitle size="compact">{t('ads.title')}</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-border p-3">
          <div className="flex items-center gap-2 text-sm font-medium"><Clapperboard className="h-4 w-4 text-primary" aria-hidden="true" />{t('ads.removeTitle')}</div>
          <p className="text-xs text-muted-foreground">{t('ads.removeDesc')}</p>
          {adFree ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-success tabular-nums" role="timer" aria-live="off">
              <Timer className="h-4 w-4" aria-hidden="true" />{t('ads.adFreeLeft', { time: hms(left) })}
            </p>
          ) : (
            <>
              <Progress value={(state.videosWatched / ADS_VIDEOS_FOR_BREAK) * 100} aria-label={t('ads.removeTitle')} />
              <Button className="w-full min-h-11" onClick={() => setPlaying('video')} disabled={!!playing}>
                {t('ads.removeCta', { n: state.videosWatched, total: ADS_VIDEOS_FOR_BREAK })}
              </Button>
            </>
          )}
          {adFree && state.adFreeUntil && <p className="text-2xs text-muted-foreground">{t('ads.until', { time: formatTime(state.adFreeUntil) })}</p>}
        </div>

        <div className="space-y-2 rounded-xl border border-border p-3">
          <div className="flex items-center gap-2 text-sm font-medium"><Gift className="h-4 w-4 text-primary" aria-hidden="true" />{t('ads.earnTitle')}</div>
          <p className="text-xs text-muted-foreground">{t('ads.earnDesc')}</p>
          {state.rewardedToday ? (
            <p className="text-sm font-medium text-success">{t('ads.dailyLimit')}</p>
          ) : (
            <>
              <Progress value={(state.adsSeen / ADS_FOR_REWARD) * 100} aria-label={t('ads.earnTitle')} />
              <Button variant="outline" className="w-full min-h-11" onClick={() => setPlaying('ad')} disabled={!!playing}>
                {t('ads.earnCta', { n: state.adsSeen, total: ADS_FOR_REWARD })}
              </Button>
            </>
          )}
        </div>
        <p className="text-2xs text-muted-foreground md:col-span-2">{t('ads.privacyNote')} {t(adsArePersonalised(readLocalConsent()) ? 'ads.personalised' : 'ads.nonPersonalised')}</p>
      </CardContent>

      <Dialog open={!!playing} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t('ads.playingTitle')}</DialogTitle>
            <DialogDescription>{t('ads.playingDesc')}</DialogDescription>
          </DialogHeader>
          <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-3xl font-bold tabular-nums text-muted-foreground" aria-live="polite">
            {Math.max(secondsLeft, 0)}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/** Discreet banner for Free plans. Never render on clinical screens (dossier, teleconsultation, triage, prescriptions). */
export function AdBanner() {
  const { t } = useTranslation();
  const { isFree } = useAdsPlan();
  if (!isFree) return null;
  return (
    <aside aria-label={t('ads.bannerLabel')} className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground">
      {t('ads.bannerPlaceholder')}
    </aside>
  );
}
