import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  pointsForStars,
  FEEDBACK_GIVER_REWARD,
  FeedbackTargetRole,
} from '@/data/bidirectionalFeedback';

const COMMENT_LIMIT = 300;

export interface BidirectionalFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetRole: FeedbackTargetRole;
  /** Subline shown under the target name (e.g. clinic name or consultation type) */
  contextLabel?: string;
  onSubmit: (rating: number, comment: string) => void | Promise<{ ok: boolean; error?: string } | void>;
}

export function BidirectionalFeedbackModal({
  isOpen,
  onClose,
  targetName,
  targetRole,
  contextLabel,
  onSubmit,
}: BidirectionalFeedbackModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [showFloater, setShowFloater] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHover(0);
      setComment('');
      setShowFloater(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const display = hover || rating;
  const targetPoints = pointsForStars(rating);

  const roleBadgeKey =
    targetRole === 'patient' ? 'bidirectionalFeedback.rolePatient'
    : targetRole === 'dentist' ? 'bidirectionalFeedback.roleDentist'
    : 'bidirectionalFeedback.roleClinic';

  const initials = targetName
    .replace(/^Dr[a]?\.?\s+/i, '')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSubmit = async () => {
    if (rating === 0 || isSubmitting) return;
    setIsSubmitting(true);
    const result = await onSubmit(rating, comment.trim());
    setIsSubmitting(false);
    if (result && result.ok === false) {
      toast.error(result.error || t('bidirectionalFeedback.saveFailed'));
      return;
    }
    setShowFloater(true);
    toast.success(t('bidirectionalFeedback.sentToast'));
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
              {initials}
            </div>
            <div className="flex flex-col items-start">
              <span>{t('bidirectionalFeedback.rate')} {targetName}</span>
              <Badge variant="outline" className="text-[11px] mt-0.5 font-normal">
                {t(roleBadgeKey)}
              </Badge>
            </div>
          </DialogTitle>
          {contextLabel && (
            <DialogDescription>{contextLabel}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Star selector */}
          <div className="flex items-center justify-center gap-2 py-2 relative">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`${s} stars`}
              >
                <Star
                  className={cn(
                    'w-9 h-9 transition-colors',
                    s <= display ? 'text-warning fill-amber-400' : 'text-muted-foreground/30',
                  )}
                  style={s <= display ? { color: '#FFD700', fill: '#FFD700' } : undefined}
                />
              </button>
            ))}
            {showFloater && (
              <span className="pointer-events-none absolute right-2 -top-2 text-sm font-bold text-success animate-fade-in"
                style={{ animation: 'floatUp 900ms ease-out forwards' }}>
                +{FEEDBACK_GIVER_REWARD} pts
              </span>
            )}
          </div>

          {/* Points preview */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center space-y-1">
            {rating > 0 ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {t('bidirectionalFeedback.willGive', { points: targetPoints, name: targetName })}
                </p>
                <p className="text-[11px] text-emerald-500">
                  +{FEEDBACK_GIVER_REWARD} pts {t('bidirectionalFeedback.giverReward')}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t('bidirectionalFeedback.selectStarsHint')}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, COMMENT_LIMIT))}
              placeholder={t('bidirectionalFeedback.commentPlaceholder')}
              className="resize-none"
              rows={3}
            />
            <div className="flex justify-end text-[11px] text-muted-foreground">
              {comment.length}/{COMMENT_LIMIT}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button className="w-full min-h-[44px]" onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
              {t('bidirectionalFeedback.send')}
            </Button>
            <button
              className="text-xs text-muted-foreground hover:text-foreground text-center py-2 min-h-[44px]"
              onClick={onClose}
            >
              {t('bidirectionalFeedback.later')}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes floatUp {
            0% { opacity: 0; transform: translateY(0); }
            20% { opacity: 1; }
            100% { opacity: 0; transform: translateY(-30px); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}