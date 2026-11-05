import { describe, it, expect } from 'vitest';
import i18n from 'i18next';
import { clinicToday, computeKpis, inPeriod, occupancyRate, scopeConsultations } from '@/data/kpis';
import { buildReport, selectReportRows, reportTable } from '@/lib/reportExport';
import { mockConsultations } from '@/data/mockData';
import { DEMO_TODAY } from '@/lib/demoClock';
import type { Consultation } from '@/types/calendar';

const mk = (id: string, day: Date, o: Partial<Consultation> & { dentistId?: string; clinicId?: string; dbStatus?: string } = {}): Consultation => ({
  id, type: o.type ?? 'presencial', category: 'restauracao', status: o.status ?? 'agendada',
  date: day, time: o.time ?? '10:00', duration: o.duration ?? 60,
  patient: { id: 'p1', name: 'Ana', phone: '+351 900 000 000', rating: 0, level: 'Lata' },
  dentist: { id: 'x', name: 'Dr. Real' }, clinic: { id: 'y', name: 'Clínica Real', address: '' },
  price: o.price ?? 50, isPaid: false, notes: 'nota clínica sensível',
  ref: { dentistId: o.dentistId ?? 'd1', clinicId: o.clinicId ?? 'c1', dbStatus: o.dbStatus ?? 'agendada', tz: 'Europe/Lisbon' },
} as Consultation);

const MON = new Date(2026, 10, 2); // Mon 2 Nov 2026
const TUE = new Date(2026, 10, 3);

describe('Real KPIs', () => {
  it('"today" follows the clinic time zone, not UTC', () => {
    // 23:30 UTC on 2 Nov = 00:30 on 3 Nov in Paris, still 2 Nov (23:30) in Lisbon.
    const now = new Date(Date.UTC(2026, 10, 2, 23, 30));
    expect(clinicToday('Europe/Paris', now).getDate()).toBe(3);
    expect(clinicToday('Europe/Lisbon', now).getDate()).toBe(2);
  });

  it('periods today/week/month use the clinic reference day', () => {
    const cons = [mk('a', MON), mk('b', TUE), mk('c', new Date(2026, 10, 20)), mk('d', new Date(2026, 9, 31))];
    expect(cons.filter((c) => inPeriod(c, 'today', MON)).length).toBe(1);
    expect(cons.filter((c) => inPeriod(c, 'week', MON)).length).toBe(2);
    expect(cons.filter((c) => inPeriod(c, 'month', MON)).length).toBe(3);
  });

  it('dentist sees only own, clinic only its clinics, cancelled never counts', () => {
    const cons = [mk('a', MON), mk('b', MON, { dentistId: 'd2' }), mk('c', MON, { clinicId: 'c9' }), mk('x', MON, { dbStatus: 'cancelada' })];
    expect(scopeConsultations(cons, { role: 'dentist', selfId: 'd1', clinicIds: [] }).map((c) => c.id)).toEqual(['a', 'c']);
    expect(scopeConsultations(cons, { role: 'clinic', selfId: 'o', clinicIds: ['c1'] }).map((c) => c.id)).toEqual(['a', 'b']);
    expect(scopeConsultations(cons, { role: 'patient', selfId: 'p1', clinicIds: [] }).map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('empty data gives zeros, never NaN', () => {
    const k = computeKpis([]);
    expect([k.total, k.confirmRate, k.absenceRate, k.revenue]).toEqual([0, 0, 0, 0]);
  });

  it('confirmation and absence rates use the demo formulas', () => {
    const k = computeKpis([mk('a', MON, { status: 'confirmada' }), mk('b', MON, { status: 'falta_nao_justificada' }), mk('c', MON), mk('d', MON, { status: 'visto' })]);
    expect(k.confirmRate).toBe(50);
    expect(k.absenceRate).toBe(25);
  });

  it('occupancy = booked in-person minutes ÷ working_hours minutes; null without hours', () => {
    const hours = { mon: [['09:00', '13:00']] as [string, string][] }; // 240 min
    const cons = [mk('a', MON, { duration: 60 }), mk('b', MON, { duration: 60, type: 'teleconsulta' })];
    expect(occupancyRate(cons, [{ dentistId: 'd1', clinicId: 'c1', hours }], 'today', MON)).toBe(25);
    expect(occupancyRate(cons, [{ dentistId: 'd1', clinicId: 'c1' }], 'today', MON)).toBeNull();
  });

  it('demo KPIs are unchanged (mock + DEMO_TODAY)', () => {
    const today = mockConsultations.filter((c) => inPeriod(c, 'today', DEMO_TODAY));
    expect(today.length).toBe(102);
    expect(computeKpis(today)).toEqual(computeKpis(mockConsultations.filter((c) => inPeriod(c, 'today'))));
  });
});

describe('Exports respect permissions', () => {
  const t = ((k: string) => k) as unknown as typeof i18n.t;
  const rows = [mk('a', MON), mk('b', MON, { dentistId: 'd2' })];

  it('only includes the period and dentist asked for', () => {
    expect(selectReportRows(rows, { period: 'today', today: MON, dentistId: 'd2' }).map((r) => r.id)).toEqual(['b']);
    expect(selectReportRows(rows, { period: 'today', today: TUE })).toEqual([]);
  });

  it('never contains notes or phone numbers', () => {
    const out = buildReport(rows, 'clinic', t, 'csv');
    expect(out).not.toContain('nota clínica');
    expect(out).not.toContain('900 000 000');
  });

  it('patient export has no price column', () => {
    expect(reportTable(rows, 'patient', t)[0]).not.toContain('export.columns.price');
  });
});
