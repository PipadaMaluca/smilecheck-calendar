import { useMemo } from 'react';
import { useAgendaData } from '@/data/agendaSource';
import { useDirectory } from '@/data/directorySource';
import { clinicToday, scopeConsultations, dentistKey } from '@/data/kpis';
import { DEMO_TODAY } from '@/lib/demoClock';
import type { Consultation, UserRole } from '@/types/calendar';
import type { ConsultationConfirmation } from '@/types/scoring';

/**
 * Real-account data for Início / Estatísticas / exports. Demo callers keep their
 * mock expressions untouched; this hook is only read when `isDemo` is false.
 */
export interface KpiData {
  isDemo: boolean;
  loading: boolean;
  /** Role-scoped, non-cancelled appointments with dentist names from the directory. */
  consultations: Consultation[];
  /** "Today" in the user's (first) clinic time zone. */
  today: Date;
  /** Upcoming agendada/confirmada of today → confirmation rows (24h confirmed if confirmada). */
  confirmationsToday: ConsultationConfirmation[];
}

export function confirmationsFrom(cons: Consultation[], today: Date): ConsultationConfirmation[] {
  return cons
    .filter((c) => c.date.getTime() === today.getTime() && (c.status === 'agendada' || c.status === 'confirmada'))
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((c) => ({
      consultationId: c.id,
      patientName: c.patient.name,
      dentistName: c.dentist.name,
      time: c.time,
      status24h: c.status === 'confirmada' ? 'confirmed' : 'pending',
      status1h: 'pending',
      category: c.category,
    }) as ConsultationConfirmation);
}

export function useKpiData(role: UserRole): KpiData {
  const agenda = useAgendaData();
  const dir = useDirectory();
  const isDemo = agenda.isDemo || dir.isDemo;
  return useMemo(() => {
    if (isDemo) {
      return { isDemo: true, loading: false, consultations: agenda.consultations, today: DEMO_TODAY, confirmationsToday: [] };
    }
    const names = new Map(dir.dentists.map((d) => [d.id, d.name]));
    const clinicNames = new Map(dir.clinics.map((c) => [c.id, c.name]));
    const scoped = scopeConsultations(agenda.consultations, {
      role, selfId: dir.selfId, clinicIds: dir.clinics.map((c) => c.id),
    }).map((c) => {
      const dn = names.get(dentistKey(c));
      const cn = c.ref?.clinicId ? clinicNames.get(c.ref.clinicId) : undefined;
      return dn || cn ? { ...c, dentist: { ...c.dentist, name: dn || c.dentist.name }, clinic: { ...c.clinic, name: cn || c.clinic.name } } : c;
    });
    const tz = dir.clinics[0]?.timezone ?? scoped[0]?.ref?.tz ?? 'Europe/Lisbon';
    const today = clinicToday(tz);
    return {
      isDemo: false,
      loading: agenda.loading || dir.loading,
      consultations: scoped,
      today,
      confirmationsToday: confirmationsFrom(scoped, today),
    };
  }, [isDemo, agenda.consultations, agenda.loading, dir, role]);
}
