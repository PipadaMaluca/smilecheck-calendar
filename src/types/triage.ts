// Triage flow types and data

export interface TriageSymptom {
  id: string;
  label: string;
  icon: string;
}

export interface TriageDuration {
  id: string;
  label: string;
  icon: string;
}

export interface ToothPosition {
  id: string;
  x: number;
  y: number;
  arch: 'upper' | 'lower';
}

export interface TriageData {
  symptoms: string[];
  otherSymptom?: string;
  selectedTeeth: string[];
  unknownLocation: boolean;
  duration: string;
  painIntensity: number;
  isRoutineCheckup: boolean;
  photos: File[];
}

export const initialTriageData: TriageData = {
  symptoms: [],
  otherSymptom: '',
  selectedTeeth: [],
  unknownLocation: false,
  duration: '',
  painIntensity: 0,
  isRoutineCheckup: false,
  photos: [],
};
