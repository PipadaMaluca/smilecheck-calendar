import { useState } from 'react';
import { Lock, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/types/calendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AchievementsViewProps {
  userRole: UserRole;
}

interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  progress?: { current: number; target: number };
  secret?: boolean;
}

interface AchievementCategory {
  title: string;
  achievements: Achievement[];
}

// --- Patient Achievements ---
const patientAchievements: AchievementCategory[] = [
  {
    title: 'Primeiros Passos',
    achievements: [
      { id: 'p1', emoji: '🌟', name: 'Bem-vindo', description: 'Criar conta', points: 5, unlocked: true },
      { id: 'p2', emoji: '📝', name: 'Perfil Completo', description: 'Preencher info saúde', points: 3, unlocked: true },
      { id: 'p3', emoji: '📱', name: 'Verificado', description: 'Verificar email/telemóvel', points: 2, unlocked: true },
      { id: 'p4', emoji: '🎓', name: 'Estudante', description: 'Completar tutorial', points: 2, unlocked: true },
      { id: 'p5', emoji: '🦷', name: 'Primeira Consulta', description: 'Ir à primeira consulta', points: 10, unlocked: true },
    ],
  },
  {
    title: 'Consultas',
    achievements: [
      { id: 'c1', emoji: '📅', name: 'Regular', description: '3 consultas em 12 meses', points: 15, unlocked: true, progress: { current: 3, target: 3 } },
      { id: 'c2', emoji: '🏃', name: 'Dedicado', description: '6 consultas em 12 meses', points: 25, unlocked: false, progress: { current: 3, target: 6 } },
      { id: 'c3', emoji: '💎', name: 'VIP', description: '12 consultas em 12 meses', points: 50, unlocked: false, progress: { current: 3, target: 12 } },
      { id: 'c4', emoji: '📹', name: 'Digital', description: '1ª teleconsulta', points: 10, unlocked: true },
      { id: 'c5', emoji: '📹', name: 'Teleconsultor', description: '10 teleconsultas', points: 20, unlocked: false, progress: { current: 4, target: 10 } },
      { id: 'c6', emoji: '📹', name: 'Mestre Digital', description: '50 teleconsultas', points: 50, unlocked: false, progress: { current: 4, target: 50 } },
      { id: 'c7', emoji: '🏥', name: 'Explorador', description: '3 clínicas diferentes', points: 15, unlocked: false, progress: { current: 1, target: 3 } },
    ],
  },
  {
    title: 'Saúde',
    achievements: [
      { id: 's1', emoji: '🪥', name: 'Higiene Oral', description: 'Registar escovagem 7 dias seguidos', points: 10, unlocked: true },
      { id: 's2', emoji: '🦷', name: 'Sorriso Saudável', description: '3 destartarizações', points: 15, unlocked: false, progress: { current: 2, target: 3 } },
      { id: 's3', emoji: '⭐', name: 'Avaliador', description: 'Avaliar 5 consultas', points: 10, unlocked: false, progress: { current: 2, target: 5 } },
      { id: 's4', emoji: '❓', name: '???', description: '???', points: 25, unlocked: false, secret: true },
      { id: 's5', emoji: '❓', name: '???', description: '???', points: 50, unlocked: false, secret: true },
    ],
  },
];

// --- Dentist Achievements ---
const dentistAchievements: AchievementCategory[] = [
  {
    title: 'Volume de Trabalho',
    achievements: [
      { id: 'd1', emoji: '🏅', name: 'Veterano Bronze', description: '100 teleconsultas', points: 25, unlocked: true, progress: { current: 100, target: 100 } },
      { id: 'd2', emoji: '🏅', name: 'Veterano Prata', description: '250 teleconsultas', points: 50, unlocked: false, progress: { current: 127, target: 250 } },
      { id: 'd3', emoji: '🏅', name: 'Veterano Ouro', description: '500 teleconsultas', points: 75, unlocked: false, progress: { current: 127, target: 500 } },
      { id: 'd4', emoji: '👨‍⚕️', name: 'Maratonista', description: '20 consultas num dia', points: 30, unlocked: true },
      { id: 'd5', emoji: '🌙', name: 'Noturno', description: '50 consultas após 20h', points: 20, unlocked: false, progress: { current: 38, target: 50 } },
    ],
  },
  {
    title: 'Qualidade',
    achievements: [
      { id: 'q1', emoji: '⭐', name: 'Excelência', description: 'Rating médio ≥ 4.8', points: 30, unlocked: true },
      { id: 'q2', emoji: '💬', name: 'Comunicador', description: '100 respostas em 24h', points: 20, unlocked: true, progress: { current: 100, target: 100 } },
      { id: 'q3', emoji: '🎯', name: 'Precisão', description: '0 cancelamentos em 3 meses', points: 25, unlocked: false },
      { id: 'q4', emoji: '📋', name: 'Detalhista', description: '50 receitas emitidas', points: 15, unlocked: true, progress: { current: 50, target: 50 } },
    ],
  },
  {
    title: 'Rankings',
    achievements: [
      { id: 'r1', emoji: '🏆', name: 'Top 100', description: 'Entrar no top 100 nacional', points: 30, unlocked: true },
      { id: 'r2', emoji: '🏆', name: 'Top 10', description: 'Entrar no top 10 nacional', points: 75, unlocked: true },
      { id: 'r3', emoji: '🏆', name: 'Nº 1 Clínica', description: '1º lugar numa clínica', points: 40, unlocked: true },
      { id: 'r4', emoji: '❓', name: '???', description: '???', points: 100, unlocked: false, secret: true },
    ],
  },
  {
    title: 'Consistência',
    achievements: [
      { id: 'cs1', emoji: '🔥', name: 'Streak 7', description: '7 dias consecutivos', points: 10, unlocked: true },
      { id: 'cs2', emoji: '🔥', name: 'Streak 30', description: '30 dias consecutivos', points: 30, unlocked: true },
      { id: 'cs3', emoji: '🔥', name: 'Streak 90', description: '90 dias consecutivos', points: 60, unlocked: false, progress: { current: 45, target: 90 } },
      { id: 'cs4', emoji: '❓', name: '???', description: '???', points: 100, unlocked: false, secret: true },
    ],
  },
];

