import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/calendar';
import { USER_POINTS, getLevelForXP, getXPProgress, LEVELS, getEarnActionsForRole, getPenaltyActionsForRole, getPointsHistoryForRole } from '@/data/pointsData';
import { format, isSameDay, isAfter, subWeeks, startOfMonth } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PontosTabProps {
  userRole: UserRole;
  onNavigate?: (tab: string) => void;
}

const DEMO_DATE = new Date(2026, 0, 31);

export function PontosTab({ userRole, onNavigate }: PontosTabProps) {
  const data = USER_POINTS[userRole];
  const level = getLevelForXP(data.xp);
  const xpProgress = getXPProgress(data.xp);
  const [historyFilter, setHistoryFilter] = useState<'todos' | 'ganhos' | 'perdidos'>('todos');
  const [periodFilter, setPeriodFilter] = useState<'hoje' | 'semana' | 'mes' | 'tudo'>('tudo');

  const earnActions = getEarnActionsForRole(userRole);
  const penaltyActions = getPenaltyActionsForRole(userRole);
  const pointsHistory = getPointsHistoryForRole(userRole);

  const planLabel = data.plan === 'free' ? 'Plano Free — Reset a 1 Jan 2027' :
    data.plan === 'pro' ? 'Plano Pro — Sem reset anual' :
    'Plano Premium — Sem reset + 10% bónus';

  const filteredHistory = pointsHistory.filter(entry => {
    if (historyFilter === 'ganhos' && entry.points <= 0) return false;
    if (historyFilter === 'perdidos' && entry.points >= 0) return false;
    if (periodFilter === 'hoje' && !isSameDay(entry.date, DEMO_DATE)) return false;
    if (periodFilter === 'semana' && !isAfter(entry.date, subWeeks(DEMO_DATE, 1))) return false;
    if (periodFilter === 'mes' && !isAfter(entry.date, startOfMonth(DEMO_DATE))) return false;
    return true;
  });

  const roleLabel = userRole === 'patient' ? 'Paciente (2x)' : userRole === 'dentist' ? 'Dentista' : 'Clínica';

  return (
    <div className="space-y-6">
      {/* Section A — Nível e Experiência */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{level.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">{level.name}</h3>
              <p className="text-2xl font-bold text-primary">{data.xp.toLocaleString()} XP</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{data.xp.toLocaleString()} XP</span>
              <span>{xpProgress.target.toLocaleString()} XP</span>
            </div>
            <Progress value={xpProgress.percent} className="h-3" />
            {xpProgress.nextLevelName && (
              <p className="text-xs text-muted-foreground">
                Faltam <span className="font-bold text-primary">{xpProgress.remaining.toLocaleString()} XP</span> para {xpProgress.nextLevelName}
              </p>
            )}
          </div>

          {/* Level path */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {LEVELS.map((l, i) => {
              const isCurrent = l.key === level.key;
              const isPast = data.xp >= l.minXP && l.key !== level.key;
              return (
                <div key={l.key} className="flex items-center">
                  <div className={cn(
                    'flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all min-w-[50px]',
                    isCurrent ? `${l.bgColor} ${l.borderColor} border-2` : isPast ? 'opacity-60' : 'opacity-30'
                  )}>
                    <span className="text-lg">{l.icon}</span>
                    <span className={cn('text-[9px] font-bold', isCurrent ? l.color : 'text-muted-foreground')}>{l.name}</span>
                  </div>
                  {i < LEVELS.length - 1 && <div className={cn('w-3 h-0.5 mx-0.5', isPast || isCurrent ? 'bg-primary' : 'bg-muted')} />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section B — Pontos de Recompensa */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.rewardPoints.toLocaleString()} pts disponíveis</p>
              <p className="text-xs text-muted-foreground">{planLabel}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onNavigate?.('loja')}>
            Trocar na Loja →
          </Button>
        </CardContent>
      </Card>

      {/* Section C — Como Funciona */}
      <Accordion type="single" collapsible>
        <AccordionItem value="como-funciona">
          <AccordionTrigger className="text-sm font-semibold">
            Como funcionam os pontos no SmileCheck?
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">XP (Experiência)</h4>
                <p className="text-xs text-muted-foreground">
                  Cada ação positiva ganha XP que nunca são perdidos. O XP define o seu nível e posição nos rankings.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">Pontos de Recompensa</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Ganha pontos da mesma forma que XP. Use-os para trocar por recompensas na Loja.
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• <span className="font-medium">Plano Free:</span> reset anual a 1 de janeiro</p>
                  <p>• <span className="font-medium">Plano Pro:</span> pontos mantidos sem reset</p>
                  <p>• <span className="font-medium">Plano Premium:</span> pontos mantidos + 10% bónus no fim do ano</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">Como ganhar pontos — {roleLabel}</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr_60px_60px] gap-0 bg-muted/50 px-3 py-2 text-[10px] font-semibold text-muted-foreground border-b border-border">
                    <span>Ação</span>
                    <span className="text-center">XP</span>
                    <span className="text-center">Pontos</span>
                  </div>
                  {earnActions.map((a, i) => (
                    <div key={i} className="grid grid-cols-[1fr_60px_60px] gap-0 px-3 py-1.5 text-xs border-b border-border/50 last:border-0">
                      <span className="text-foreground">{a.action}</span>
                      <span className="text-center text-primary font-medium">+{a.xp}</span>
                      <span className="text-center text-primary font-medium">+{a.points}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">Penalizações</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr_60px_60px] gap-0 bg-muted/50 px-3 py-2 text-[10px] font-semibold text-muted-foreground border-b border-border">
                    <span>Ação</span>
                    <span className="text-center">XP</span>
                    <span className="text-center">Pontos</span>
                  </div>
                  {penaltyActions.map((a, i) => (
                    <div key={i} className="grid grid-cols-[1fr_60px_60px] gap-0 px-3 py-1.5 text-xs border-b border-border/50 last:border-0">
                      <span className="text-foreground">{a.action}</span>
                      <span className="text-center text-muted-foreground">0</span>
                      <span className="text-center text-destructive font-medium">{a.points}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 italic">
                  Nota: O XP nunca diminui — apenas os pontos de recompensa são penalizados.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-bold text-foreground mb-2">Regras Anti-Fraude</h4>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>📱 Verificação telefónica obrigatória para todas as contas</p>
                  <p>📊 Limite de 40 avaliações por dia</p>
                  <p>⚖️ Contestação sempre disponível para avaliações injustas</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Section D — Histórico de Pontos */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">Histórico de Pontos Recebidos</h3>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            {(['todos', 'ganhos', 'perdidos'] as const).map(f => (
              <Button
                key={f}
                variant={historyFilter === f ? 'default' : 'outline'}
                size="sm"
                className="text-[10px] h-7 px-2.5"
                onClick={() => setHistoryFilter(f)}
              >
                {f === 'todos' ? 'Todos' : f === 'ganhos' ? 'Ganhos' : 'Perdidos'}
              </Button>
            ))}
          </div>
          <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as any)}>
            <SelectTrigger className="w-[130px] h-7 text-[10px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mês</SelectItem>
              <SelectItem value="tudo">Tudo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          {filteredHistory.map(entry => {
            const isToday = isSameDay(entry.date, DEMO_DATE);
            const dateLabel = isToday ? 'Hoje' : format(entry.date, "d MMM", { locale: pt });
            return (
              <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">
                    <span className="text-muted-foreground">{dateLabel}, {entry.time}</span>
                    {' — '}
                    {entry.description}
                    {entry.relatedName && <span className="text-muted-foreground"> ({entry.relatedName})</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.xp > 0 && (
                    <span className="text-[10px] font-bold text-primary">+{entry.xp} XP</span>
                  )}
                  <span className={cn(
                    'text-[10px] font-bold',
                    entry.points > 0 ? 'text-emerald-400' : entry.points < 0 ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {entry.points > 0 ? '+' : ''}{entry.points} pts
                  </span>
                </div>
              </div>
            );
          })}
          {filteredHistory.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Sem resultados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
