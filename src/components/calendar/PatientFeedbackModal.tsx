import { useState } from 'react';
import { Glyph } from '@/components/ui/glyph';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConsultationScore } from '@/types/scoring';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt, enUS, fr } from 'date-fns/locale';

const dateLocales = { pt, en: enUS, fr } as const;

function StarRating({ value, hovered, onRate, onHover, onLeave }: {
  value: number;
  hovered: number;
  onRate: (v: number) => void;
  onHover: (v: number) => void;
  onLeave: () => void;
}) {
  const display = hovered || value;
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              'w-8 h-8 transition-colors',
              star <= display
                ? 'text-warning fill-amber-400'
                : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function PatientFeedbackModal({ score, isOpen, onClose, onSubmit }: {
  score: ConsultationScore | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scoreId: string, rating: number, comment: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = dateLocales[i18n.language as keyof typeof dateLocales] || pt;
  const ratingLabels = ['', t('feedback.bad'), t('feedback.fair'), t('feedback.good'), t('feedback.veryGood'), t('feedback.excellent')];

  const [dentistRating, setDentistRating] = useState(0);
  const [dentistHover, setDentistHover] = useState(0);
  const [dentistComment, setDentistComment] = useState('');

  const [clinicRating, setClinicRating] = useState(0);
  const [clinicHover, setClinicHover] = useState(0);
  const [clinicComment, setClinicComment] = useState('');

  const handleSubmit = () => {
    if (!score || dentistRating === 0) return;
    onSubmit(score.id, dentistRating, dentistComment);
    toast.success(t('feedback.ratingSent'));
    setDentistRating(0);
    setDentistHover(0);
    setDentistComment('');
    setClinicRating(0);
    setClinicHover(0);
    setClinicComment('');
    onClose();
  };

  if (!score) return null;

  const dentistDisplay = dentistHover || dentistRating;
  const clinicDisplay = clinicHover || clinicRating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('feedback.rateConsultation')}</DialogTitle>
          <DialogDescription>
            {t('feedback.giveFeedback')} {format(score.date, "d MMMM", { locale })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t('feedback.howRateDentist')} {score.dentistName}?</p>
            <p className="text-[11px] text-muted-foreground">{t('feedback.scaleHint')}</p>
            <StarRating
              value={dentistRating}
              hovered={dentistHover}
              onRate={setDentistRating}
              onHover={setDentistHover}
              onLeave={() => setDentistHover(0)}
            />
            {dentistDisplay > 0 && (
              <p className="text-xs text-center text-muted-foreground">{ratingLabels[dentistDisplay]}</p>
            )}
            <Textarea
              value={dentistComment}
              onChange={(e) => setDentistComment(e.target.value)}
              placeholder={t('feedback.observationsDentist')}
              className="resize-none"
              rows={2}
            />
            <p className="text-[11px] text-muted-foreground">
<Glyph emoji="✏️" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{t('feedback.editableUntil')}</p>
          </div>

          <div className="border-t border-border" />

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t('feedback.howRateClinic')} {score.clinicName}?</p>
            <p className="text-[11px] text-muted-foreground">{t('feedback.scaleHint')}</p>
            <StarRating
              value={clinicRating}
              hovered={clinicHover}
              onRate={setClinicRating}
              onHover={setClinicHover}
              onLeave={() => setClinicHover(0)}
            />
            {clinicDisplay > 0 && (
              <p className="text-xs text-center text-muted-foreground">{ratingLabels[clinicDisplay]}</p>
            )}
            <Textarea
              value={clinicComment}
              onChange={(e) => setClinicComment(e.target.value)}
              placeholder={t('feedback.observationsClinic')}
              className="resize-none"
              rows={2}
            />
            <p className="text-[11px] text-muted-foreground">
<Glyph emoji="✏️" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{t('feedback.editableUntil')}</p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button className="w-full" onClick={handleSubmit} disabled={dentistRating === 0}>
              {t('feedback.sendRating')}
            </Button>
            <button
              className="text-xs text-muted-foreground hover:text-foreground text-center py-1"
              onClick={onClose}
            >
              {t('feedback.rateLater')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
