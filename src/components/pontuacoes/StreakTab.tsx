import { demoText } from '@/lib/demoText';
import { getActiveLocale } from '@/lib/formatters';
import { useState, useEffect } from 'react';
import { Glyph } from '@/components/ui/glyph';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Flame } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { MOCK_STREAK_HISTORY, getCheckinDays } from '@/data/pointsData';
import { usePointsData } from '@/data/pointsSource';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatNumber } from '@/lib/formatters';

/** Time left until the next UTC day (the server awards one check-in per UTC day). */
export function untilNextUtcDay(now = new Date()) {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const left = Math.max(0, Math.floor((next - now.getTime()) / 1000));
  return { hours: Math.floor(left / 3600), minutes: Math.floor((left % 3600) / 60), seconds: left % 60 };
}

interface StreakTabProps {
  userRole: UserRole;
}


export function StreakTab({ userRole }: StreakTabProps) {
  const data = usePointsData(userRole);
  const real = !data.isDemo;
  const { user, role: authRole } = useAuth();
  const streakHistory = real ? [] : MOCK_STREAK_HISTORY[userRole];
  const demoCheckinDays = getCheckinDays(userRole);
  const [calendarMonth, setCalendarMonth] = useState(0);
  const [countdown, setCountdown] = useState(() => (real ? untilNextUtcDay() : { hours: 14, minutes: 32, seconds: 45 }));
  const { t } = useTranslation();
  // Real accounts: own check-in days and reward values from the server rules (never hardcoded).
  const [realCheckins, setRealCheckins] = useState<Set<string>>(new Set());
  const [rules, setRules] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!real || !user) return;
    let alive = true;
    void Promise.all([
      supabase.from('daily_checkins').select('checkin_date').eq('profile_id', user.id).order('checkin_date', { ascending: false }).limit(400),
      supabase.from('points_rules').select('action_key, points').eq('role', authRole ?? userRole).in('action_key', ['checkin_diario', 'streak_7', 'streak_30']),
    ]).then(([c, r]) => {
      if (!alive) return;
      setRealCheckins(new Set((c.data ?? []).map((x) => x.checkin_date)));
      setRules(Object.fromEntries((r.data ?? []).map((x) => [x.action_key, x.points])));
    });
    return () => { alive = false; };
  }, [real, user, authRole, userRole]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (real) { setCountdown(untilNextUtcDay()); return; }
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [real]);

  // Calendar rendering
  const nowD = new Date();
  const baseY = real ? nowD.getFullYear() : 2026; const baseM = real ? nowD.getMonth() : 0;
  const monthDate = new Date(baseY, baseM + calendarMonth, 1);
  const monthName = monthDate.toLocaleDateString(getActiveLocale(), { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (monthDate.getDay() + 6) % 7; // Monday = 0
  const todayDay = calendarMonth === 0 ? (real ? nowD.getDate() : 31) : -1;
  const pad = (n: number) => String(n).padStart(2, '0');
  const hasCheckinOn = (day: number) => real
    ? realCheckins.has(`${monthDate.getFullYear()}-${pad(monthDate.getMonth() + 1)}-${pad(day)}`)
    : calendarMonth === 0 && demoCheckinDays.includes(day);
  const ruleLabel = (key: string, demo: string, perDay = false) => {
    if (!real) return demo;
    const v = rules[key];
    if (v === undefined) return '—';
    return perDay ? t('streakReal.perDay', { points: formatNumber(v) }) : t('streakReal.points', { points: formatNumber(v) });
  };

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="space-y-6">
      {/* Current Streak */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-5 text-center space-y-3">
          <Glyph emoji="🔥" className="w-14 h-14" />
          <p className="text-4xl font-bold text-foreground">{t('scores.days', { count: data.streak })}</p>
          <p className="text-sm text-muted-foreground">{t('scores.bestStreak')}: {t('scores.days', { count: data.bestStreak })}</p>
          <p className="text-xs text-warning">{t('scores.resetAt')}</p>
        </CardContent>
      </Card>

      {/* Daily Rewards */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground">{t('scores.dailyRewards')}</h3>
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">{t('scores.nextRewardIn')}</p>
            <p className="text-lg font-bold font-mono text-primary">
              {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t('scores.openDaily')}</p>
          </div>
          <div className="space-y-2">
            {[
              { icon: '📅', label: t('scores.dailyCheckin'), reward: ruleLabel('checkin_diario', '+1 pt/day', true) },
              { icon: '🔥', label: t('scores.streak7days'), reward: ruleLabel('streak_7', '+5 pts') },
              { icon: '🏆', label: t('scores.streak30days'), reward: ruleLabel('streak_30', '+15 pts') },
            ].map((tier, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Glyph emoji={tier.icon} className="w-5 h-5" />
                  <span className="text-xs font-medium text-foreground">{tier.label}</span>
                </div>
                <span className="text-xs font-bold text-primary">{tier.reward}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Button aria-label={t('a11y.previous')} variant="ghost" size="icon-sm" onClick={() => setCalendarMonth(m => m - 1)} disabled={calendarMonth <= -6}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-sm font-bold text-foreground sentence-case">{monthName}</h3>
            <Button aria-label={t('a11y.next')} variant="ghost" size="icon-sm" onClick={() => setCalendarMonth(m => m + 1)} disabled={calendarMonth >= 0}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {(t('scores.weekDays', { returnObjects: true }) as string[]).map((d: string) => (
              <span key={d} className="text-2xs font-semibold text-muted-foreground py-1">{d}</span>
            ))}
            {calendarCells.map((day, i) => {
              if (day === null) return <span key={`empty-${i}`} />;
              const hasCheckin = hasCheckinOn(day);
              const isToday = day === todayDay;
              const isPast = calendarMonth === 0 ? day < (real ? nowD.getDate() : 31) : true;
              const missed = isPast && !hasCheckin;
              return (
                <div
                  key={i}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mx-auto',
                    isToday && 'ring-2 ring-primary',
                    hasCheckin && 'bg-emerald-500/20 text-success',
                    missed && isPast && 'text-muted-foreground/40'
                  )}
                >
                  {hasCheckin ? <Check className="w-4 h-4" /> : day}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Streak History (demo only: the server keeps no per-streak history yet) */}
      {!real && <Card className="bg-card/80 border-border">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground">{t('scores.streakHistory')}</h3>
          <div className="space-y-2">
            {streakHistory.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {s.isCurrent && <Flame className="w-3.5 h-3.5 inline mr-1 text-warning" />}{demoText(s.label)}: {t('scores.days', { count: s.days })}
                  </p>
                  <p className="text-2xs text-muted-foreground">{demoText(s.startDate)} — {demoText(s.endDate)}</p>
                </div>
                {s.isCurrent && <Badge className="bg-primary/20 text-primary border-primary/30 text-2xs">{t('scores.active')}</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>}
    </div>
  );
}
