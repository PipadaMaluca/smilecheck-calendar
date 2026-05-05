import { useSyncExternalStore } from 'react';

export type PatientStatusKey =
  | 'a_chegar'
  | 'em_sala_espera'
  | 'em_consulta'
  | 'visto'
  | 'falta_nao_justificada'
  | 'falta_justificada'
  | 'a_remarcar';

export const ALL_PATIENT_STATUSES: PatientStatusKey[] = [
  'a_chegar',
  'em_sala_espera',
  'em_consulta',
  'visto',
  'falta_nao_justificada',
  'falta_justificada',
  'a_remarcar',
];

export type ConsultationCategoryKey =
  | 'primeira_consulta'
  | 'destartarizacao'
  | 'cirurgia'
  | 'endodontia'
  | 'odontopediatria'
  | 'ortodontia'
  | 'protese'
  | 'restauracao'
  | 'urgencia'
  | 'teleconsulta';

export const ALL_CONSULTATION_CATEGORIES: ConsultationCategoryKey[] = [
  'primeira_consulta',
  'destartarizacao',
  'cirurgia',
  'endodontia',
  'odontopediatria',
  'ortodontia',
  'protese',
  'restauracao',
  'urgencia',
  'teleconsulta',
];

export interface AgendaFiltersState {
  patientStatuses: PatientStatusKey[];
  consultationCategories: ConsultationCategoryKey[];
}

let state: AgendaFiltersState = {
  patientStatuses: [...ALL_PATIENT_STATUSES],
  consultationCategories: [...ALL_CONSULTATION_CATEGORIES],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const agendaFiltersStore = {
  get: () => state,
  setPatientStatuses: (v: PatientStatusKey[]) => {
    state = { ...state, patientStatuses: v };
    emit();
  },
  togglePatientStatus: (s: PatientStatusKey) => {
    const has = state.patientStatuses.includes(s);
    state = {
      ...state,
      patientStatuses: has
        ? state.patientStatuses.filter((x) => x !== s)
        : [...state.patientStatuses, s],
    };
    emit();
  },
  toggleAllPatientStatuses: () => {
    state = {
      ...state,
      patientStatuses:
        state.patientStatuses.length === ALL_PATIENT_STATUSES.length
          ? []
          : [...ALL_PATIENT_STATUSES],
    };
    emit();
  },
  setConsultationCategories: (v: ConsultationCategoryKey[]) => {
    state = { ...state, consultationCategories: v };
    emit();
  },
  toggleConsultationCategory: (c: ConsultationCategoryKey) => {
    const has = state.consultationCategories.includes(c);
    state = {
      ...state,
      consultationCategories: has
        ? state.consultationCategories.filter((x) => x !== c)
        : [...state.consultationCategories, c],
    };
    emit();
  },
  toggleAllConsultationCategories: () => {
    state = {
      ...state,
      consultationCategories:
        state.consultationCategories.length === ALL_CONSULTATION_CATEGORIES.length
          ? []
          : [...ALL_CONSULTATION_CATEGORIES],
    };
    emit();
  },
};

export function useAgendaFilters(): AgendaFiltersState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

/**
 * Helper used by calendar pages to decide if a consultation should be visible
 * given current patient-status and category filters.
 */
export function passesAgendaFilters(c: {
  status?: string;
  category?: string;
  type?: string;
}): boolean {
  const { patientStatuses, consultationCategories } = state;

  // Patient status mapping: agendada + confirmada -> a_chegar
  const statusMap: Record<string, PatientStatusKey> = {
    agendada: 'a_chegar',
    confirmada: 'a_chegar',
    em_sala_espera: 'em_sala_espera',
    em_consulta: 'em_consulta',
    visto: 'visto',
    falta_justificada: 'falta_justificada',
    falta_nao_justificada: 'falta_nao_justificada',
  };
  const mappedStatus = c.status ? statusMap[c.status] : 'a_chegar';
  if (mappedStatus && !patientStatuses.includes(mappedStatus)) return false;

  // Category filter — fall back to type='teleconsulta' when no category set
  const cat = (c.category as ConsultationCategoryKey | undefined) ||
    (c.type === 'teleconsulta' ? 'teleconsulta' : undefined);
  if (cat && !consultationCategories.includes(cat)) return false;

  return true;
}