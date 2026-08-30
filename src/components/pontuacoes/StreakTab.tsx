import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { USER_POINTS, MOCK_STREAK_HISTORY, getCheckinDays } from '@/data/pointsData';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface StreakTabProps {
  userRole: UserRole;
}

const DEMO_DATE = new Date(2026, 0, 31);

export function StreakTab({ userRole }: StreakTabProps) {
  const data = USER_POINTS[userRole];
  const streakHistory = MOCK_STREAK_HISTORY[userRole];
  const checkinDays = getCheckinDays(userRole);
  const [calendarMonth, setCalendarMonth] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 32, seconds: 45 });
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
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
  }, []);

  // Calendar rendering
  const monthDate = new Date(2026, calendarMonth, 1);
  const monthName = monthDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(2026, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = (monthDate.getDay() + 6) % 7; // Monday = 0
  const todayDay = calendarMonth === 0 ? 31 : -1;

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="space-y-6">
      {/* Current Streak */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-5 text-center space-y-3">
          <span className="text-6xl">🔥</span>
          <p className="text-4xl font-bold text-foreground">{data.streak} {t('scores.days')}</p>
          <p className="text-sm text-muted-foreground">{t('scores.bestStreak')}: {data.bestStreak} {t('scores.days')}</p>
          <p className="text-xs text-amber-400">{t('scores.resetAt')}</p>
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
            <p className="text-xs text-muted-foreground mt-1">{t('scores.openDaily')} 📅</p>
          </div>
          <div className="space-y-2">
            {[
              { icon: '📅', label: t('scores.dailyCheckin'), reward: '+1 pt/day' },
              { icon: '🔥', label: t('scores.streak7days'), reward: '+5 pts' },
              { icon: '🏆', label: t('scores.streak30days'), reward: '+15 pts' },
            ].map((tier, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tier.icon}</span>
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
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(m => m - 1)} disabled={calendarMonth <= -6}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-sm font-bold text-foreground capitalize">{monthName}</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(m => m + 1)} disabled={calendarMonth >= 0}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {(t('scores.weekDays', { returnObjects: true }) as string[]).map((d: string) => (
              <span key={d} className="text-[11px] font-semibold text-muted-foreground py-1">{d}</span>
            ))}
            {calendarCells.map((day, i) => {
              if (day === null) return <span key={`empty-${i}`} />;
              const hasCheckin = calendarMonth === 0 && checkinDays.includes(day);
              const isToday = day === todayDay;
              const isPast = calendarMonth === 0 ? day < 31 : true;
              const missed = isPast && !hasCheckin && day <= 31;
              return (
                <div
                  key={i}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mx-auto',
                    isToday && 'ring-2 ring-primary',
                    hasCheckin && 'bg-emerald-500/20 text-emerald-400',
                    missed && isPast && 'text-muted-foreground/40'
                  )}
                >
                  {hasCheckin ? '✅' : day}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Streak History */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground">{t('scores.streakHistory')}</h3>
          <div className="space-y-2">
            {streakHistory.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {s.isCurrent && '🔥 '}{s.label}: {s.days} {t('scores.days')}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{s.startDate} — {s.endDate}</p>
                </div>
                {s.isCurrent && <Badge className="bg-primary/20 text-primary border-primary/30 text-[11px]">{t('scores.active')}</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
