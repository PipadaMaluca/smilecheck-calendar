import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Consultation, getCategoryLabel } from '@/types/calendar';
import { format } from 'date-fns';
import { pt, enUS, fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RescheduleModalProps {
  consultation: Consultation;
  isOpen: boolean;
  onClose: () => void;
  rescheduleCount?: number;
}

const AVAILABLE_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
];

const OCCUPIED = ['09:30', '10:30', '14:30', '16:00'];

export function RescheduleModal({ consultation, isOpen, onClose, rescheduleCount = 0 }: RescheduleModalProps) {
  const { t, i18n } = useTranslation();
  const dateLoc = { pt, en: enUS, fr }[i18n.language] || pt;
  const [step, setStep] = useState<'datetime' | 'reason' | 'done'>('datetime');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const reasons = [
    t('consultationDetail.rescheduleModal.scheduleConflict'),
    t('consultationDetail.rescheduleModal.personalEmergency'),
    t('consultationDetail.rescheduleModal.preferOther'),
    t('consultationDetail.rescheduleModal.otherReason'),
  ];

  const handleSubmit = () => {
    toast.success(`📩 ${t('consultationDetail.rescheduleModal.requestSent')}`);
    setStep('done');
    setTimeout(() => {
      onClose();
      setStep('datetime');
      setSelectedDate(undefined);
      setSelectedTime(null);
      setReason('');
      setNotes('');
    }, 1500);
  };

  const canSubmit = selectedDate && selectedTime && reason;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto z-[70]">
        {step === 'done' ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">📩</div>
            <p className="text-lg font-semibold">{t('consultationDetail.rescheduleModal.requestSent')}</p>
            <p className="text-sm text-muted-foreground">{t('consultationDetail.rescheduleModal.dentistNotified')}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('consultationDetail.rescheduleModal.title')}</DialogTitle>
              <DialogDescription>
                {consultation.category ? getCategoryLabel(t, consultation.category) : t('consultationTypes.teleconsultation')} — {consultation.dentist?.name} — {format(consultation.date, "d MMMM", { locale: dateLoc })}, {consultation.time}
              </DialogDescription>
            </DialogHeader>

            {rescheduleCount > 0 && (
              <p className="text-xs text-muted-foreground">{t('consultationDetail.rescheduleModal.reschedulesLeft')}: {rescheduleCount}/2</p>
            )}

            {step === 'datetime' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3 pointer-events-auto rounded-xl border border-border bg-secondary"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      {t('consultationDetail.rescheduleModal.availableSlots')} — {format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {AVAILABLE_SLOTS.map(slot => {
                        const occupied = OCCUPIED.includes(slot);
                        const selected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            disabled={occupied}
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              'text-sm py-2 rounded-lg border transition-all',
                              occupied && 'opacity-40 cursor-not-allowed bg-muted border-border line-through',
                              !occupied && !selected && 'border-border bg-secondary hover:border-primary/50',
                              selected && 'border-primary bg-primary text-primary-foreground font-semibold'
                            )}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep('reason')}
                >
                  {t('common.next')}
                </Button>
              </div>
            )}

            {step === 'reason' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('consultationDetail.rescheduleModal.reason')}</Label>
                  <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                    {reasons.map(r => (
                      <div key={r} className="flex items-center space-x-2">
                        <RadioGroupItem value={r} id={`reason-${r}`} />
                        <Label htmlFor={`reason-${r}`} className="text-sm font-normal cursor-pointer">{r}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('consultationDetail.cancellationModal.observationsLabel')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span>
                  </Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('consultationDetail.cancellationModal.observations')}
                    className="min-h-[60px] bg-secondary/50 border-border text-sm"
                  />
                </div>

                <div className="bg-amber-500/10 rounded-lg p-3 text-sm text-amber-400 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{t('consultationDetail.rescheduleModal.warning')}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('datetime')}>
                    {t('common.back')}
                  </Button>
                  <Button className="flex-1" disabled={!canSubmit} onClick={handleSubmit}>
                    {t('consultationDetail.rescheduleModal.sendRequest')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
