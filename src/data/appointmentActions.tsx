import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Consultation, ConsultationCategory, ConsultationStatus } from '@/types/calendar';
import { useAgendaData } from '@/data/agendaSource';
import { usePointsRefresh } from '@/data/pointsSource';
import { awardStatusPoints } from '@/data/pointsWrites';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';
import {
  FreedSlot,
  SlotTakenError,
  WaitingMatch,
  assignWaitingMatch,
  cancelAppointment,
  findWaitingMatches,
  toUtcTimestamp,
  updateAppointment,
  updateAppointmentStatus,
} from '@/data/agendaWrites';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Database } from '@/integrations/supabase/types';

type DbConsultationType = Database['public']['Enums']['consultation_type'];

/** UI category -> backend consultation_type enum (reverse of the read mapping). */
const CATEGORY_TO_DB: Record<ConsultationCategory, DbConsultationType> = {
  primeira_consulta: 'primeira_consulta',
  destartarizacao: 'destartarizacao',
  cirurgia: 'cirurgia',
  endodontia: 'endodontia',
  odontopediatria: 'odontopediatria',
  ortodontia: 'ortodontia',
  protese: 'protese',
  restauracao: 'restauracao',
  urgencia: 'urgencia',
  teleconsulta: 'teleconsulta',
  outro: 'avaliacao',
};

export interface RescheduleInput {
  date?: Date;
  time?: string;
  duration?: number;
  category?: ConsultationCategory;
  notes?: string | null;
  isTeleconsultation?: boolean;
}

interface AppointmentActionsValue {
  isDemo: boolean;
  pending: boolean;
  /** Status change (agendada → confirmada → … → visto / falta). */
  changeStatus: (consultation: Consultation, status: ConsultationStatus) => Promise<boolean>;
  /** Edit / reschedule (time, duration, type, notes, drag-to-new-slot). */
  rescheduleConsultation: (consultation: Consultation, input: RescheduleInput) => Promise<boolean>;
  /** Soft cancel + waiting-list auto-match alert. */
  cancelConsultation: (consultation: Consultation) => Promise<boolean>;
}

const AppointmentActionsContext = createContext<AppointmentActionsValue | null>(null);

interface MatchState {
  matches: WaitingMatch[];
  slot: FreedSlot;
}

