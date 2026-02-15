import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Consultation } from '@/types/calendar';
import { FEEDBACK_CHECKBOXES, FeedbackCheckbox } from '@/types/scoring';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DentistFeedbackModalProps {
  consultation: Consultation | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (consultationId: string, checkedIds: string[], totalPoints: number) => void;
}

export function DentistFeedbackModal({ consultation, isOpen, onClose, onSubmit }: DentistFeedbackModalProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>(['compareceu']);

  const isUrgent = consultation?.category === 'urgencia' || consultation?.isUrgentTeleconsulta;

  const visibleCheckboxes = useMemo(() => {
    return FEEDBACK_CHECKBOXES.filter(cb => !cb.urgencyOnly || isUrgent);
  }, [isUrgent]);

  const totalPoints = useMemo(() => {
    return visibleCheckboxes
      .filter(cb => checkedIds.includes(cb.id))
      .reduce((sum, cb) => sum + cb.points, 0);
  }, [checkedIds, visibleCheckboxes]);

  const handleToggle = (id: string) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!consultation) return;
    onSubmit(consultation.id, checkedIds, totalPoints);
    toast.success(`Feedback submetido: ${totalPoints >= 0 ? '+' : ''}${totalPoints} pontos`);
    setCheckedIds(['compareceu']);
    onClose();
  };

  if (!consultation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Feedback do Paciente</DialogTitle>
          <DialogDescription>
            Avalie {consultation.patient.name} após a consulta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Patient info */}
          <div className="bg-secondary/30 rounded-lg p-3">
            <p className="text-sm font-medium text-foreground">{consultation.patient.name}</p>
            <p className="text-xs text-muted-foreground">{consultation.time} • {consultation.clinic.name}</p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            {visibleCheckboxes.map((cb) => (
              <label
                key={cb.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  checkedIds.includes(cb.id)
                    ? cb.isNegative
                      ? 'border-destructive/50 bg-destructive/10'
                      : 'border-primary/50 bg-primary/10'
                    : 'border-border hover:bg-accent/30'
                )}
              >
                <Checkbox
                  checked={checkedIds.includes(cb.id)}
                  onCheckedChange={() => handleToggle(cb.id)}
                />
                <span className="text-sm flex-1">{cb.label}</span>
                <span className={cn(
                  'text-xs font-bold',
                  cb.isNegative ? 'text-destructive' : 'text-primary'
                )}>
                  {cb.points >= 0 ? '+' : ''}{cb.points} pts
                </span>
              </label>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
            <span className="text-sm font-medium">Pontuação:</span>
            <span className={cn(
              'text-xl font-bold',
              totalPoints > 0 ? 'text-primary' : totalPoints < 0 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {totalPoints >= 0 ? '+' : ''}{totalPoints} pontos
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Submeter Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
