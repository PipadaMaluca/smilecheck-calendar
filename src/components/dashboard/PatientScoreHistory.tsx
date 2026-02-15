import { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockScoreHistory, ConsultationScore } from '@/types/scoring';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export function PatientScoreHistory() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPoints = mockScoreHistory.reduce((sum, s) => sum + s.totalPoints, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{totalPoints} pontos</p>
          <p className="text-sm text-muted-foreground">Total acumulado</p>
        </div>
      </div>

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Histórico por consulta
        </h3>
        {mockScoreHistory.map((score) => (
          <ScoreCard
            key={score.id}
            score={score}
            isExpanded={expandedId === score.id}
            onToggle={() => setExpandedId(prev => prev === score.id ? null : score.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ score, isExpanded, onToggle }: { score: ConsultationScore; isExpanded: boolean; onToggle: () => void }) {
  const isPositive = score.totalPoints > 0;
  const isNegative = score.totalPoints < 0;
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors border-border hover:border-primary/30',
        isExpanded && 'border-primary/40'
      )}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            isPositive ? 'bg-primary/10' : isNegative ? 'bg-destructive/10' : 'bg-muted'
          )}>
            <Icon className={cn(
              'w-5 h-5',
              isPositive ? 'text-primary' : isNegative ? 'text-destructive' : 'text-muted-foreground'
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {format(score.date, "d MMM", { locale: pt })} - {score.dentistName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{score.clinicName}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-bold border-0',
                isPositive ? 'bg-primary/10 text-primary' : isNegative ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
              )}
            >
              {score.totalPoints >= 0 ? '+' : ''}{score.totalPoints} pts
            </Badge>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded breakdown */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-border space-y-2">
            {score.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={cn(
                  'font-medium',
                  item.points > 0 ? 'text-primary' : item.points < 0 ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  {item.points >= 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