export function AppointmentActionsProvider({ children }: { children: React.ReactNode }) {
  const { isDemo, refresh } = useAgendaData();
  const { role } = useAuth();
  const refreshPoints = usePointsRefresh();
  const [pending, setPending] = useState(false);
  const [matchState, setMatchState] = useState<MatchState | null>(null);

  const changeStatus = useCallback<AppointmentActionsValue['changeStatus']>(
    async (consultation, status) => {
      if (isDemo) return true; // demo mode: mock only, zero DB writes
      setPending(true);
      try {
        await updateAppointmentStatus(consultation.id, status);
        refresh();
        // Points are written server-side by `award_points`; a failure there
        // must never make the status change look broken.
        await awardStatusPoints(consultation.id, status, role);
        refreshPoints();
        return true;
      } catch (e) {
        toast.error((e as Error)?.message ?? i18n.t('sweep.appointments.updateStatusError'));
        return false;
      } finally {
        setPending(false);
      }
    },
    [isDemo, refresh, refreshPoints, role]
  );

  const rescheduleConsultation = useCallback<AppointmentActionsValue['rescheduleConsultation']>(
    async (consultation, input) => {
      if (isDemo) return true;
      setPending(true);
      try {
        const date = input.date ?? consultation.date;
        const time = input.time ?? consultation.time;
        const category = input.category ?? consultation.category;
        await updateAppointment({
          id: consultation.id,
          scheduledAt: toUtcTimestamp(date, time),
          durationMinutes: input.duration ?? consultation.duration,
          consultationType: category ? CATEGORY_TO_DB[category] : undefined,
          isTeleconsultation:
            input.isTeleconsultation ?? (category ? category === 'teleconsulta' : undefined),
          notes: input.notes !== undefined ? input.notes : undefined,
        });
        refresh();
        return true;
      } catch (e) {
        if (e instanceof SlotTakenError) toast.error(i18n.t('sweep.appointments.slotTaken'));
        else toast.error((e as Error)?.message ?? i18n.t('sweep.appointments.rescheduleError'));
        return false;
      } finally {
        setPending(false);
      }
    },
    [isDemo, refresh]
  );

  const cancelConsultation = useCallback<AppointmentActionsValue['cancelConsultation']>(
    async (consultation) => {
      if (isDemo) return true;
      setPending(true);
      try {
        // Read the row first: the freed-slot details for the auto-match come
        // from the database, not from the mapped UI object.
        const { data: row, error } = await supabase
          .from('appointments')
          .select('dentist_id, clinic_id, consultation_type, scheduled_at, duration_minutes, is_teleconsultation, price')
          .eq('id', consultation.id)
          .single();
        if (error) throw error;

        await cancelAppointment(consultation.id);
        refresh();

        const slot: FreedSlot = {
          scheduledAt: row.scheduled_at,
          durationMinutes: row.duration_minutes ?? 30,
          dentistId: row.dentist_id,
          clinicId: row.clinic_id,
          consultationType: row.consultation_type,
          isTeleconsultation: row.is_teleconsultation,
          price: row.price,
        };

        try {
          const matches = await findWaitingMatches(slot);
          if (matches.length) setMatchState({ matches, slot });
        } catch {
          // A failed match lookup must not make the cancel look broken.
        }
        return true;
      } catch (e) {
        toast.error((e as Error)?.message ?? i18n.t('sweep.appointments.cancelError'));
        return false;
      } finally {
        setPending(false);
      }
    },
    [isDemo, refresh]
  );

  const value = useMemo<AppointmentActionsValue>(
    () => ({ isDemo, pending, changeStatus, rescheduleConsultation, cancelConsultation }),
    [isDemo, pending, changeStatus, rescheduleConsultation, cancelConsultation]
  );

  const topMatch = matchState?.matches[0];
  const slotDate = matchState ? new Date(matchState.slot.scheduledAt) : null;
  const slotLabel = slotDate
    ? `${format(slotDate, "EEEE d 'de' MMMM", { locale: pt })} · ${String(slotDate.getUTCHours()).padStart(2, '0')}:${String(slotDate.getUTCMinutes()).padStart(2, '0')}`
    : '';

  const handleAssign = async () => {
    if (!matchState || !topMatch) return;
    try {
      await assignWaitingMatch(
        topMatch,
        matchState.slot,
        i18n.t('sweep.appointments.confirmedMessage', { slot: slotLabel })
      );
      toast.success(i18n.t('sweep.appointments.assignedTo', { name: topMatch.patientName }));
      setMatchState(null);
      refresh();
    } catch (e) {
      if (e instanceof SlotTakenError) toast.error(i18n.t('sweep.appointments.slotTaken'));
      else toast.error((e as Error)?.message ?? i18n.t('sweep.appointments.assignError'));
    }
  };

  return (
    <AppointmentActionsContext.Provider value={value}>
      {children}
      <AlertDialog open={!!matchState} onOpenChange={(open) => !open && setMatchState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" /> {i18n.t('sweep.appointments.slotAvailable')}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18n.t('sweep.appointments.waitlistPreference', { name: topMatch?.patientName })}
              <br />
              <span className="font-medium text-foreground">{slotLabel}</span>
              {topMatch?.urgency === 'urgente' && (
                <>
                  <br />
                  <span className="text-destructive font-medium">{i18n.t('sweep.appointments.urgent')}</span>
                </>
              )}
              {matchState && matchState.matches.length > 1 && (
                <>
                  <br />
                  <span className="text-xs">
                    {i18n.t('sweep.appointments.othersWaiting', { count: matchState.matches.length - 1 })}
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.t('sweep.appointments.ignore')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssign}>{i18n.t('sweep.appointments.assign')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppointmentActionsContext.Provider>
  );
}

const DEMO_FALLBACK: AppointmentActionsValue = {
  isDemo: true,
  pending: false,
  changeStatus: async () => true,
  rescheduleConsultation: async () => true,
  cancelConsultation: async () => true,
};

export function useAppointmentActions(): AppointmentActionsValue {
  return useContext(AppointmentActionsContext) ?? DEMO_FALLBACK;
}
