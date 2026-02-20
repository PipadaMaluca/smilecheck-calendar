import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Consultation, CATEGORY_LABELS } from '@/types/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarDays, User } from 'lucide-react';

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
  if (!moveInfo) return null;

  const { consultation, fromDate, fromTime, fromDentistName, toDate, toTime, toDentistName } = moveInfo;
  const category = consultation.category || 'restauracao';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Mover Consulta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Patient info */}
          <div className="space-y-1">
            <p className="text-sm font-medium">Paciente: <span className="font-bold">{consultation.patient.name}</span></p>
            <p className="text-sm text-muted-foreground">Tipo: {CATEGORY_LABELS[category]}</p>
          </div>

          {/* From */}
          <div className="bg-destructive/10 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold text-destructive uppercase">De:</p>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span>{format(fromDate, "d MMM yyyy", { locale: pt })}, {fromTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{fromDentistName}</span>
            </div>
          </div>

          {/* To */}
          <div className="bg-primary/10 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold text-primary uppercase">Para:</p>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span>{format(toDate, "d MMM yyyy", { locale: pt })}, {toTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{toDentistName}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(moveInfo)}>Guardar Alterações</Button>
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
  if (!existingConsultation) return null;

  const category = existingConsultation.category || 'restauracao';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <span className="text-amber-500">⚠️</span> Horário Ocupado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">Já existe uma consulta neste horário:</p>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-sm font-medium">
              {existingConsultation.time} - {existingConsultation.patient.name} ({CATEGORY_LABELS[category]})
            </p>
          </div>
          <p className="text-sm text-muted-foreground">Deseja agendar mesmo assim?</p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="default" onClick={onConfirm}>Agendar Mesmo Assim</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
