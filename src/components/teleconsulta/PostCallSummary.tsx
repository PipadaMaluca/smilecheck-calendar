import { useState } from 'react';
import { Star, Calendar, Clock, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PostCallSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  isDentist: boolean;
  remoteName: string;
  duration: string;
  onScheduleNext?: () => void;
}

export function PostCallSummary({ isOpen, onClose, isDentist, remoteName, duration, onScheduleNext }: PostCallSummaryProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState('Paciente refere dor no dente 36. Dor ao mastigar, especialmente alimentos frios. Recomendada radiografia periapical.');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [nextSteps, setNextSteps] = useState({
    schedule: false,
    sendPrescription: false,
    followUp: false,
  });
  const [customStep, setCustomStep] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ✅ {t('teleconsult.callEnded')}
          </DialogTitle>
          <DialogDescription>{t('teleconsult.summaryWith')} {remoteName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Duration */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" /> {t('teleconsult.duration')}: <span className="font-semibold text-foreground">{duration}</span>
            </div>
          </div>

          {isDentist ? (
            <>
              {/* Dentist: Notes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">{t('teleconsult.consultationNotes')}</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="min-h-[100px] bg-secondary/50 border-border text-sm"
                />
              </div>

              {/* Prescriptions issued */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">{t('teleconsult.prescriptionsIssued')}</label>
                <p className="text-sm text-muted-foreground italic">{t('teleconsult.noPrescriptions')}</p>
              </div>

              {/* Photos received */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">{t('teleconsult.photosReceived')}</label>
                <div className="flex gap-2">
                  {[1, 2].map(i => (
                    <div key={i} className="w-16 h-16 rounded-lg bg-secondary/50 border border-border flex items-center justify-center">
                      <Image className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Next steps */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase">{t('teleconsult.nextSteps')}</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={nextSteps.schedule} onCheckedChange={v => setNextSteps(p => ({ ...p, schedule: !!v }))} />
                    {t('teleconsult.scheduleNext')}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={nextSteps.sendPrescription} onCheckedChange={v => setNextSteps(p => ({ ...p, sendPrescription: !!v }))} />
                    {t('teleconsult.sendPrescription')}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={nextSteps.followUp} onCheckedChange={v => setNextSteps(p => ({ ...p, followUp: !!v }))} />
                    {t('teleconsult.followUp')}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  {t('teleconsult.saveAndClose')}
                </Button>
                <Button className="flex-1" onClick={() => { onClose(); onScheduleNext?.(); }}>
                  <Calendar className="w-4 h-4 mr-2" /> {t('teleconsult.scheduleNextBtn')}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Patient: Info */}
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  {t('teleconsult.patientInfo')}
                </p>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase">{t('teleconsult.rateConsultation')}</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star className={cn(
                        'w-8 h-8 transition-colors',
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">{t('teleconsult.commentOptional')}</label>
                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={t('teleconsult.commentPlaceholder')}
                  className="min-h-[80px] bg-secondary/50 border-border text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={onClose}>
                  {t('common.close')}
                </Button>
                <Button className="flex-1" onClick={onClose} disabled={rating === 0}>
                  {t('teleconsult.submitRating')}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
