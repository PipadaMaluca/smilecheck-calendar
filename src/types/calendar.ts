export type ConsultationType = 'teleconsulta' | 'presencial';

export type ConsultationStatus = 
  | 'agendada'
  | 'confirmada'
  | 'em_sala_espera'
  | 'em_consulta'
  | 'visto'
  | 'falta_justificada'
  | 'falta_nao_justificada';

export type ConsultationCategory = 
  | 'primeira_consulta' 
  | 'destartarizacao'
  | 'cirurgia'
  | 'endodontia'
  | 'odontopediatria'
  | 'ortodontia'
  | 'protese'
  | 'restauracao' 
  | 'urgencia' 
  | 'teleconsulta'
  | 'outro';
export type UrgencyLevel = 'urgente' | 'prioritario' | 'rotina';
export type UserRole = 'patient' | 'dentist' | 'clinic';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  rating: number;
  level: string;
  avatar?: string;
  age?: number;
  dateOfBirth?: string;
}

export interface Dentist {
  id: string;
  name: string;
  specialty?: string;
  avatar?: string;
  workingHours?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  distance?: number;
}

export interface Triage {
  symptom: string;
  duration: string;
  intensity: number;
  photos: number;
  urgency: UrgencyLevel;
}

export interface Consultation {
  id: string;
  type: ConsultationType;
  category?: ConsultationCategory;
  status?: ConsultationStatus;
  date: Date;
  time: string;
  duration: number;
  patient: Patient;
  dentist: Dentist;
  clinic: Clinic;
  price: number;
  isPaid: boolean;
  paymentMethod?: string;
  triage?: Triage;
  notes?: string;
  isUrgentTeleconsulta?: boolean;
}

// Consultation status colors and labels
export const STATUS_CONFIG: Record<ConsultationStatus, { label: string; color: string; bg: string; icon: string }> = {
  agendada: { label: 'Agendada', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '📅' },
  confirmada: { label: 'Confirmada', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '✅' },
  em_sala_espera: { label: 'Em sala de espera', color: 'text-sky-400', bg: 'bg-sky-500/20', icon: '🪑' },
  em_consulta: { label: 'Em consulta', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: '🦷' },
  visto: { label: 'Visto', color: 'text-green-400', bg: 'bg-green-500/20', icon: '✔️' },
  falta_justificada: { label: 'Falta justificada', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '⚠️' },
  falta_nao_justificada: { label: 'Falta não justificada', color: 'text-destructive', bg: 'bg-destructive/20', icon: '❌' },
};

export interface TimeSlot {
  time: string;
  status: 'livre' | 'ocupado' | 'bloqueado';
  consultation?: Consultation;
  blockReason?: string;
}

export interface DaySummary {
  totalConsultations: number;
  teleconsultas: number;
  presenciais: number;
  vagasLivres: number;
  totalRevenue: number;
}

// Category color mapping - 10 types in specified order
export const CATEGORY_COLORS: Record<ConsultationCategory, { bg: string; text: string; hex: string }> = {
  primeira_consulta: { bg: 'bg-[#FDD835]', text: 'text-black', hex: '#FDD835' },
  destartarizacao: { bg: 'bg-[#9C27B0]', text: 'text-white', hex: '#9C27B0' },
  cirurgia: { bg: 'bg-[#212121]', text: 'text-white', hex: '#212121' },
  endodontia: { bg: 'bg-[#E91E63]', text: 'text-white', hex: '#E91E63' },
  odontopediatria: { bg: 'bg-[#039BE5]', text: 'text-white', hex: '#039BE5' },
  ortodontia: { bg: 'bg-[#8BC34A]', text: 'text-white', hex: '#8BC34A' },
  protese: { bg: 'bg-[#2E7D32]', text: 'text-white', hex: '#2E7D32' },
  restauracao: { bg: 'bg-[#2196F3]', text: 'text-white', hex: '#2196F3' },
  urgencia: { bg: 'bg-[#F44336]', text: 'text-white', hex: '#F44336' },
  teleconsulta: { bg: 'bg-[#FF9800]', text: 'text-white', hex: '#FF9800' },
  outro: { bg: 'bg-[#9E9E9E]', text: 'text-white', hex: '#9E9E9E' },
};

