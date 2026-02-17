import { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Clock, CheckCircle, Star, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockScoreHistory, ConsultationScore } from '@/types/scoring';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { PatientFeedbackModal } from '@/components/calendar/PatientFeedbackModal';

export function PatientScoreHistory() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scores, setScores] = useState(mockScoreHistory);
  const [feedbackScore, setFeedbackScore] = useState<ConsultationScore | null>(null);

  const completedPoints = scores
    .filter(s => s.feedbackStatus === 'completed')
    .reduce((sum, s) => sum + s.totalPoints, 0);

  const pendingScores = scores.filter(s => s.feedbackStatus === 'pending');
  const pendingPoints = pendingScores.reduce((sum, s) => sum + s.totalPoints, 0);

  const handlePatientFeedback = (scoreId: string, rating: number, comment: string) => {
    setScores(prev => prev.map(s =>
      s.id === scoreId
        ? { ...s, feedbackStatus: 'completed' as const, patientFeedback: { rating, comment: comment || undefined, submittedAt: new Date() } }
        : s
    ));
    setFeedbackScore(null);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{completedPoints} pontos</p>
          <p className="text-sm text-muted-foreground">Total acumulado</p>
        </div>
      </div>

      {/* Pending feedback section */}
      {pendingScores.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-foreground">Pontos Pendentes</h3>
              <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 bg-amber-500/10">
                +{pendingPoints} pts
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Dê o seu feedback para receber os pontos!
            </p>
            {pendingScores.map((score) => (
              <div key={score.id} className="flex items-center justify-between py-2 border-t border-border/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {format(score.date, "d MMM", { locale: pt })} - {score.dentistName}
                  </p>
                  <p className="text-xs text-muted-foreground">{score.clinicName}</p>
                </div>
                <Button
                  size="sm"
                  className="h-7 text-xs flex-shrink-0"
                  onClick={() => setFeedbackScore(score)}
                >
                  Dar Feedback
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Histórico por consulta
        </h3>
        {scores.map((score) => (
          <ScoreCard
            key={score.id}
            score={score}
            isExpanded={expandedId === score.id}
            onToggle={() => setExpandedId(prev => prev === score.id ? null : score.id)}
            onGiveFeedback={() => setFeedbackScore(score)}
          />
        ))}
      </div>

      {/* Patient feedback modal */}
      <PatientFeedbackModal
        score={feedbackScore}
        isOpen={!!feedbackScore}
        onClose={() => setFeedbackScore(null)}
        onSubmit={handlePatientFeedback}
      />
    </div>
  );
}

function ScoreCard({ score, isExpanded, onToggle, onGiveFeedback }: {
  score: ConsultationScore;
  isExpanded: boolean;
  onToggle: () => void;
  onGiveFeedback: () => void;
}) {
  const isPositive = score.totalPoints > 0;
  const isNegative = score.totalPoints < 0;
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const isPending = score.feedbackStatus === 'pending';
  const isExpired = score.feedbackStatus === 'expired';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors border-border hover:border-primary/30',
        isExpanded && 'border-primary/40',
        isPending && 'border-amber-500/20'
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
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-muted-foreground truncate">{score.clinicName}</p>
              {isPending && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-600 bg-amber-500/10">
                  <Clock className="w-2.5 h-2.5 mr-0.5" /> Pendente
                </Badge>
              )}
              {score.feedbackStatus === 'completed' && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/10">
                  <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Concluído
                </Badge>
              )}
              {isExpired && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground bg-muted">
                  <AlertCircle className="w-2.5 h-2.5 mr-0.5" /> Expirado
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-bold border-0',
                isPending
                  ? 'bg-amber-500/10 text-amber-600'
                  : isPositive ? 'bg-primary/10 text-primary'
                  : isNegative ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-muted-foreground'
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
          <div className="mt-4 pt-3 border-t border-border space-y-3">
            {/* Points breakdown */}
            <div className="space-y-2">
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

            {/* Patient's own feedback display (after submitted) */}
            {score.patientFeedback && (
              <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">A sua avaliação</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={cn('w-3.5 h-3.5', s <= score.patientFeedback!.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20')} />
                  ))}
                </div>
                {score.patientFeedback.comment && (
                  <p className="text-xs text-muted-foreground italic">"{score.patientFeedback.comment}"</p>
                )}
              </div>
            )}

            {/* Give feedback button if pending */}
            {isPending && (
              <Button
                size="sm"
                className="w-full h-8 text-xs"
                onClick={(e) => { e.stopPropagation(); onGiveFeedback(); }}
              >
                <Star className="w-3.5 h-3.5 mr-1" /> Dar Feedback para receber pontos
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
