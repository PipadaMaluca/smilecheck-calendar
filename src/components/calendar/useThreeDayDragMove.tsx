import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { Consultation } from '@/types/calendar';
import { useAppointmentActions } from '@/data/appointmentActions';
import { MoveConsultationModal, OverlapWarningModal, DragMoveInfo } from './MoveConsultationModal';

/**
 * Drag-and-drop for the 3-day view — same rules/feedback as Day/Week:
 * overlap → OverlapWarningModal, otherwise DE/PARA confirmation, then
 * `rescheduleConsultation` (server RPC enforces future slot / no overlap / role).
 */
export function useThreeDayDragMove(agendaConsultations: Consultation[], canMove: boolean) {
  const { t } = useTranslation();
  const { rescheduleConsultation } = useAppointmentActions();
  const [pendingMove, setPendingMove] = useState<DragMoveInfo | null>(null);
  const [overlap, setOverlap] = useState<Consultation | null>(null);
  const [pendingOverlapMove, setPendingOverlapMove] = useState<DragMoveInfo | null>(null);

  const onDragMove = useCallback((c: Consultation, fromDate: Date, fromTime: string, toDate: Date, toTime: string) => {
    if (!canMove) return;
    if (isSameDay(fromDate, toDate) && fromTime === toTime) return;
    const [h, m] = toTime.split(':').map(Number);
    const target = new Date(toDate); target.setHours(h, m, 0, 0);
    if (target.getTime() < Date.now()) { toast.error(t('sweep.calendar.pastSlot', { defaultValue: t('common.error') })); return; }
    const info: DragMoveInfo = {
      consultation: c, fromDate, fromTime, fromDentistName: c.dentist.name,
      toDate, toTime, toDentistName: c.dentist.name, toDentistKey: `${c.clinic.id}-${c.dentist.id}`,
    };
    const existing = agendaConsultations.find((x) => x.id !== c.id && isSameDay(x.date, toDate) && x.time === toTime
      && x.dentist.id === c.dentist.id && x.clinic.id === c.clinic.id);
    if (existing) { setOverlap(existing); setPendingOverlapMove(info); } else setPendingMove(info);
  }, [agendaConsultations, canMove, t]);

  const modals = (
    <>
      <MoveConsultationModal moveInfo={pendingMove} isOpen={!!pendingMove} onClose={() => setPendingMove(null)}
        onConfirm={async (info) => {
          const ok = await rescheduleConsultation(info.consultation, { date: info.toDate, time: info.toTime });
          if (ok) toast.success(t('sweep.calendar.movedTo', { name: info.consultation.patient.name, time: info.toTime }));
          setPendingMove(null);
        }} />
      <OverlapWarningModal isOpen={!!overlap} existingConsultation={overlap}
        onClose={() => { setOverlap(null); setPendingOverlapMove(null); }}
        onConfirm={() => {
          if (pendingOverlapMove) toast.success(t('sweep.calendar.overlapScheduled', { time: pendingOverlapMove.toTime }));
          setOverlap(null); setPendingOverlapMove(null);
        }} />
    </>
  );
  return { onDragMove, modals };
}