// Helper: returns inline style for a category badge/pill (low-opacity background + full-color text)
// Cirurgia uses white text on low-opacity black bg
export function getCategoryBadgeStyle(hex: string): import('react').CSSProperties {
  // Doctolib-style: full vivid pill colors, no transparency.
  // Map from CATEGORY_COLORS hex → vivid pill color/text.
  const PILL_BY_HEX: Record<string, { bg: string; color: string }> = {
    '#FDD835': { bg: '#F9A825', color: '#5D4037' }, // primeira_consulta
    '#9C27B0': { bg: '#7B1FA2', color: '#FFFFFF' }, // destartarizacao
    '#212121': { bg: '#37474F', color: '#FFFFFF' }, // cirurgia
    '#E91E63': { bg: '#C2185B', color: '#FFFFFF' }, // endodontia
    '#039BE5': { bg: '#039BE5', color: '#FFFFFF' }, // odontopediatria
    '#8BC34A': { bg: '#558B2F', color: '#FFFFFF' }, // ortodontia
    '#2E7D32': { bg: '#2E7D32', color: '#FFFFFF' }, // protese
    '#2196F3': { bg: '#1565C0', color: '#FFFFFF' }, // restauracao
    '#F44336': { bg: '#C62828', color: '#FFFFFF' }, // urgencia
    '#FF9800': { bg: '#EF6C00', color: '#FFFFFF' }, // teleconsulta
  };
  const pill = PILL_BY_HEX[hex] || { bg: hex, color: '#FFFFFF' };
  return { backgroundColor: pill.bg, color: pill.color };
}

// Fallback labels (Portuguese) - prefer getCategoryLabel(t, category) for translated labels
export const CATEGORY_LABELS: Record<ConsultationCategory, string> = {
  primeira_consulta: '1ª Consulta',
  destartarizacao: 'Destartarização',
  cirurgia: 'Cirurgia',
  endodontia: 'Endodontia',
  odontopediatria: 'Odontopediatria',
  ortodontia: 'Ortodontia',
  protese: 'Prótese',
  restauracao: 'Restauração',
  urgencia: 'Urgência',
  teleconsulta: 'Teleconsulta',
  outro: 'Outro',
};

export const CATEGORY_PILL_EMOJIS: Partial<Record<ConsultationCategory, string>> = {
  urgencia: '⚠️',
  teleconsulta: '📹',
};

// i18n key mapping for each category
export const CATEGORY_I18N_KEYS: Record<ConsultationCategory, string> = {
  primeira_consulta: 'consultationTypes.firstConsultation',
  destartarizacao: 'consultationTypes.scaling',
  cirurgia: 'consultationTypes.surgery',
  endodontia: 'consultationTypes.endodontics',
  odontopediatria: 'consultationTypes.pediatric',
  ortodontia: 'consultationTypes.orthodontics',
  protese: 'consultationTypes.prosthetics',
  restauracao: 'consultationTypes.restoration',
  urgencia: 'consultationTypes.emergency',
  teleconsulta: 'consultationTypes.teleconsultation',
  outro: 'common.other',
};

// Helper: get translated category label. Pass t function from useTranslation().
export function getCategoryLabel(t: (key: string) => string, category: ConsultationCategory): string {
  return t(CATEGORY_I18N_KEYS[category]);
}

// Legend order as specified
export const LEGEND_ORDER: ConsultationCategory[] = [
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

// View mode type
export type ViewMode = 'list' | 'day' | 'three-day' | 'week' | 'month';

// Family member type
export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relation: string;
}
