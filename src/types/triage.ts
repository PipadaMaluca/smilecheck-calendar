// Triage flow types and data

export interface TriageSymptom {
  id: string;
  label: string;
  icon: string;
}

export const TRIAGE_SYMPTOMS: TriageSymptom[] = [
  { id: 'dor_dente', label: 'Dor de dente', icon: '🦷' },
  { id: 'sensibilidade', label: 'Sensibilidade ao quente/frio', icon: '🌡️' },
  { id: 'sangramento', label: 'Sangramento nas gengivas', icon: '🩸' },
  { id: 'mau_halito', label: 'Mau hálito', icon: '😮‍💨' },
  { id: 'inchaco', label: 'Inchaço', icon: '😣' },
  { id: 'dente_abanar', label: 'Dente a abanar', icon: '🦷' },
  { id: 'dor_mandibula', label: 'Dor na mandíbula', icon: '😖' },
  { id: 'descoloracao', label: 'Descoloração do dente', icon: '🎨' },
  { id: 'dente_partido', label: 'Dente partido/lascado', icon: '💔' },
  { id: 'feridas_boca', label: 'Feridas na boca', icon: '⚪' },
  { id: 'outro', label: 'Outro', icon: '❓' },
];

export interface TriageDuration {
  id: string;
  label: string;
  icon: string;
}

export const TRIAGE_DURATIONS: TriageDuration[] = [
  { id: 'menos_24h', label: 'Menos de 24 horas', icon: '⏰' },
  { id: '1_3_dias', label: '1-3 dias', icon: '📅' },
  { id: '4_7_dias', label: '4-7 dias', icon: '📅' },
  { id: '1_2_semanas', label: '1-2 semanas', icon: '📅' },
  { id: '2_4_semanas', label: '2-4 semanas', icon: '📅' },
  { id: 'mais_1_mes', label: 'Mais de 1 mês', icon: '📅' },
  { id: 'nao_sei', label: 'Não tenho a certeza', icon: '❓' },
];

export interface ToothPosition {
  id: string;
  x: number;
  y: number;
  arch: 'upper' | 'lower';
}

// Standard dental numbering - simplified positions for the UI
export const TEETH_POSITIONS: ToothPosition[] = [
  // Upper arch (1-16)
  { id: '18', x: 10, y: 30, arch: 'upper' },
  { id: '17', x: 22, y: 22, arch: 'upper' },
  { id: '16', x: 34, y: 16, arch: 'upper' },
  { id: '15', x: 44, y: 12, arch: 'upper' },
  { id: '14', x: 54, y: 10, arch: 'upper' },
  { id: '13', x: 64, y: 8, arch: 'upper' },
  { id: '12', x: 74, y: 7, arch: 'upper' },
  { id: '11', x: 84, y: 6, arch: 'upper' },
  { id: '21', x: 96, y: 6, arch: 'upper' },
  { id: '22', x: 106, y: 7, arch: 'upper' },
  { id: '23', x: 116, y: 8, arch: 'upper' },
  { id: '24', x: 126, y: 10, arch: 'upper' },
  { id: '25', x: 136, y: 12, arch: 'upper' },
  { id: '26', x: 146, y: 16, arch: 'upper' },
  { id: '27', x: 158, y: 22, arch: 'upper' },
  { id: '28', x: 170, y: 30, arch: 'upper' },
  // Lower arch (17-32)
  { id: '48', x: 10, y: 110, arch: 'lower' },
  { id: '47', x: 22, y: 118, arch: 'lower' },
  { id: '46', x: 34, y: 124, arch: 'lower' },
  { id: '45', x: 44, y: 128, arch: 'lower' },
  { id: '44', x: 54, y: 130, arch: 'lower' },
  { id: '43', x: 64, y: 132, arch: 'lower' },
  { id: '42', x: 74, y: 133, arch: 'lower' },
  { id: '41', x: 84, y: 134, arch: 'lower' },
  { id: '31', x: 96, y: 134, arch: 'lower' },
  { id: '32', x: 106, y: 133, arch: 'lower' },
  { id: '33', x: 116, y: 132, arch: 'lower' },
  { id: '34', x: 126, y: 130, arch: 'lower' },
  { id: '35', x: 136, y: 128, arch: 'lower' },
  { id: '36', x: 146, y: 124, arch: 'lower' },
  { id: '37', x: 158, y: 118, arch: 'lower' },
  { id: '38', x: 170, y: 110, arch: 'lower' },
];

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
