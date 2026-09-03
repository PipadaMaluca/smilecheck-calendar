import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Hourglass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockScoreHistory, mockDentistScoreHistory, mockClinicScoreHistory, ConsultationScore } from '@/types/scoring';
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
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const initialScores = userRole === 'dentist' ? mockDentistScoreHistory : userRole === 'clinic' ? mockClinicScoreHistory : mockScoreHistory;
  const [scores, setScores] = useState(initialScores);
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

  const historyTitle = userRole === 'patient' ? t('dashboard.historyPatient')
    : userRole === 'dentist' ? t('dashboard.history')
    : t('dashboard.historyClinic');

  return (
    <div className="space-y-6">
      {showSummary && (
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{completedPoints} {t('points.availablePoints').split(' ').pop()}</p>
            <p className="text-sm text-muted-foreground">{t('dashboard.totalAccumulated')}</p>
          </div>
        </div>
      )}

      {showPending && pendingScores.length > 0 && (
        <Card className="border-warning/30 bg-warning-surface/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-warning flex-shrink-0" />
              <h3 className="text-sm font-bold text-foreground">{t('dashboard.pendingPoints')}</h3>
              <Badge variant="outline" className="text-xs border-warning/30 text-warning bg-warning-surface/10">
                +{pendingPoints} pts
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.pendingFeedback')}
            </p>
            {pendingScores.map((score) => (
              <div key={score.id} className="flex items-center justify-between gap-3 py-2 border-t border-border/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {score.consultationTime || ''} - {score.dentistName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{score.clinicName}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs flex-shrink-0 border-warning/30 text-warning hover:bg-warning-surface/10 hover:text-warning"
                  onClick={() => setFeedbackScore(score)}
                >
                  {t('bidirectionalFeedback.rate')}
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
                {t('dashboard.viewFullHistory')} ›
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
              onContest={score.totalPoints < 0 ? () => {
                const event = new CustomEvent('smilecheck:navigate', { detail: 'contestacao' });
                window.dispatchEvent(event);
              } : undefined}
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
