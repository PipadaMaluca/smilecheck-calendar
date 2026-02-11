import { Trophy, TrendingUp, TrendingDown, Minus, Flag, Building2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockClinics } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface RankingsViewProps {
  userRole: UserRole;
}

// --- Mock ranking data ---
const dentistRankings = {
  global: { position: 42, total: 1250, trend: 'up' as const, change: 3 },
  national: { position: 8, total: 320, trend: 'up' as const, change: 2 },
  clinics: [
    { name: 'Clínica SmileCheck', position: 1, total: 3, trend: 'same' as const, change: 0 },
    { name: 'Clínica Mitry-Mory', position: 2, total: 3, trend: 'up' as const, change: 1 },
    { name: 'Clínica Montfermeil', position: 1, total: 3, trend: 'same' as const, change: 0 },
  ],
};

const clinicRankings = {
  global: { position: 15, total: 450, trend: 'up' as const, change: 5 },
  national: { position: 3, total: 85, trend: 'up' as const, change: 1 },
};

const dentistTop10 = [
  { position: 1, name: 'Dr. Ricardo Mendes', points: 9850, isCurrentUser: false },
  { position: 2, name: 'Dra. Ana Ferreira', points: 9420, isCurrentUser: false },
  { position: 3, name: 'Dr. Manuel Costa', points: 9100, isCurrentUser: false },
  { position: 4, name: 'Dra. Sofia Lopes', points: 8750, isCurrentUser: false },
  { position: 5, name: 'Dr. Carlos Santos', points: 8500, isCurrentUser: false },
  { position: 6, name: 'Dra. Catarina Reis', points: 8200, isCurrentUser: false },
  { position: 7, name: 'Dr. André Gomes', points: 7950, isCurrentUser: false },
  { position: 8, name: mockDentists[0].name, points: 7800, isCurrentUser: true },
  { position: 9, name: 'Dra. Helena Nunes', points: 7650, isCurrentUser: false },
  { position: 10, name: 'Dr. Tiago Moreira', points: 7400, isCurrentUser: false },
];

const clinicTop10 = [
  { position: 1, name: 'Clínica DentPro', points: 12500, isCurrentUser: false },
  { position: 2, name: 'Clínica OralCare', points: 11800, isCurrentUser: false },
  { position: 3, name: mockClinics[0].name, points: 11200, isCurrentUser: true },
  { position: 4, name: 'Clínica SorrirMais', points: 10900, isCurrentUser: false },
  { position: 5, name: 'Clínica DentaVida', points: 10500, isCurrentUser: false },
  { position: 6, name: 'Clínica SaúdOral', points: 10100, isCurrentUser: false },
  { position: 7, name: 'Clínica DentExpress', points: 9800, isCurrentUser: false },
  { position: 8, name: 'Clínica SmilePlus', points: 9500, isCurrentUser: false },
  { position: 9, name: 'Clínica OralTop', points: 9200, isCurrentUser: false },
  { position: 10, name: 'Clínica DentCare', points: 8900, isCurrentUser: false },
];

const evolution = [
  { month: 'Set 2025', position: 18 },
  { month: 'Out 2025', position: 15 },
  { month: 'Nov 2025', position: 14 },
  { month: 'Dez 2025', position: 12 },
  { month: 'Jan 2026', position: 10 },
  { month: 'Fev 2026', position: 8 },
];

function TrendIcon({ trend, change }: { trend: 'up' | 'down' | 'same'; change: number }) {
  if (trend === 'up') return (
    <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
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

function RankCard({ title, icon, position, total, trend, change }: {
  title: string;
  icon: React.ReactNode;
  position: number;
  total: number;
  trend: 'up' | 'down' | 'same';
  change: number;
}) {
  return (
    <Card className="bg-card/80 backdrop-blur border-border flex-1 min-w-[160px]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <TrendIcon trend={trend} change={change} />
        </div>
        <p className="text-2xl font-bold text-foreground">#{position}</p>
        <p className="text-xs text-muted-foreground">de {total.toLocaleString()}</p>
        <p className="text-xs font-medium text-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}

function MedalEmoji({ position }: { position: number }) {
  if (position === 1) return <span className="text-lg">🥇</span>;
  if (position === 2) return <span className="text-lg">🥈</span>;
  if (position === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{position}</span>;
}

export function RankingsView({ userRole }: RankingsViewProps) {
  const isMobile = useIsMobile();
  const rankings = userRole === 'clinic' ? clinicRankings : dentistRankings;
  const top10 = userRole === 'clinic' ? clinicTop10 : dentistTop10;

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-32">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Classificações</h1>
          <p className="text-sm text-muted-foreground">Veja a sua posição nos rankings</p>
        </div>

        {/* Ranking Cards */}
        <div className={cn('gap-4', isMobile ? 'flex flex-col' : 'flex flex-row')}>
          <RankCard
            title="Ranking Global"
            icon={<Trophy className="w-5 h-5 text-primary" />}
            position={rankings.global.position}
            total={rankings.global.total}
            trend={rankings.global.trend}
            change={rankings.global.change}
          />
          <RankCard
            title="Ranking Nacional"
            icon={<Flag className="w-5 h-5 text-primary" />}
            position={rankings.national.position}
            total={rankings.national.total}
            trend={rankings.national.trend}
            change={rankings.national.change}
          />
        </div>

        {/* Clinic-specific rankings for dentist */}
        {userRole === 'dentist' && (
          <div className={cn('gap-4', isMobile ? 'flex flex-col' : 'flex flex-row')}>
            {dentistRankings.clinics.map(c => (
              <RankCard
                key={c.name}
                title={c.name}
                icon={<Building2 className="w-5 h-5 text-primary" />}
                position={c.position}
                total={c.total}
                trend={c.trend}
                change={c.change}
              />
            ))}
          </div>
        )}

        <Separator />

        {/* Top 10 */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">
            Top 10 Nacional
          </h2>
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="p-0">
              {top10.map((entry, i) => (
                <div
                  key={entry.position}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors',
                    i < top10.length - 1 && 'border-b border-border',
                    entry.isCurrentUser && 'bg-primary/10'
                  )}
                >
                  <MedalEmoji position={entry.position} />
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {userRole === 'clinic' ? (
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
                    {entry.points.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Evolution */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">A Sua Evolução</h2>
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="p-4 space-y-3">
              {evolution.map((e, i) => {
                const prev = i > 0 ? evolution[i - 1].position : e.position;
                const diff = prev - e.position;
                return (
                  <div key={e.month} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{e.month}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-foreground">#{e.position}</span>
                      {diff > 0 ? (
                        <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> +{diff}
                        </span>
                      ) : diff < 0 ? (
                        <span className="text-xs text-red-400 flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" /> {diff}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
