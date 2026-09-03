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

// Top 10 per ranking view
const leaderboards: Record<string, { position: number; name: string; xp: number; isCurrentUser: boolean }[]> = {
  global: [
    { position: 1, name: 'Dr. Ricardo Mendes', xp: 15200, isCurrentUser: false },
    { position: 2, name: 'Dra. Ana Ferreira', xp: 14800, isCurrentUser: false },
    { position: 3, name: 'Dr. Manuel Costa', xp: 14100, isCurrentUser: false },
    { position: 4, name: 'Dra. Sofia Lopes', xp: 13500, isCurrentUser: false },
    { position: 5, name: 'Dr. Carlos Santos', xp: 12900, isCurrentUser: false },
    { position: 6, name: 'Dra. Catarina Reis', xp: 12400, isCurrentUser: false },
    { position: 7, name: 'Dr. André Gomes', xp: 11800, isCurrentUser: false },
    { position: 8, name: 'Dra. Helena Nunes', xp: 11200, isCurrentUser: false },
    { position: 9, name: 'Dr. Tiago Moreira', xp: 10600, isCurrentUser: false },
    { position: 10, name: 'Dra. Beatriz Nunes', xp: 10100, isCurrentUser: false },
  ],
  national: [
    { position: 1, name: 'Dr. Ricardo Mendes', xp: 9850, isCurrentUser: false },
    { position: 2, name: 'Dra. Ana Ferreira', xp: 9420, isCurrentUser: false },
    { position: 3, name: 'Dr. Manuel Costa', xp: 9100, isCurrentUser: false },
    { position: 4, name: 'Dra. Sofia Lopes', xp: 8750, isCurrentUser: false },
    { position: 5, name: 'Dr. Carlos Santos', xp: 8500, isCurrentUser: false },
    { position: 6, name: 'Dra. Catarina Reis', xp: 8200, isCurrentUser: false },
    { position: 7, name: 'Dr. André Gomes', xp: 7950, isCurrentUser: false },
    { position: 8, name: mockDentists[0].name, xp: 7800, isCurrentUser: true },
    { position: 9, name: 'Dra. Helena Nunes', xp: 7650, isCurrentUser: false },
    { position: 10, name: 'Dr. Tiago Moreira', xp: 7400, isCurrentUser: false },
  ],
  'clinic-smilecheck': [
    { position: 1, name: mockDentists[0].name, xp: 7800, isCurrentUser: true },
    { position: 2, name: 'Dr. Alexandre Bernardo', xp: 6200, isCurrentUser: false },
    { position: 3, name: 'Dr. Gil Santos', xp: 5900, isCurrentUser: false },
  ],
  'clinic-mitry': [
    { position: 1, name: 'Dr. Pierre Dupont', xp: 8100, isCurrentUser: false },
    { position: 2, name: mockDentists[0].name, xp: 7800, isCurrentUser: true },
    { position: 3, name: 'Dra. Marie Laurent', xp: 6500, isCurrentUser: false },
  ],
  'clinic-montfermeil': [
    { position: 1, name: mockDentists[0].name, xp: 7800, isCurrentUser: true },
    { position: 2, name: 'Dr. Jean Martin', xp: 5400, isCurrentUser: false },
    { position: 3, name: 'Dra. Claire Moreau', xp: 4900, isCurrentUser: false },
  ],
};

