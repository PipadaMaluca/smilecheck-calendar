import { useSyncExternalStore } from 'react';
import { CATEGORY_COLORS, ConsultationCategory } from '@/types/calendar';

export interface AgendaSettings {
  showSundays: boolean;
  startHour: number;
  endHour: number;
  slotDuration: number;
  showFreeSlots: boolean;
  showBlocks: boolean;
  density: 'compact' | 'normal' | 'expanded';
  categoryColors: Record<string, string>;
  blockColor: string;
}

export const DEFAULT_SETTINGS: AgendaSettings = {
  showSundays: false,
  startHour: 8,
  endHour: 20,
  slotDuration: 30,
  showFreeSlots: true,
  showBlocks: true,
  density: 'normal',
  categoryColors: Object.fromEntries(
    Object.entries(CATEGORY_COLORS).map(([k, v]) => [k, v.hex])
  ),
  blockColor: '#9E9E9E',
};

const SESSION_KEY = 'sc:agenda-settings';

function loadInitial(): AgendaSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed, categoryColors: { ...DEFAULT_SETTINGS.categoryColors, ...(parsed.categoryColors || {}) } };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

let state: AgendaSettings = loadInitial();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}

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