// --- Clinic Achievements ---
const clinicAchievements: AchievementCategory[] = [
  {
    title: 'Fundação',
    achievements: [
      { id: 'cl1', emoji: '🏥', name: 'Inauguração', description: 'Criar conta de clínica', points: 10, unlocked: true },
      { id: 'cl2', emoji: '📋', name: 'Perfil Completo', description: 'Preencher dados da clínica', points: 5, unlocked: true },
      { id: 'cl3', emoji: '📸', name: 'Vitrine', description: 'Adicionar 5 fotos', points: 5, unlocked: true },
    ],
  },
  {
    title: 'Equipa',
    achievements: [
      { id: 'eq1', emoji: '👥', name: 'Equipa Mínima', description: '3 dentistas ativos', points: 15, unlocked: true },
      { id: 'eq2', emoji: '👥', name: 'Grande Equipa', description: '7 dentistas ativos', points: 30, unlocked: true, progress: { current: 7, target: 7 } },
      { id: 'eq3', emoji: '👥', name: 'Mega Equipa', description: '15 dentistas ativos', points: 50, unlocked: false, progress: { current: 7, target: 15 } },
    ],
  },
  {
    title: 'Volume',
    achievements: [
      { id: 'v1', emoji: '📈', name: '1.000 Consultas', description: 'Total acumulado', points: 25, unlocked: true },
      { id: 'v2', emoji: '📈', name: '5.000 Consultas', description: 'Total acumulado', points: 50, unlocked: false, progress: { current: 3200, target: 5000 } },
      { id: 'v3', emoji: '📈', name: '10.000 Consultas', description: 'Total acumulado', points: 100, unlocked: false, progress: { current: 3200, target: 10000 } },
    ],
  },
  {
    title: 'Qualidade',
    achievements: [
      { id: 'cq1', emoji: '⭐', name: 'Rating 4.5+', description: 'Média ≥ 4.5', points: 20, unlocked: true },
      { id: 'cq2', emoji: '⭐', name: 'Rating 4.8+', description: 'Média ≥ 4.8', points: 40, unlocked: true },
      { id: 'cq3', emoji: '💬', name: '100 Avaliações', description: '100 reviews positivas', points: 25, unlocked: true },
      { id: 'cq4', emoji: '❓', name: '???', description: '???', points: 75, unlocked: false, secret: true },
    ],
  },
  {
    title: 'Rankings',
    achievements: [
      { id: 'cr1', emoji: '🏆', name: 'Top 50', description: 'Entrar no top 50 nacional', points: 25, unlocked: true },
      { id: 'cr2', emoji: '🏆', name: 'Top 10', description: 'Entrar no top 10 nacional', points: 60, unlocked: true },
      { id: 'cr3', emoji: '🏆', name: 'Top 3', description: 'Entrar no pódio nacional', points: 100, unlocked: true },
      { id: 'cr4', emoji: '❓', name: '???', description: '???', points: 150, unlocked: false, secret: true },
    ],
  },
];

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isSecret = achievement.secret && !achievement.unlocked;

  return (
    <Card className={cn(
      'bg-card/80 backdrop-blur border-border transition-all duration-300',
      achievement.unlocked
        ? 'ring-1 ring-primary/20'
        : 'opacity-60'
    )}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0',
            achievement.unlocked ? 'bg-primary/10' : 'bg-muted'
          )}>
            {isSecret ? (
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
            ) : (
              achievement.emoji
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn(
                'text-sm font-medium truncate',
                achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {isSecret ? '???' : achievement.name}
              </p>
              {achievement.unlocked && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                  ✓
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isSecret ? 'Conquista secreta' : achievement.description}
            </p>
            <div className="flex items-center justify-between mt-1.5">
              <span className={cn(
                'text-[10px] font-bold',
                achievement.unlocked ? 'text-amber-400' : 'text-muted-foreground'
              )}>
                +{achievement.points} pts
              </span>
              {!achievement.unlocked && !isSecret && (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            {achievement.progress && !isSecret && (
              <div className="mt-2">
                <Progress
                  value={(achievement.progress.current / achievement.progress.target) * 100}
                  className="h-1.5"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {achievement.progress.current}/{achievement.progress.target}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AchievementsView({ userRole }: AchievementsViewProps) {
  const isMobile = useIsMobile();

  const categories = userRole === 'patient'
    ? patientAchievements
    : userRole === 'dentist'
    ? dentistAchievements
    : clinicAchievements;

  const totalAchievements = categories.reduce((sum, cat) => sum + cat.achievements.length, 0);
  const unlockedAchievements = categories.reduce(
    (sum, cat) => sum + cat.achievements.filter(a => a.unlocked).length, 0
  );
  const progressPercent = Math.round((unlockedAchievements / totalAchievements) * 100);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-32">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Conquistas</h1>
          <p className="text-sm text-muted-foreground">
            {unlockedAchievements} de {totalAchievements} conquistas desbloqueadas
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progresso geral</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        {/* Categories */}
        {categories.map(category => (
          <div key={category.title}>
            <Separator className="mb-4" />
            <h2 className="text-base font-semibold text-foreground mb-3">{category.title}</h2>
            <div className={cn(
              'grid gap-3',
              isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'
            )}>
              {category.achievements.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