const clinicLeaderboards: Record<string, { position: number; name: string; xp: number; isCurrentUser: boolean }[]> = {
  global: [
    { position: 1, name: 'Clínica DentPro', xp: 12500, isCurrentUser: false },
    { position: 2, name: 'Clínica OralCare', xp: 11800, isCurrentUser: false },
    { position: 3, name: mockClinics[0].name, xp: 11200, isCurrentUser: true },
    { position: 4, name: 'Clínica SorrirMais', xp: 10900, isCurrentUser: false },
    { position: 5, name: 'Clínica DentaVida', xp: 10500, isCurrentUser: false },
    { position: 6, name: 'Clínica SaúdOral', xp: 10100, isCurrentUser: false },
    { position: 7, name: 'Clínica DentExpress', xp: 9800, isCurrentUser: false },
    { position: 8, name: 'Clínica SmilePlus', xp: 9500, isCurrentUser: false },
    { position: 9, name: 'Clínica OralTop', xp: 9200, isCurrentUser: false },
    { position: 10, name: 'Clínica DentCare', xp: 8900, isCurrentUser: false },
  ],
  national: [
    { position: 1, name: 'Clínica DentPro', xp: 12500, isCurrentUser: false },
    { position: 2, name: 'Clínica OralCare', xp: 11800, isCurrentUser: false },
    { position: 3, name: mockClinics[0].name, xp: 11200, isCurrentUser: true },
    { position: 4, name: 'Clínica SorrirMais', xp: 10900, isCurrentUser: false },
    { position: 5, name: 'Clínica DentaVida', xp: 10500, isCurrentUser: false },
    { position: 6, name: 'Clínica SaúdOral', xp: 10100, isCurrentUser: false },
    { position: 7, name: 'Clínica DentExpress', xp: 9800, isCurrentUser: false },
    { position: 8, name: 'Clínica SmilePlus', xp: 9500, isCurrentUser: false },
    { position: 9, name: 'Clínica OralTop', xp: 9200, isCurrentUser: false },
    { position: 10, name: 'Clínica DentCare', xp: 8900, isCurrentUser: false },
  ],
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

export function RankingsView({ userRole, inline }: RankingsViewProps) {
  const isMobile = useIsMobile();
  const [selectedView, setSelectedView] = useState<RankingView>('national');

  const isClinic = userRole === 'clinic';
  const rankings = isClinic ? clinicRankings : dentistRankings;

  // Build card list
  const cards: { id: RankingView; title: string; icon: React.ReactNode; position: number; total: number; trend: 'up' | 'down' | 'same'; change: number }[] = [
    { id: 'global', title: 'Ranking Global', icon: <Trophy className="w-5 h-5 text-primary" />, ...rankings.global },
    { id: 'national', title: 'Ranking Nacional', icon: <Flag className="w-5 h-5 text-primary" />, ...rankings.national },
  ];
  if (!isClinic) {
    dentistRankings.clinics.forEach(c => {
      cards.push({ id: c.id, title: c.name, icon: <Building2 className="w-5 h-5 text-primary" />, position: c.position, total: c.total, trend: c.trend, change: c.change });
    });
  }

  // Get leaderboard for selected view
  const allLeaderboards = isClinic ? clinicLeaderboards : leaderboards;
  const currentLeaderboard = allLeaderboards[selectedView] || allLeaderboards['national'];
  
  // Check if current user is in top 10
  const userInTop10 = currentLeaderboard.some(e => e.isCurrentUser);
  const currentUserXP = 7800;
  const currentUserGlobalPos = isClinic ? 15 : 42;

  const content = (
    <div className={cn(inline ? 'space-y-6' : 'p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-32')}>
      {!inline && (
        <div>
          <h1 className="text-xl font-bold text-foreground">Classificações</h1>
          <p className="text-sm text-muted-foreground">Veja a sua posição nos rankings</p>
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
                'cursor-pointer transition-all',
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
                <p className="text-[11px] text-muted-foreground">de {card.total.toLocaleString()}</p>
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
                  'cursor-pointer transition-all',
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
                  <p className="text-[11px] text-muted-foreground">de {card.total.toLocaleString()}</p>
                  <p className="text-xs font-medium text-foreground mt-1 truncate">{card.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Leaderboard */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          {cards.find(c => c.id === selectedView)?.title || 'Ranking Nacional'}
        </h2>
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="p-0">
            {currentLeaderboard.map((entry, i) => (
              <div
                key={entry.position}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 transition-colors',
                  i < currentLeaderboard.length - 1 && 'border-b border-border',
                  entry.isCurrentUser && 'bg-primary/10'
                )}
              >
                <MedalEmoji position={entry.position} />
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {isClinic ? (
                    <Building2 className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm truncate', entry.isCurrentUser ? 'font-bold text-primary' : 'text-foreground')}>
                    {entry.name}
                    {entry.isCurrentUser && <span className="text-xs ml-1">(Você)</span>}
                  </p>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>
            ))}

            {/* Show current user below top 10 if not in it */}
            {!userInTop10 && selectedView !== 'global' && (
              <>
                <div className="flex items-center justify-center py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">• • •</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-primary/10">
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{currentUserGlobalPos}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {isClinic ? <Building2 className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary truncate">
                      {mockDentists[0].name} <span className="text-xs">(Você)</span>
                    </p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {currentUserXP.toLocaleString()} XP
                  </span>
                </div>
              </>
            )}
            {!userInTop10 && selectedView === 'global' && (
              <>
                <div className="flex items-center justify-center py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">• • •</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-primary/10">
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{currentUserGlobalPos}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {isClinic ? <Building2 className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary truncate">
                      {isClinic ? mockClinics[0].name : mockDentists[0].name} <span className="text-xs">(Você)</span>
                    </p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {currentUserXP.toLocaleString()} XP
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
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