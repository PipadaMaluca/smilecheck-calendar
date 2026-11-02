import { isSameDay, isSameMonth, isSameWeek } from 'date-fns';
import type { Consultation } from '@/types/calendar';
import { mockConsultations } from '@/data/mockData';
import { DEMO_TODAY } from '@/lib/demoClock';

/** Single definition of every consultation KPI, shared by Estatísticas, Equipa and Dashboard. */
export type KpiPeriod = 'today' | 'week' | 'month';

const CONFIRMED = new Set(['confirmada', 'em_sala_espera', 'em_consulta', 'visto']);
const ABSENCE = new Set(['falta_justificada', 'falta_nao_justificada']);

export function inPeriod(c: Consultation, period: KpiPeriod, ref = DEMO_TODAY) {
  if (period === 'today') return isSameDay(c.date, ref);
  if (period === 'week') return isSameWeek(c.date, ref, { weekStartsOn: 1 });
  return isSameMonth(c.date, ref);
}

export function computeKpis(cons: Consultation[]) {
  const total = cons.length;
  const confirmed = cons.filter(c => CONFIRMED.has(c.status as string)).length;
  const absences = cons.filter(c => ABSENCE.has(c.status as string)).length;
  const tele = cons.filter(c => c.type === 'teleconsulta').length;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  return {
    total,
    confirmed,
    absences,
    tele,
    presencial: total - tele,
    confirmRate: pct(confirmed),
    absenceRate: pct(absences),
    revenue: cons.reduce((s, c) => s + (c.price || 0), 0),
  };
}

/** KPIs for one dentist across the demo month (used by the Team screen). */
export function dentistMonthKpis(dentistId: string, clinicId?: string) {
  return computeKpis(
    mockConsultations.filter(c => c.dentist.id === dentistId && (!clinicId || c.clinic.id === clinicId) && inPeriod(c, 'month')),
  );
}
