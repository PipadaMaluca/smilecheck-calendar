import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/calendar';
import {
  PendingFeedbackItem,
  getPendingForRole,
  FEEDBACK_GIVER_REWARD,
} from '@/data/bidirectionalFeedback';
import { BidirectionalFeedbackModal } from './BidirectionalFeedbackModal';
import { useAuth } from '@/contexts/AuthContext';
import { usePointsRefresh } from '@/data/pointsSource';
import { fetchPendingFeedback, submitFeedback } from '@/data/feedbackWrites';

interface PendingFeedbackCardProps {
  userRole: UserRole;
}

export function PendingFeedbackCard({ userRole }: PendingFeedbackCardProps) {
  const { t } = useTranslation();
  const mockItems = useMemo(() => getPendingForRole(userRole), [userRole]);
  const { demoMode, user } = useAuth();
  const isReal = !demoMode && !!user;
  const [items, setItems] = useState<PendingFeedbackItem[]>(isReal ? [] : mockItems);
  const [activeItem, setActiveItem] = useState<PendingFeedbackItem | null>(null);
  const refreshPoints = usePointsRefresh();

  // Real users: pending prompts come from completed appointments in the DB
  // (minus directions already rated). Demo mode stays on mock, zero requests.
  useEffect(() => {
    if (!isReal || !user) {
      setItems(mockItems);
      return;
    }
    let cancelled = false;
    void fetchPendingFeedback(user.id, userRole).then((rows) => {
      if (!cancelled) setItems(rows);
    });
    return () => { cancelled = true; };
  }, [isReal, user, userRole, mockItems]);

  const handleSubmit = async (rating: number, comment: string) => {
    if (!activeItem) return;
    const item = activeItem;

    // Demo mode: mock behaviour only, zero DB writes.
    if (!isReal || !user || !item.appointmentId || !item.targetProfileId) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      return;
    }

    const result = await submitFeedback({
      appointmentId: item.appointmentId,
      fromProfileId: user.id,
      toProfileId: item.targetProfileId,
      rating,
      comment,
    });

    if (!result.saved) {
      if (result.reason === 'already_rated') {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        return { ok: false, error: t('bidirectionalFeedback.alreadyRated') };
      }
      return {
        ok: false,
        error: result.reason === 'not_allowed'
          ? t('bidirectionalFeedback.notAllowed')
          : t('bidirectionalFeedback.saveFailed'),
      };
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
    refreshPoints();
    return { ok: true };
  };


  if (items.length === 0) return null;

  return (
    <>
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⏳</span>
            <h3 className="text-sm font-bold text-foreground">
              {t('bidirectionalFeedback.pendingTitle')}
            </h3>
            <Badge variant="outline" className="text-[11px] border-amber-500/30 text-amber-600 bg-amber-500/10">
              {items.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('bidirectionalFeedback.pendingHint')}
          </p>

          <div className="space-y-2">
            {items.map((item) => {
              const dateLabel = item.time
                ? `${item.time}`
                : item.date
                  ? item.date.toLocaleDateString()
                  : '';
              const titleKey =
                item.targetRole === 'patient' ? 'bidirectionalFeedback.evaluatePatient'
                : item.targetRole === 'dentist' ? 'bidirectionalFeedback.evaluateDentist'
                : 'bidirectionalFeedback.evaluateClinic';
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 py-2 border-t border-border/50 first:border-t-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {dateLabel && <span className="text-primary">{dateLabel} · </span>}
                      {t(titleKey, { name: item.targetName })}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.contextLabel || item.dentistName || item.consultationType || ''}
                      {' · '}
                      <span className="text-emerald-500">+{FEEDBACK_GIVER_REWARD} pts {t('bidirectionalFeedback.forYou')}</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs flex-shrink-0 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 min-h-[36px]"
                    onClick={() => setActiveItem(item)}
                  >
                    {t('bidirectionalFeedback.giveFeedback')}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <BidirectionalFeedbackModal
        isOpen={!!activeItem}
        onClose={() => setActiveItem(null)}
        targetName={activeItem?.targetName || ''}
        targetRole={activeItem?.targetRole || 'patient'}
        contextLabel={activeItem?.contextLabel || activeItem?.dentistName || activeItem?.consultationType}
        onSubmit={handleSubmit}
      />
    </>
  );
}