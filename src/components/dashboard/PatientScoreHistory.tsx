import { useState } from 'react';
import { Trophy, Clock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockScoreHistory, ConsultationScore } from '@/types/scoring';
import { UserRole } from '@/types/calendar';
import { HistoryScoreCard } from '@/components/history/HistoryScoreCard';
import { PatientFeedbackModal } from '@/components/calendar/PatientFeedbackModal';

interface PatientScoreHistoryProps {
  mode?: 'full' | 'pending-only' | 'history-only';
  userRole?: UserRole;
  onNavigateHistory?: () => void;
  onViewFullHistory?: () => void;
}

export function PatientScoreHistory({ mode = 'full', userRole = 'patient', onNavigateHistory, onViewFullHistory }: PatientScoreHistoryProps) {
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

  const showSummary = mode === 'full';
  const showPending = mode === 'full' || mode === 'pending-only';
  const showHistory = mode === 'full' || mode === 'history-only';

  const historyTitle = userRole === 'patient' ? 'Histórico por Consulta'
    : userRole === 'dentist' ? 'Histórico de Consultas (e pontos)'
    : 'Histórico de Pacientes do Dia (e pontos)';

  return (
    <div className="space-y-6">
      {showSummary && (
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{completedPoints} pontos</p>
            <p className="text-sm text-muted-foreground">Total acumulado</p>
          </div>
        </div>
      )}

      {showPending && pendingScores.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
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
                    {score.consultationTime || ''} - {score.dentistName}
                  </p>
                  <p className="text-xs text-muted-foreground">{score.clinicName}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs flex-shrink-0 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                  onClick={() => setFeedbackScore(score)}
                >
                  Dar Feedback
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showHistory && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {historyTitle}
            </h3>
            {mode === 'history-only' && (
              <button className="text-xs text-primary hover:underline" onClick={onViewFullHistory || onNavigateHistory}>
                Ver Histórico Completo ›
              </button>
            )}
          </div>
          {scores.slice(0, 5).map((score) => (
            <HistoryScoreCard
              key={score.id}
              score={score}
              userRole={userRole}
              isExpanded={expandedId === score.id}
              onToggle={() => setExpandedId(prev => prev === score.id ? null : score.id)}
              onGiveFeedback={() => setFeedbackScore(score)}
            />
          ))}
        </div>
      )}

      <PatientFeedbackModal
        score={feedbackScore}
        isOpen={!!feedbackScore}
        onClose={() => setFeedbackScore(null)}
        onSubmit={handlePatientFeedback}
      />
    </div>
  );
}
