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
  odontopediatria: { bg: 'bg-[#E65100]', text: 'text-white', hex: '#E65100' },
  ortodontia: { bg: 'bg-[#8BC34A]', text: 'text-white', hex: '#8BC34A' },
  protese: { bg: 'bg-[#2E7D32]', text: 'text-white', hex: '#2E7D32' },
  restauracao: { bg: 'bg-[#2196F3]', text: 'text-white', hex: '#2196F3' },
  urgencia: { bg: 'bg-[#F44336]', text: 'text-white', hex: '#F44336' },
  teleconsulta: { bg: 'bg-[#FF9800]', text: 'text-white', hex: '#FF9800' },
  outro: { bg: 'bg-[#9E9E9E]', text: 'text-white', hex: '#9E9E9E' },
};

// Helper: returns inline style for category-colored text (low-opacity bg pill style)
// Cirurgia (#212121) uses white text; all others use the category color as text
export function getCategoryTextStyle(hex: string): import('react').CSSProperties {
  if (hex === '#212121') {
    return { color: '#fff' };
  }
  return { color: hex };
}

// Helper: returns inline style for a category badge/pill (low-opacity background + full-color text)
// Cirurgia uses white text on low-opacity black bg
export function getCategoryBadgeStyle(hex: string): import('react').CSSProperties {
  if (hex === '#212121') {
    return {
      backgroundColor: `${hex}30`,
      color: '#fff',
    };
  }
  return {
    backgroundColor: `${hex}30`,
    color: hex,
  };
}

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

// Mobile category labels (shorter) - same as main labels now
export const CATEGORY_LABELS_SHORT: Record<ConsultationCategory, string> = {
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
