import { useTranslation } from 'react-i18next';
import { Trophy, Flag, Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/formatters';
import { useMyRanking, type RankScope } from '@/data/clinicalDocs';
import { cn } from '@/lib/utils';

function Change({ change }: { change: number }) {
  if (change > 0) return <span className="flex items-center gap-1 text-success text-xs font-medium"><TrendingUp className="w-3.5 h-3.5" /> +{formatNumber(change)}</span>;
  if (change < 0) return <span className="flex items-center gap-1 text-destructive text-xs font-medium"><TrendingDown className="w-3.5 h-3.5" /> {formatNumber(change)}</span>;
  return <span className="flex items-center gap-1 text-muted-foreground text-xs"><Minus className="w-3.5 h-3.5" /> =</span>;
}

/** Private ranking (real accounts): own position, total and 7-day change, computed on the server; no other names. */
export function RealRankings({ inline }: { inline?: boolean }) {
  const { t } = useTranslation();
  const { data, loading, error } = useMyRanking(true);
  const cards: { key: string; title: string; icon: JSX.Element; s: RankScope }[] = [];
  if (data) {
    cards.push({ key: 'g', title: t('sweep.rankings.global'), icon: <Trophy className="w-5 h-5 text-primary" />, s: data.global });
    if (data.national) cards.push({ key: 'n', title: t('sweep.rankings.national'), icon: <Flag className="w-5 h-5 text-primary" />, s: data.national });
    for (const c of data.clinics ?? []) cards.push({ key: c.id, title: c.name, icon: <Building2 className="w-5 h-5 text-primary" />, s: c });
  }
  return (
    <div className={cn(inline ? 'space-y-6' : 'p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-32')} data-testid="real-rankings">
      {!inline && (
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('sweep.rankings.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('sweep.rankings.subtitle')}</p>
        </div>
      )}
      {loading ? <Skeleton className="h-28 w-full" /> : error || !data ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t('rankReal.error')}</p>
      ) : (<>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          {cards.map((c) => (
            <Card key={c.key} className="bg-card/80 border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">{c.icon}</div>
                  <Change change={c.s.change} />
                </div>
                <p className="text-xl font-bold text-foreground">#{formatNumber(c.s.position)}</p>
                <p className="text-2xs text-muted-foreground">{t('sweep.rankings.of', { total: formatNumber(c.s.total) })}</p>
                <p className="text-xs font-medium text-foreground mt-1 truncate">{c.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-foreground">{t('rankReal.yourXp', { xp: formatNumber(data.xp) })}</p>
        <p className="text-xs text-muted-foreground">{t('rankReal.changeNote')}</p>
        <p className="text-xs text-muted-foreground">{t('rankings.privateNote')}</p>
      </>)}
    </div>
  );
}
