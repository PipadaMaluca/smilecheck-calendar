export type ConsultationType = 'teleconsulta' | 'presencial';
export type ConsultationCategory = 'restauracao' | 'primeira_consulta' | 'protese' | 'urgencia' | 'teleconsulta' | 'outro';
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