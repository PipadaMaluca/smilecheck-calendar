import { useState, useMemo } from 'react';
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
import { awardFeedbackPoints, resolveFeedbackTargetProfileId } from '@/data/pointsWrites';

interface PendingFeedbackCardProps {
  userRole: UserRole;
}

export function PendingFeedbackCard({ userRole }: PendingFeedbackCardProps) {
  const { t } = useTranslation();
  const initial = useMemo(() => getPendingForRole(userRole), [userRole]);
  const [items, setItems] = useState<PendingFeedbackItem[]>(initial);
  const [activeItem, setActiveItem] = useState<PendingFeedbackItem | null>(null);
  const { demoMode, user } = useAuth();
  const refreshPoints = usePointsRefresh();

  const handleSubmit = (rating: number, _comment: string) => {
    if (!activeItem) return;
    const item = activeItem;
    // Remove the submitted item from pending list
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    // Real users: the rating points go to the person being rated, awarded
    // server-side. Demo mode keeps the mock behaviour with zero DB writes.
    if (demoMode || !user) return;
    void (async () => {
      const targetProfileId = await resolveFeedbackTargetProfileId(
        item.targetRole,
        item.targetId,
        item.targetName
      );
      if (!targetProfileId) return;
      await awardFeedbackPoints(targetProfileId, rating);
      refreshPoints();
    })();
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