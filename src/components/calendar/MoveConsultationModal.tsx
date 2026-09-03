import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Glyph } from '@/components/ui/glyph';
import { Button } from '@/components/ui/button';
import { Consultation, getCategoryLabel } from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { pt, enUS, fr } from 'date-fns/locale';
import { CalendarDays, User } from 'lucide-react';

const dateLocales = { pt, en: enUS, fr } as const;

export interface DragMoveInfo {
  consultation: Consultation;
  fromDate: Date;
  fromTime: string;
  fromDentistName: string;
  toDate: Date;
  toTime: string;
  toDentistName: string;
  toDentistKey?: string;
}

interface MoveConsultationModalProps {
  moveInfo: DragMoveInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (moveInfo: DragMoveInfo) => void;
}

export function MoveConsultationModal({ moveInfo, isOpen, onClose, onConfirm }: MoveConsultationModalProps) {
  const { t, i18n } = useTranslation();
  const locale = dateLocales[i18n.language] || pt;
  if (!moveInfo) return null;

  const { consultation, fromDate, fromTime, fromDentistName, toDate, toTime, toDentistName } = moveInfo;
  const category = consultation.category || 'restauracao';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{t('agenda.moveConsultation')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">{t('agenda.patient')}: <span className="font-bold">{consultation.patient.name}</span></p>
            <p className="text-sm text-muted-foreground">{t('agenda.type')}: {getCategoryLabel(t, category)}</p>
          </div>

          <div className="bg-destructive/10 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold text-destructive uppercase">{t('agenda.from')}:</p>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span>{format(fromDate, "d MMM yyyy", { locale })}, {fromTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{fromDentistName}</span>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold text-primary uppercase">{t('agenda.to')}:</p>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span>{format(toDate, "d MMM yyyy", { locale })}, {toTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{toDentistName}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={() => onConfirm(moveInfo)}>{t('agenda.saveChanges')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface OverlapWarningModalProps {
  isOpen: boolean;
  existingConsultation: Consultation | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function OverlapWarningModal({ isOpen, existingConsultation, onClose, onConfirm }: OverlapWarningModalProps) {
  const { t } = useTranslation();
  if (!existingConsultation) return null;

  const category = existingConsultation.category || 'restauracao';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Glyph emoji="⚠️" className="w-5 h-5 text-amber-500" /> {t('agenda.slotOccupied')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">{t('agenda.existingConsultation')}:</p>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-sm font-medium">
              {existingConsultation.time} - {existingConsultation.patient.name} ({getCategoryLabel(t, category)})
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{t('agenda.confirmScheduleAnyway')}</p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="default" onClick={onConfirm}>{t('agenda.scheduleAnyway')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
