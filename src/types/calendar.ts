export type ConsultationType = 'teleconsulta' | 'presencial';
export type ConsultationCategory = 
  | 'restauracao' 
  | 'primeira_consulta' 
  | 'protese' 
  | 'urgencia' 
  | 'teleconsulta' 
  | 'teleconsulta_urgente'
  | 'endodontia'
  | 'cirurgia'
  | 'destartarizacao'
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
}

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

// Category color mapping
export const CATEGORY_COLORS: Record<ConsultationCategory, { bg: string; text: string; hex: string }> = {
  restauracao: { bg: 'bg-[#2196F3]', text: 'text-white', hex: '#2196F3' },
  primeira_consulta: { bg: 'bg-[#FDD835]', text: 'text-black', hex: '#FDD835' },
  protese: { bg: 'bg-[#4CAF50]', text: 'text-white', hex: '#4CAF50' },
  urgencia: { bg: 'bg-[#F44336]', text: 'text-white', hex: '#F44336' },
  teleconsulta: { bg: 'bg-[#FF9800]', text: 'text-white', hex: '#FF9800' },
  teleconsulta_urgente: { bg: 'bg-[#E65100]', text: 'text-white', hex: '#E65100' },
  endodontia: { bg: 'bg-[#E91E63]', text: 'text-white', hex: '#E91E63' },
  cirurgia: { bg: 'bg-[#000000]', text: 'text-white', hex: '#000000' },
  destartarizacao: { bg: 'bg-[#9C27B0]', text: 'text-white', hex: '#9C27B0' },
  outro: { bg: 'bg-[#9E9E9E]', text: 'text-white', hex: '#9E9E9E' },
};

export const CATEGORY_LABELS: Record<ConsultationCategory, string> = {
  restauracao: 'Restauração',
  primeira_consulta: 'Primeira Consulta',
  protese: 'Prótese',
  urgencia: 'Urgência',
  teleconsulta: 'Teleconsulta',
  teleconsulta_urgente: 'Teleconsulta Urgente',
  endodontia: 'Endodontia',
  cirurgia: 'Cirurgia',
  destartarizacao: 'Destartarização',
  outro: 'Outro',
};
