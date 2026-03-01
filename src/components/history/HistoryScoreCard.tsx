import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConsultationScore } from '@/types/scoring';
import { CATEGORY_COLORS, CATEGORY_LABELS, ConsultationCategory, UserRole } from '@/types/calendar';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface HistoryScoreCardProps {
  score: ConsultationScore;
  isExpanded: boolean;
  onToggle: () => void;
  onGiveFeedback?: () => void;
  userRole: UserRole;
}

export function HistoryScoreCard({ score, isExpanded, onToggle, onGiveFeedback, userRole }: HistoryScoreCardProps) {
  const isPositive = score.totalPoints > 0;
  const isNegative = score.totalPoints < 0;
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const isPending = score.feedbackStatus === 'pending';
  const isExpired = score.feedbackStatus === 'expired';

  const catKey = score.category as ConsultationCategory | undefined;
  const catColor = catKey ? CATEGORY_COLORS[catKey] : null;
  const catLabel = catKey ? CATEGORY_LABELS[catKey] : null;

  // Main line: date + primary name
  const dateStr = score.consultationTime
    ? `${score.consultationTime}`
    : format(score.date, "d MMM", { locale: pt });

  const renderPrimaryName = () => {
    if (userRole === 'patient') {
      return <ClickableDentistName name={score.dentistName} className="text-sm font-medium text-foreground" />;
    }
    if (userRole === 'dentist' || userRole === 'clinic') {
      return score.patientName
        ? <ClickablePatientName name={score.patientName} className="text-sm font-medium text-foreground" />
        : <span className="text-sm font-medium text-foreground">{score.dentistName}</span>;
    }
    return null;
  };

  // Second line: category badge + dentist (for clinic) + status badge
  const renderSecondLine = () => (
    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
      {catLabel && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-0" style={{ backgroundColor: `${catColor?.hex}20`, color: catColor?.hex }}>
          {catLabel}
        </Badge>
      )}
      {userRole === 'clinic' && (
        <ClickableDentistName name={score.dentistName} className="text-[11px] text-muted-foreground" />
      )}
      {!catLabel && !score.category && (
        <p className="text-xs text-muted-foreground truncate">{score.clinicName}</p>
      )}
      {isPending && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-600 bg-amber-500/10">
          <Clock className="w-2.5 h-2.5 mr-0.5" /> Pendente
        </Badge>
      )}
      {score.feedbackStatus === 'completed' && score.totalPoints < 0 && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-destructive/30 text-destructive bg-destructive/10">
          <AlertCircle className="w-2.5 h-2.5 mr-0.5" /> Falta
        </Badge>
      )}
      {score.feedbackStatus === 'completed' && score.totalPoints >= 0 && (
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
  );

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
            <Icon className={cn('w-5 h-5', isPositive ? 'text-primary' : isNegative ? 'text-destructive' : 'text-muted-foreground')} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {dateStr} — {renderPrimaryName()}
            </p>
            {renderSecondLine()}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-bold border-0',
                isPending ? 'bg-amber-500/10 text-amber-600'
                  : isPositive ? 'bg-primary/10 text-primary'
                  : isNegative ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {score.totalPoints >= 0 ? '+' : ''}{score.totalPoints} pts
            </Badge>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-border space-y-3">
            <div className="space-y-2">
              {score.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={cn('font-medium', item.points > 0 ? 'text-primary' : item.points < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                    {item.points >= 0 ? '+' : ''}{item.points}
                  </span>
                </div>
              ))}
            </div>
            {score.patientFeedback && (
              <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Avaliação</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={cn('w-3.5 h-3.5', s <= score.patientFeedback!.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20')} />
                  ))}
                </div>
                {score.patientFeedback.comment && <p className="text-xs text-muted-foreground italic">"{score.patientFeedback.comment}"</p>}
              </div>
            )}
            {isPending && onGiveFeedback && (
              <Button size="sm" className="w-full h-8 text-xs" onClick={(e) => { e.stopPropagation(); onGiveFeedback(); }}>
                <Star className="w-3.5 h-3.5 mr-1" /> Dar Feedback para receber pontos
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
