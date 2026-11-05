import { formatNumber } from '@/lib/formatters';
import { useState } from 'react';
import { Glyph } from '@/components/ui/glyph';
import { Trophy, TrendingUp, TrendingDown, Minus, Flag, Building2, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockClinics } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useDirectory } from '@/data/directorySource';
import { RealRankings } from './RealRankings';

interface RankingsViewProps {
  userRole: UserRole;
  inline?: boolean;
}

type RankingView = 'global' | 'national' | string; // string for clinic names

const dentistRankings = {
  global: { position: 42, total: 1250, trend: 'up' as const, change: 3 },
  national: { position: 8, total: 320, trend: 'up' as const, change: 2 },
  clinics: [
    { id: 'clinic-smilecheck', name: 'Clínica SmileCheck', position: 1, total: 3, trend: 'same' as const, change: 0 },
    { id: 'clinic-mitry', name: 'Clínica Mitry-Mory', position: 2, total: 3, trend: 'up' as const, change: 1 },
    { id: 'clinic-montfermeil', name: 'Clínica Montfermeil', position: 1, total: 3, trend: 'same' as const, change: 0 },
  ],
};

const clinicRankings = {
  global: { position: 15, total: 450, trend: 'up' as const, change: 5 },
  national: { position: 3, total: 85, trend: 'up' as const, change: 1 },
};

function TrendIcon({ trend, change }: { trend: 'up' | 'down' | 'same'; change: number }) {
  if (trend === 'up') return (
    <span className="flex items-center gap-1 text-success text-xs font-medium">
      <TrendingUp className="w-3.5 h-3.5" /> +{change}
    </span>
  );
  if (trend === 'down') return (
    <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
      <TrendingDown className="w-3.5 h-3.5" /> -{change}
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-muted-foreground text-xs">
      <Minus className="w-3.5 h-3.5" /> =
    </span>
  );
}

function MedalEmoji({ position }: { position: number }) {
  if (position === 1) return <Glyph emoji="🥇" className="w-5 h-5" />;
  if (position === 2) return <Glyph emoji="🥈" className="w-5 h-5" />;
  if (position === 3) return <Glyph emoji="🥉" className="w-5 h-5" />;
  return <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{position}</span>;
}

/** Demo: mock cards. Real: private server ranking for professionals; patients never see professional rankings. */
export function RankingsView(props: RankingsViewProps) {
  const { isDemo } = useDirectory();
  if (props.userRole === 'patient') return null;
  if (!isDemo) {
    if (props.inline) return <RealRankings inline />;
    return <ScrollArea className="flex-1"><RealRankings /></ScrollArea>;
  }
  return <DemoRankingsView {...props} />;
}

function DemoRankingsView({ userRole, inline }: RankingsViewProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [selectedView, setSelectedView] = useState<RankingView>('national');

  const isClinic = userRole === 'clinic';
  const rankings = isClinic ? clinicRankings : dentistRankings;

  // Build card list
  const cards: { id: RankingView; title: string; icon: React.ReactNode; position: number; total: number; trend: 'up' | 'down' | 'same'; change: number }[] = [
    { id: 'global', title: t('sweep.rankings.global'), icon: <Trophy className="w-5 h-5 text-primary" />, ...rankings.global },
    { id: 'national', title: t('sweep.rankings.national'), icon: <Flag className="w-5 h-5 text-primary" />, ...rankings.national },
  ];
  if (!isClinic) {
    dentistRankings.clinics.forEach(c => {
      cards.push({ id: c.id, title: c.name, icon: <Building2 className="w-5 h-5 text-primary" />, position: c.position, total: c.total, trend: c.trend, change: c.change });
    });
  }

  // Rankings stay private: each professional sees only their own position and score, never other names.
  const currentUserXP = 7800;
  const selectedCard = cards.find(c => c.id === selectedView) ?? cards[1];

  const content = (
    <div className={cn(inline ? 'space-y-6' : 'p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-32')}>
      {!inline && (
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('sweep.rankings.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('sweep.rankings.subtitle')}</p>
        </div>
      )}

      {/* Clickable Ranking Cards - 2 rows: 2 cards + 3 cards */}
      <div className="space-y-3">
        {/* Row 1: Global + Nacional */}
        <div className={cn(
          'gap-3',
          isMobile ? 'flex flex-col' : 'flex flex-row justify-center'
        )}>
          {cards.slice(0, 2).map(card => (
            <Card
              key={card.id}
              className={cn(
                'cursor-pointer transition-colors press',
                isMobile ? 'w-full' : 'w-[180px] md:w-[200px]',
                selectedView === card.id
                  ? 'border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                  : 'bg-card/80 backdrop-blur border-border hover:border-primary/30'
              )}
              onClick={() => setSelectedView(card.id)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <TrendIcon trend={card.trend} change={card.change} />
                </div>
                <p className="text-xl font-bold text-foreground">#{card.position}</p>
                <p className="text-2xs text-muted-foreground">{t('sweep.rankings.of', { total: formatNumber(card.total) })}</p>
                <p className="text-xs font-medium text-foreground mt-1 truncate">{card.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Row 2: Clinic cards (only for dentists) */}
        {cards.length > 2 && (
          <div className={cn(
            'gap-3',
            isMobile ? 'flex flex-col' : 'flex flex-row justify-center'
          )}>
            {cards.slice(2).map(card => (
              <Card
                key={card.id}
                className={cn(
                  'cursor-pointer transition-colors press',
                  isMobile ? 'w-full' : 'w-[160px] md:w-[180px]',
                  selectedView === card.id
                    ? 'border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                    : 'bg-card/80 backdrop-blur border-border hover:border-primary/30'
                )}
                onClick={() => setSelectedView(card.id)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      {card.icon}
                    </div>
                    <TrendIcon trend={card.trend} change={card.change} />
                  </div>
                  <p className="text-xl font-bold text-foreground">#{card.position}</p>
                  <p className="text-2xs text-muted-foreground">{t('sweep.rankings.of', { total: formatNumber(card.total) })}</p>
                  <p className="text-xs font-medium text-foreground mt-1 truncate">{card.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Own position only */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">{selectedCard.title}</h2>
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 px-4 py-3 bg-primary/10">
              <MedalEmoji position={selectedCard.position} />
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {isClinic ? <Building2 className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary truncate">
                  {isClinic ? mockClinics[0].name : mockDentists[0].name} <span className="text-xs">{t('sweep.rankings.you')}</span>
                </p>
                <p className="text-2xs text-muted-foreground">{t('sweep.rankings.of', { total: formatNumber(selectedCard.total) })}</p>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{formatNumber(currentUserXP)} XP</span>
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground mt-3">{t('rankings.privateNote')}</p>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <ScrollArea className="flex-1">
      {content}
    </ScrollArea>
  );
}