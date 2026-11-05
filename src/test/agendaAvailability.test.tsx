import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
vi.mock('@/stores/agendaSettingsStore', () => ({ useSlotHeight: (n: number) => n }));
import { applyExceptions, wallToUtc, splitAgendaKey, availabilityErrorKey, agendaAvailabilityStore } from '@/data/agendaAvailability';
import { generateTimeSlots } from '@/data/mockData';
import type { AgendaException } from '@/data/agendaExceptions';
import type { TimeSlot } from '@/types/calendar';
import { TimeSlotView } from '@/components/calendar/TimeSlotView';

const D = 'aaaaaaaa-1111-2222-3333-444444444444';
const C = 'cccccccc-1111-2222-3333-444444444444';
const TZ = 'Europe/Paris';
const exc = (p: Partial<AgendaException>): AgendaException => ({
  id: 'e1', dentist_id: D, clinic_id: C, kind: 'ausencia', full_day: false, reason: 'Formação', note: null, color: null,
  starts_at: wallToUtc(2026, 11, 10, 10, 0, TZ).toISOString(), ends_at: wallToUtc(2026, 11, 10, 11, 30, TZ).toISOString(), ...p,
});
const day = new Date(2026, 10, 10); // Tue 10 Nov 2026
const free = (): TimeSlot[] => ['09:30', '10:00', '10:30', '11:00', '11:30'].map((time) => ({ time, status: 'livre' }));

afterEach(() => agendaAvailabilityStore.reset());

describe('Absences drawn on the agenda', () => {
  it('10:00–11:30 clinic time → one block spanning 3 slots, neighbours untouched', () => {
    const out = applyExceptions(free(), day, D, C, [exc({})], TZ);
    expect(out.map((s) => s.status)).toEqual(['livre', 'bloqueado', 'bloqueado', 'bloqueado', 'livre']);
    expect(out[1].blockSpan).toBe(3);
    expect(out[2].blockHidden && out[3].blockHidden).toBe(true);
    expect(out[1].blockReason).toBe('Formação');
  });
  it('uses the clinic zone, not the viewer zone (Paris 10:00 = 09:00 UTC)', () => {
    expect(wallToUtc(2026, 11, 10, 10, 0, TZ).toISOString()).toBe('2026-11-10T09:00:00.000Z');
    expect(wallToUtc(2026, 7, 10, 10, 0, TZ).toISOString()).toBe('2026-07-10T08:00:00.000Z');
  });
  it('an absence for all clinics (clinic null) applies; another dentist/clinic does not', () => {
    expect(applyExceptions(free(), day, D, C, [exc({ clinic_id: null })], TZ)[1].status).toBe('bloqueado');
    expect(applyExceptions(free(), day, D, 'other', [exc({})], TZ)[1].status).toBe('livre');
    expect(applyExceptions(free(), day, 'other', C, [exc({})], TZ)[1].status).toBe('livre');
  });
  it('a booked appointment inside an absence stays visible (warn, never hide/cancel)', () => {
    const slots = free(); slots[2] = { time: '10:30', status: 'ocupado' };
    expect(applyExceptions(slots, day, D, C, [exc({})], TZ)[2].status).toBe('ocupado');
  });
  it('an exceptional opening keeps slots bookable but tagged', () => {
    const out = applyExceptions(free(), day, D, C, [exc({ kind: 'abertura' })], TZ);
    expect(out[1]).toMatchObject({ status: 'livre', exceptionKind: 'abertura' });
  });
  it('real store: shared slot builder drops the demo lunch and draws the absence', () => {
    agendaAvailabilityStore.setData([exc({})], { [C]: TZ });
    const slots = generateTimeSlots(day, [], { dentistId: D, clinicId: C });
    expect(slots.find((s) => s.time === '13:00')?.status).toBe('livre');
    expect(slots.find((s) => s.time === '10:00')).toMatchObject({ status: 'bloqueado', blockSpan: 3 });
  });
  it('demo (store inactive) keeps the demo lunch block unchanged', () => {
    expect(generateTimeSlots(day, []).find((s) => s.time === '13:00')?.status).toBe('bloqueado');
  });
  it('day view renders the absence as one striped block with its reason', () => {
    const { container } = render(<TimeSlotView slots={applyExceptions(free(), day, D, C, [exc({})], TZ)} />);
    expect(container.querySelectorAll('[data-agenda-exception="ausencia"]').length).toBe(1);
    expect(screen.getByText('Formação')).toBeTruthy();
  });
});

describe('Helpers', () => {
  it('splits UUID agenda keys and demo keys', () => {
    expect(splitAgendaKey(`${C}-${D}`)).toEqual({ clinicId: C, dentistId: D });
    expect(splitAgendaKey('1-2')).toEqual({ clinicId: '1', dentistId: '2' });
  });
  it('maps server refusals', () => {
    expect(availabilityErrorKey({ message: 'slot_in_absence' })).toBe('availabilityReal.inAbsence');
    expect(availabilityErrorKey({ message: 'outside_working_hours' })).toBe('availabilityReal.outsideHours');
    expect(availabilityErrorKey({ message: 'other' })).toBeNull();
  });
});
