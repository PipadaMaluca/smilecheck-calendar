import { describe, it, expect, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { buildHealthAlerts, hasAlerts } from '@/data/consultationContext';
import { expandOccurrences, MAX_OCCURRENCES } from '@/data/agendaExceptions';
import { appToday, DEMO_TODAY } from '@/lib/demoClock';

// Echo translator: key + params, so assertions don't depend on copy.
const t = ((k: string, o?: Record<string, unknown>) => (o ? `${k}|${JSON.stringify(o)}` : k)) as never;

describe('Clinical safety alerts from real dossier data', () => {
  it('declared allergy + recently prescribed drug of that class → alert', () => {
    const a = buildHealthAlerts({ allergies: ['Penicilina'], currentMeds: [], prescribed: ['Amoxicilina 1g'] }, t);
    expect(hasAlerts(a)).toBe(true);
    expect(a.allergies).toEqual(['Penicilina']);
    const m = a.medications.find((x) => x.name === 'Amoxicilina 1g');
    expect(m?.interaction).toContain('safetyReal.allergyConflict');
    expect(m?.interaction).toContain('Penicilina');
  });
  it('current anticoagulant + prescribed NSAID → interaction alert', () => {
    const a = buildHealthAlerts({ allergies: [], currentMeds: [{ name: 'Varfarina 5mg' }], prescribed: ['Ibuprofeno'] }, t);
    const ibu = a.medications.find((x) => x.name === 'Ibuprofeno');
    expect(ibu?.interaction).toContain('safetyReal.interactsWith');
    expect(ibu?.interaction).toContain('Varfarina 5mg');
    expect(ibu?.interaction).toContain('safetyReal.risk.bleeding');
  });
  it('current anticoagulant alone still warns about NSAIDs', () => {
    const a = buildHealthAlerts({ allergies: [], currentMeds: [{ name: 'Varfarina' }], prescribed: [] }, t);
    expect(a.medications[0].interaction).toContain('AINEs');
  });
  it('no data → no alert (never invented)', () => {
    const a = buildHealthAlerts({ allergies: [], currentMeds: [], prescribed: [] }, t);
    expect(a).toEqual({ allergies: [], medications: [] });
    expect(hasAlerts(a)).toBe(false);
  });
  it('harmless medication only → listed but no alert', () => {
    const a = buildHealthAlerts({ allergies: [], currentMeds: [{ name: 'Omeprazol' }], prescribed: ['Paracetamol'] }, t);
    expect(hasAlerts(a)).toBe(false);
  });
});

describe('Real "today" and absences', () => {
  it('real accounts use the actual day, even on Sunday (no demo shift)', () => {
    const sunday = new Date(2026, 10, 8, 15, 0); // Sun 8 Nov 2026
    expect(appToday(false, sunday)).toEqual(new Date(2026, 10, 8));
    expect(appToday(true, sunday)).toBe(DEMO_TODAY);
  });
  it('weekly absence on Mon+Wed expands only on those weekdays', () => {
    const s = new Date(2026, 10, 9, 9, 0); const e = new Date(2026, 10, 9, 10, 0); // Mon
    const occ = expandOccurrences(s, e, { frequency: 'weekly', until: new Date(2026, 10, 18), weekdays: [0, 2] });
    expect(occ.map((o) => o.start.getDate())).toEqual([9, 11, 16, 18]);
    expect(occ.every((o) => o.end.getTime() - o.start.getTime() === 3600000)).toBe(true);
  });
  it('end before start produces nothing; repeats are capped', () => {
    expect(expandOccurrences(new Date(2026, 0, 2), new Date(2026, 0, 1), null)).toEqual([]);
    const occ = expandOccurrences(new Date(2026, 0, 1, 9), new Date(2026, 0, 1, 10), { frequency: 'daily', until: new Date(2027, 0, 1) });
    expect(occ.length).toBe(MAX_OCCURRENCES);
  });
});
