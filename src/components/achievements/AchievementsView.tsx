import { useState } from 'react';
import { Lock, HelpCircle, Star as StarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { UserRole } from '@/types/calendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Achievement, AchievementCategory, getBadgeTier, BADGE_TIER_STYLES, DEFAULT_SHOWCASED } from './achievementData';
import { BadgeSelectionModal } from './BadgeSelectionModal';
import { toast } from 'sonner';

interface AchievementsViewProps {
  userRole: UserRole;
}

// --- Patient Achievements (35) ---
export const patientAchievements: AchievementCategory[] = [
  {
    title: 'Primeiros Passos',
    achievements: [
      { id: 'p1', emoji: '🌟', name: 'Bem-vindo', description: 'Criar conta', points: 5, unlocked: true },
      { id: 'p3', emoji: '📱', name: 'Verificado', description: 'Verificar email/telemóvel', points: 2, unlocked: true },
      { id: 'p4', emoji: '🎓', name: 'Estudante', description: 'Completar tutorial', points: 2, unlocked: true },
      { id: 'p2', emoji: '📝', name: 'Perfil Completo', description: 'Preencher info saúde', points: 3, unlocked: true },
      { id: 'p6', emoji: '👨‍👩‍👧', name: 'Familiar', description: 'Adicionar membro familiar', points: 5, unlocked: false, progress: { current: 0, target: 1 } },
      { id: 'p5', emoji: '🦷', name: 'Primeira Consulta', description: 'Ir à primeira consulta', points: 10, unlocked: true },
    ],
  },
  {
    title: 'Consultas',
    achievements: [
      { id: 'c4', emoji: '📹', name: 'Digital', description: '1ª teleconsulta', points: 10, unlocked: true },
      { id: 'c8', emoji: '🌅', name: 'Madrugador', description: '5 consultas antes das 9h', points: 10, unlocked: false, progress: { current: 1, target: 5 } },
      { id: 'c1', emoji: '📅', name: 'Regular', description: '3 consultas em 12 meses', points: 15, unlocked: true, progress: { current: 3, target: 3 } },
      { id: 'c7', emoji: '🏥', name: 'Explorador', description: '3 clínicas diferentes', points: 15, unlocked: false, progress: { current: 1, target: 3 } },
      { id: 'c5', emoji: '📹', name: 'Teleconsultor', description: '10 teleconsultas', points: 20, unlocked: false, progress: { current: 4, target: 10 } },
      { id: 'c9', emoji: '🤝', name: 'Fiel', description: '5 consultas no mesmo dentista', points: 20, unlocked: false, progress: { current: 3, target: 5 } },
      { id: 'c2', emoji: '🏃', name: 'Dedicado', description: '6 consultas em 12 meses', points: 25, unlocked: false, progress: { current: 3, target: 6 } },
      { id: 'c10', emoji: '🌍', name: 'Globetrotter', description: '5 clínicas diferentes', points: 25, unlocked: false, progress: { current: 1, target: 5 } },
      { id: 'c3', emoji: '💎', name: 'VIP', description: '12 consultas em 12 meses', points: 50, unlocked: false, progress: { current: 3, target: 12 } },
      { id: 'c6', emoji: '📹', name: 'Mestre Digital', description: '50 teleconsultas', points: 50, unlocked: false, progress: { current: 4, target: 50 } },
    ],
  },
  {
    title: 'Saúde',
    achievements: [
      { id: 's1', emoji: '🪥', name: 'Higiene Oral', description: 'Registar escovagem 7 dias seguidos', points: 10, unlocked: true },
      { id: 's3', emoji: '⭐', name: 'Avaliador', description: 'Avaliar 5 consultas', points: 10, unlocked: false, progress: { current: 2, target: 5 } },
      { id: 's2', emoji: '🦷', name: 'Sorriso Saudável', description: '3 destartarizações', points: 15, unlocked: false, progress: { current: 2, target: 3 } },
      { id: 's6', emoji: '⏰', name: 'Pontual', description: '10 consultas a chegar a horas', points: 15, unlocked: false, progress: { current: 6, target: 10 } },
      { id: 's7', emoji: '📝', name: 'Crítico', description: 'Avaliar 20 consultas', points: 20, unlocked: false, progress: { current: 2, target: 20 } },
      { id: 's8', emoji: '🌟', name: 'Exemplar', description: '10 consultas com "Colaborou" positivo', points: 20, unlocked: false, progress: { current: 4, target: 10 } },
      { id: 's9', emoji: '✨', name: 'Sorriso Perfeito', description: '6 destartarizações', points: 25, unlocked: false, progress: { current: 2, target: 6 } },
      { id: 's10', emoji: '🏆', name: 'Mestre Avaliador', description: 'Avaliar 50 consultas', points: 40, unlocked: false, progress: { current: 2, target: 50 } },
    ],
  },
  {
    title: 'Social',
    achievements: [
      { id: 'so1', emoji: '❤️', name: 'Primeiro Favorito', description: 'Adicionar 1º favorito', points: 5, unlocked: true },
      { id: 'so2', emoji: '💬', name: 'Mensageiro', description: 'Enviar 1ª mensagem', points: 5, unlocked: true },
      { id: 'so3', emoji: '🌐', name: 'Rede', description: '5 dentistas favoritos', points: 10, unlocked: false, progress: { current: 2, target: 5 } },
      { id: 'so4', emoji: '🗣️', name: 'Comunicativo', description: '50 mensagens enviadas', points: 15, unlocked: false, progress: { current: 12, target: 50 } },
    ],
  },
  {
    title: 'Fidelidade',
    achievements: [
      { id: 'f1', emoji: '🎂', name: 'Aniversário', description: '1 ano na app', points: 20, unlocked: false, progress: { current: 4, target: 12 } },
      { id: 'f2', emoji: '🎖️', name: 'Veterano', description: '2 anos na app', points: 40, unlocked: false, progress: { current: 4, target: 24 } },
    ],
  },
  {
    title: 'Secretas',
    achievements: [
      { id: 'sec1', emoji: '❓', name: '???', description: '???', points: 25, unlocked: false, secret: true },
      { id: 'sec2', emoji: '❓', name: '???', description: '???', points: 30, unlocked: false, secret: true },
      { id: 'sec3', emoji: '❓', name: '???', description: '???', points: 50, unlocked: false, secret: true },
      { id: 'sec4', emoji: '❓', name: '???', description: '???', points: 50, unlocked: false, secret: true },
      { id: 'sec5', emoji: '❓', name: '???', description: '???', points: 75, unlocked: false, secret: true },
    ],
  },
];

// --- Dentist Achievements (35) ---
export const dentistAchievements: AchievementCategory[] = [
  {
    title: 'Primeiros Passos',
    achievements: [
      { id: 'dp1', emoji: '🌟', name: 'Bem-vindo', description: 'Criar conta', points: 3, unlocked: true },
      { id: 'dp2', emoji: '📱', name: 'Verificado', description: 'Verificar email/telemóvel', points: 3, unlocked: true },
      { id: 'dp3', emoji: '📝', name: 'Perfil Completo', description: 'Preencher perfil completo', points: 5, unlocked: true },
      { id: 'dp4', emoji: '🦷', name: 'Primeira Consulta', description: 'Realizar 1ª consulta', points: 10, unlocked: true },
    ],
  },
  {
    title: 'Volume de Trabalho',
    achievements: [
      { id: 'd1', emoji: '🏅', name: 'Veterano Bronze', description: '100 teleconsultas', points: 25, unlocked: true, progress: { current: 100, target: 100 } },
      { id: 'd4', emoji: '👨‍⚕️', name: 'Maratonista', description: '20 consultas num dia', points: 30, unlocked: true },
      { id: 'd7', emoji: '🏋️', name: 'Dedicado', description: '500 consultas presenciais', points: 30, unlocked: false, progress: { current: 280, target: 500 } },
      { id: 'd5', emoji: '🌙', name: 'Noturno', description: '50 consultas após 20h', points: 20, unlocked: false, progress: { current: 38, target: 50 } },
      { id: 'd2', emoji: '🏅', name: 'Veterano Prata', description: '250 teleconsultas', points: 50, unlocked: false, progress: { current: 127, target: 250 } },
      { id: 'd3', emoji: '🏅', name: 'Veterano Ouro', description: '500 teleconsultas', points: 75, unlocked: false, progress: { current: 127, target: 500 } },
      { id: 'd8', emoji: '👑', name: 'Lenda', description: '1000 consultas presenciais', points: 75, unlocked: false, progress: { current: 280, target: 1000 } },
    ],
  },
  {
    title: 'Qualidade',
    achievements: [
      { id: 'q5', emoji: '📄', name: 'Mentor', description: '10 cartas de referência emitidas', points: 15, unlocked: false, progress: { current: 4, target: 10 } },
      { id: 'q4', emoji: '📋', name: 'Detalhista', description: '50 receitas emitidas', points: 15, unlocked: true, progress: { current: 50, target: 50 } },
      { id: 'q2', emoji: '💬', name: 'Comunicador', description: '100 respostas em 24h', points: 20, unlocked: true, progress: { current: 100, target: 100 } },
      { id: 'q3', emoji: '🎯', name: 'Precisão', description: '0 cancelamentos em 3 meses', points: 25, unlocked: false },
      { id: 'q6', emoji: '💊', name: 'Farmacêutico', description: '100 receitas emitidas', points: 25, unlocked: false, progress: { current: 50, target: 100 } },
      { id: 'q1', emoji: '⭐', name: 'Excelência', description: 'Rating médio ≥ 4.8', points: 30, unlocked: true },
    ],
  },
  {
    title: 'Rankings',
    achievements: [
      { id: 'r1', emoji: '🏆', name: 'Top 100', description: 'Entrar no top 100 nacional', points: 30, unlocked: true },
      { id: 'r3', emoji: '🏆', name: 'Nº 1 Clínica', description: '1º lugar numa clínica', points: 40, unlocked: true },
      { id: 'r2', emoji: '🏆', name: 'Top 10', description: 'Entrar no top 10 nacional', points: 75, unlocked: true },
      { id: 'r4', emoji: '❓', name: '???', description: '???', points: 100, unlocked: false, secret: true },
    ],
  },
  {
    title: 'Consistência',
    achievements: [
      { id: 'cs1', emoji: '🔥', name: 'Streak 7', description: '7 dias consecutivos', points: 10, unlocked: true },
      { id: 'cs2', emoji: '🔥', name: 'Streak 30', description: '30 dias consecutivos', points: 30, unlocked: true },
      { id: 'cs3', emoji: '🔥', name: 'Streak 90', description: '90 dias consecutivos', points: 60, unlocked: false, progress: { current: 45, target: 90 } },
      { id: 'cs5', emoji: '🔥', name: 'Streak 365', description: '365 dias consecutivos', points: 100, unlocked: false, progress: { current: 45, target: 365 } },
    ],
  },
  {
    title: 'Social',
    achievements: [
      { id: 'dso1', emoji: '❤️', name: 'Primeiro Favorito', description: 'Ser favorito de 1 paciente', points: 5, unlocked: true },
      { id: 'dso2', emoji: '💬', name: 'Comunicativo', description: '100 mensagens respondidas', points: 15, unlocked: false, progress: { current: 42, target: 100 } },
      { id: 'dso3', emoji: '🌟', name: 'Popular', description: 'Ser favorito de 50 pacientes', points: 25, unlocked: false, progress: { current: 18, target: 50 } },
    ],
  },
  {
    title: 'Fidelidade',
    achievements: [
      { id: 'df1', emoji: '🎂', name: 'Aniversário', description: '1 ano na plataforma', points: 20, unlocked: false, progress: { current: 8, target: 12 } },
      { id: 'df2', emoji: '🎖️', name: 'Veterano', description: '3 anos na plataforma', points: 50, unlocked: false, progress: { current: 8, target: 36 } },
    ],
  },
  {
    title: 'Secretas',
    achievements: [
      { id: 'dsec1', emoji: '❓', name: '???', description: '???', points: 50, unlocked: false, secret: true },
      { id: 'dsec2', emoji: '❓', name: '???', description: '???', points: 75, unlocked: false, secret: true },
      { id: 'dsec3', emoji: '❓', name: '???', description: '???', points: 100, unlocked: false, secret: true },
      { id: 'dsec4', emoji: '❓', name: '???', description: '???', points: 100, unlocked: false, secret: true },
      { id: 'dsec5', emoji: '❓', name: '???', description: '???', points: 100, unlocked: false, secret: true },
    ],
  },
];

// --- Clinic Achievements (35) ---
export const clinicAchievements: AchievementCategory[] = [
  {
    title: 'Fundação',
    achievements: [
      { id: 'cl1', emoji: '🏥', name: 'Inauguração', description: 'Criar conta de clínica', points: 10, unlocked: true },
      { id: 'cl3', emoji: '📸', name: 'Vitrine', description: 'Adicionar 5 fotos', points: 5, unlocked: true },
      { id: 'cl4', emoji: '✅', name: 'Verificada', description: 'Verificar dados oficiais', points: 5, unlocked: true },
      { id: 'cl5', emoji: '💻', name: 'Digital', description: 'Ativar teleconsultas', points: 10, unlocked: true },
      { id: 'cl2', emoji: '📋', name: 'Perfil Completo', description: 'Preencher dados da clínica', points: 10, unlocked: true },
    ],
  },
  {
    title: 'Equipa',
    achievements: [
      { id: 'eq1', emoji: '👥', name: 'Equipa Mínima', description: '3 dentistas ativos', points: 15, unlocked: true },
      { id: 'eq4', emoji: '🔬', name: 'Especializada', description: '5 especialidades diferentes', points: 20, unlocked: false, progress: { current: 3, target: 5 } },
      { id: 'eq2', emoji: '👥', name: 'Grande Equipa', description: '7 dentistas ativos', points: 30, unlocked: true, progress: { current: 7, target: 7 } },
      { id: 'eq5', emoji: '⭐', name: 'Referência', description: 'Todos os dentistas com rating ≥ 4.5', points: 30, unlocked: false },
      { id: 'eq3', emoji: '👥', name: 'Mega Equipa', description: '15 dentistas ativos', points: 50, unlocked: false, progress: { current: 7, target: 15 } },
    ],
  },
  {
    title: 'Volume',
    achievements: [
      { id: 'v1', emoji: '📈', name: '1.000 Consultas', description: 'Total acumulado', points: 25, unlocked: true },
      { id: 'v4', emoji: '🚀', name: 'Mês Recorde', description: '500 consultas num mês', points: 50, unlocked: false, progress: { current: 320, target: 500 } },
      { id: 'v2', emoji: '📈', name: '5.000 Consultas', description: 'Total acumulado', points: 50, unlocked: false, progress: { current: 3200, target: 5000 } },
      { id: 'v5', emoji: '📈', name: '25.000 Consultas', description: 'Total acumulado', points: 75, unlocked: false, progress: { current: 3200, target: 25000 } },
      { id: 'v3', emoji: '📈', name: '10.000 Consultas', description: 'Total acumulado', points: 100, unlocked: false, progress: { current: 3200, target: 10000 } },
    ],
  },
  {
    title: 'Qualidade',
    achievements: [
      { id: 'cq1', emoji: '⭐', name: 'Rating 4.5+', description: 'Média ≥ 4.5', points: 20, unlocked: true },
      { id: 'cq3', emoji: '💬', name: '100 Avaliações', description: '100 reviews positivas', points: 25, unlocked: true },
      { id: 'cq5', emoji: '🛡️', name: 'Zero Reclamações', description: '0 reclamações em 6 meses', points: 30, unlocked: false },
      { id: 'cq2', emoji: '⭐', name: 'Rating 4.8+', description: 'Média ≥ 4.8', points: 40, unlocked: true },
      { id: 'cq6', emoji: '⭐', name: 'Rating 4.9+', description: 'Média ≥ 4.9', points: 50, unlocked: false },
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
  {
    title: 'Consistência',
    achievements: [
      { id: 'ccs1', emoji: '🔥', name: 'Streak 30', description: '30 dias sem faltas de pacientes', points: 15, unlocked: false, progress: { current: 12, target: 30 } },
      { id: 'ccs2', emoji: '🔥', name: 'Streak 90', description: '90 dias sem faltas', points: 30, unlocked: false, progress: { current: 12, target: 90 } },
      { id: 'ccs3', emoji: '🔥', name: 'Streak 365', description: '1 ano sem faltas', points: 75, unlocked: false, progress: { current: 12, target: 365 } },
    ],
  },
  {
    title: 'Fidelidade',
    achievements: [
      { id: 'cf1', emoji: '🎂', name: 'Aniversário', description: '1 ano na plataforma', points: 20, unlocked: false, progress: { current: 6, target: 12 } },
      { id: 'cf2', emoji: '🏛️', name: 'Instituição', description: '3 anos na plataforma', points: 50, unlocked: false, progress: { current: 6, target: 36 } },
    ],
  },
  {
    title: 'Secretas',
    achievements: [
      { id: 'csec1', emoji: '❓', name: '???', description: '???', points: 50, unlocked: false, secret: true },
      { id: 'csec2', emoji: '❓', name: '???', description: '???', points: 75, unlocked: false, secret: true },
      { id: 'csec3', emoji: '❓', name: '???', description: '???', points: 75, unlocked: false, secret: true },
      { id: 'csec4', emoji: '❓', name: '???', description: '???', points: 150, unlocked: false, secret: true },
      { id: 'csec5', emoji: '❓', name: '???', description: '???', points: 150, unlocked: false, secret: true },
    ],
  },
];

function AchievementCard({ achievement, isShowcased, onClickCompleted }: { achievement: Achievement; isShowcased?: boolean; onClickCompleted?: () => void }) {
  const isSecret = achievement.secret && !achievement.unlocked;
  const tier = getBadgeTier(achievement);
  const tierStyle = BADGE_TIER_STYLES[tier];

  return (
    <Card
      className={cn(
        'bg-card/80 backdrop-blur border-border transition-all duration-300 relative',
        achievement.unlocked
          ? 'ring-1 ring-primary/20 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10 cursor-pointer'
          : 'opacity-60'
      )}
      onClick={achievement.unlocked && onClickCompleted ? onClickCompleted : undefined}
    >
      <CardContent className="p-3">
        {/* Showcased star indicator */}
        {isShowcased && (
          <div className="absolute top-1.5 right-10">
            <span className="text-amber-400 text-xs">⭐</span>
          </div>
        )}
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
              <span className={cn(
                'text-[10px] font-bold ml-auto flex-shrink-0',
                achievement.unlocked ? 'text-amber-400' : 'text-muted-foreground'
              )}>
                +{achievement.points} pts
              </span>
              {!achievement.unlocked && !isSecret && (
                <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isSecret ? 'Conquista secreta' : achievement.description}
            </p>
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

export function getAchievementCategories(userRole: UserRole): AchievementCategory[] {
  return userRole === 'patient'
    ? patientAchievements
    : userRole === 'dentist'
    ? dentistAchievements
    : clinicAchievements;
}

export function AchievementsView({ userRole }: AchievementsViewProps) {
  const isMobile = useIsMobile();
  const [showManageModal, setShowManageModal] = useState(false);
  const [showcasedIds, setShowcasedIds] = useState<string[]>(DEFAULT_SHOWCASED[userRole] || []);
  const [addToShowcaseTarget, setAddToShowcaseTarget] = useState<Achievement | null>(null);

  const categories = getAchievementCategories(userRole);

  const totalAchievements = categories.reduce((sum, cat) => sum + cat.achievements.length, 0);
  const unlockedAchievements = categories.reduce(
    (sum, cat) => sum + cat.achievements.filter(a => a.unlocked).length, 0
  );
  const progressPercent = Math.round((unlockedAchievements / totalAchievements) * 100);

  const allAchievements = categories.flatMap(c => c.achievements);
  const completedCategories = categories.map(cat => ({
    ...cat,
    achievements: cat.achievements.filter(a => a.unlocked),
  })).filter(cat => cat.achievements.length > 0);

  const handleClickCompleted = (ach: Achievement) => {
    if (showcasedIds.includes(ach.id)) {
      // Already showcased — remove
      setShowcasedIds(prev => prev.filter(id => id !== ach.id));
      toast.info(`"${ach.name}" removido dos destaques`);
    } else if (showcasedIds.length < 8) {
      // Has empty slots — add directly
      setShowcasedIds(prev => [...prev, ach.id]);
      toast.success(`✅ "${ach.name}" adicionado aos destaques!`);
    } else {
      // All slots full — open full edit modal with this target
      setAddToShowcaseTarget(ach);
      setShowManageModal(true);
    }
  };

  const renderAchievementGrid = (cats: AchievementCategory[], showClickHandler: boolean) => (
    <>
      {cats.map(category => {
        const hasVisible = category.achievements.some(a => !a.secret || a.unlocked);
        if (!hasVisible) return null;
        return (
          <div key={category.title}>
            <Separator className="mb-4" />
            <h2 className="text-base font-semibold text-foreground mb-3">{category.title}</h2>
            <div className={cn(
              'grid gap-3',
              isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'
            )}>
              {category.achievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isShowcased={showcasedIds.includes(achievement.id)}
                  onClickCompleted={showClickHandler && achievement.unlocked ? () => handleClickCompleted(achievement) : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-32">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Conquistas</h1>
            <p className="text-sm text-muted-foreground">
              {unlockedAchievements} de {totalAchievements} conquistas desbloqueadas
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs flex-shrink-0" onClick={() => setShowManageModal(true)}>
            <StarIcon className="w-3.5 h-3.5" /> Gerir Destaques
          </Button>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso geral</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="todas" className="flex-1">Todas</TabsTrigger>
            <TabsTrigger value="completas" className="flex-1">Completas ({unlockedAchievements})</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-0 mt-4">
            {renderAchievementGrid(categories, false)}
          </TabsContent>

          <TabsContent value="completas" className="space-y-0 mt-4">
            {completedCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">Ainda não desbloqueou nenhuma conquista.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-4">
                  Clique numa conquista para adicioná-la ou removê-la dos destaques do perfil.
                </p>
                {renderAchievementGrid(completedCategories, true)}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Badge Selection Modal */}
      <BadgeSelectionModal
        open={showManageModal}
        onOpenChange={setShowManageModal}
        categories={categories}
        selectedIds={showcasedIds}
        onSave={setShowcasedIds}
      />
    </ScrollArea>
  );
}
