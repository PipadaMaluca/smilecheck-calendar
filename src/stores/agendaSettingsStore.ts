import { useSyncExternalStore } from 'react';
import { CATEGORY_COLORS, ConsultationCategory } from '@/types/calendar';

export interface AgendaSettings {
  showSundays: boolean; // legacy — kept for compat
  weekDaysVisible: 'mon-fri' | 'mon-sat' | 'mon-sun';
  startHour: number;
  endHour: number;
  slotDuration: number;
  showFreeSlots: boolean;
  showBlocks: boolean;
  lunchStart: string; // "HH:mm"
  lunchEnd: string;   // "HH:mm"
  density: 'compact' | 'normal' | 'expanded';
  categoryColors: Record<string, string>;
  blockColor: string;
  /** Default consultation duration (minutes) keyed by category id. */
  defaultDurations: Record<string, number>;
}

export const DEFAULT_SETTINGS: AgendaSettings = {
  showSundays: false,
  weekDaysVisible: 'mon-sat',
  startHour: 8,
  endHour: 20,
  slotDuration: 30,
  showFreeSlots: true,
  showBlocks: true,
  lunchStart: '13:00',
  lunchEnd: '14:00',
  density: 'normal',
  categoryColors: Object.fromEntries(
    Object.entries(CATEGORY_COLORS).map(([k, v]) => [k, v.hex])
  ),
  blockColor: '#9E9E9E',
  defaultDurations: {
    primeira_consulta: 30,
    avaliacao: 15,
    destartarizacao: 30,
    cirurgia: 60,
    endodontia: 60,
    odontopediatria: 30,
    ortodontia: 30,
    protese: 30,
    restauracao: 30,
    urgencia: 15,
    teleconsulta: 20,
  },
};

// In-memory only: agenda settings are intentionally NOT persisted.
// They reset to defaults whenever the user navigates away from the agenda.
let state: AgendaSettings = { ...DEFAULT_SETTINGS, categoryColors: { ...DEFAULT_SETTINGS.categoryColors }, defaultDurations: { ...DEFAULT_SETTINGS.defaultDurations } };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() { /* no-op: in-memory only */ }

export const agendaSettingsStore = {
  get: () => state,
  set: (next: AgendaSettings) => {
    state = next;
    persist();
    emit();
  },
  patch: <K extends keyof AgendaSettings>(key: K, value: AgendaSettings[K]) => {
    state = { ...state, [key]: value };
    persist();
    emit();
  },
  setCategoryColor: (cat: string, color: string) => {
    state = { ...state, categoryColors: { ...state.categoryColors, [cat]: color } };
    persist();
    emit();
  },
  setDefaultDuration: (cat: string, minutes: number) => {
    state = { ...state, defaultDurations: { ...state.defaultDurations, [cat]: minutes } };
    persist();
    emit();
  },
  reset: () => {
    state = { ...DEFAULT_SETTINGS };
    persist();
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useAgendaSettings(): AgendaSettings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state
  );
}

export function getCategoryColor(cat: ConsultationCategory | string): string {
  return state.categoryColors[cat] || CATEGORY_COLORS[cat as ConsultationCategory]?.hex || '#3B82F6';
}