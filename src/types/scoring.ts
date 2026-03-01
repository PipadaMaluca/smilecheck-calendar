// Patient scoring system types

export interface FeedbackCheckbox {
  id: string;
  label: string;
  points: number;
  isNegative?: boolean;
  urgencyOnly?: boolean; // only shown for urgent consultations
}

export const FEEDBACK_CHECKBOXES: FeedbackCheckbox[] = [
  { id: 'compareceu', label: 'Compareceu', points: 5 },
  { id: 'pontual', label: 'Chegou a horas', points: 2 },
  { id: 'colaborou', label: 'Colaborou durante a consulta', points: 2 },
  { id: 'higiene', label: 'Higiene oral adequada', points: 2 },
  { id: 'recomendacoes', label: 'Seguiu recomendações anteriores', points: 2 },
  { id: 'urgencia_abusiva', label: 'Histórico de urgências abusivas?', points: -2, isNegative: true, urgencyOnly: true },
];

export type FeedbackStatus = 'pending' | 'completed' | 'expired';

export interface PatientFeedback {
  rating: number; // 1-5 stars
  comment?: string;
  submittedAt?: Date;
}

export interface ConsultationScore {
  id: string;
  consultationId: string;
  date: Date;
  dentistName: string;
  clinicName: string;
  totalPoints: number;
  breakdown: ScoreBreakdownItem[];
  feedbackStatus: FeedbackStatus;
  patientFeedback?: PatientFeedback;
  dentistFeedbackDate?: Date;
}

export interface ScoreBreakdownItem {
  label: string;
  points: number;
}

export type ConfirmationStatus = 'pending' | 'confirmed' | 'declined';
export interface ConsultationConfirmation {
  consultationId: string;
  patientName: string;
  dentistName: string;
  time: string;
  status24h: ConfirmationStatus;
  status1h: ConfirmationStatus;
  category?: string;
}

// Mock score history for patient view
export const mockScoreHistory: ConsultationScore[] = [
  {
    id: 'sc-1',
    consultationId: 'gp-1',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    totalPoints: 15,
    feedbackStatus: 'pending',
    dentistFeedbackDate: new Date(2026, 0, 31, 17, 0),
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Confirmação 1h', points: 1 },
      { label: 'Compareceu', points: 5 },
      { label: 'Chegou a horas', points: 2 },
      { label: 'Colaborou durante a consulta', points: 2 },
      { label: 'Higiene oral adequada', points: 2 },
      { label: 'Seguiu recomendações anteriores', points: 2 },
    ],
  },
  {
    id: 'sc-6',
    consultationId: 'sa-1',
    date: new Date(2026, 0, 28),
    dentistName: 'Dra. Sofia Almeida',
    clinicName: 'Clínica SmileCheck',
    totalPoints: 11,
    feedbackStatus: 'pending',
    dentistFeedbackDate: new Date(2026, 0, 28, 16, 30),
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Compareceu', points: 5 },
      { label: 'Chegou a horas', points: 2 },
      { label: 'Colaborou durante a consulta', points: 2 },
      { label: 'Higiene oral adequada', points: 1 },
    ],
  },
  {
    id: 'sc-2',
    consultationId: 'ab-1',
    date: new Date(2026, 0, 24),
    dentistName: 'Dr. Alexandre Bernardo',
    clinicName: 'Clínica SmileCheck',
    totalPoints: 10,
    feedbackStatus: 'completed',
    patientFeedback: { rating: 5, comment: 'Excelente consulta!', submittedAt: new Date(2026, 0, 25) },
    dentistFeedbackDate: new Date(2026, 0, 24, 11, 0),
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Compareceu', points: 5 },
      { label: 'Chegou a horas', points: 2 },
      { label: 'Higiene oral adequada', points: 2 },
    ],
  },
  {
    id: 'sc-3',
    consultationId: 'pat-3',
    date: new Date(2026, 0, 17),
    dentistName: 'Dr. Gil Santos',
    clinicName: 'Clínica SmileCheck',
    totalPoints: -9,
    // Faltas: paciente NÃO recebe notificação para dar feedback, apenas perde pontos
    feedbackStatus: 'completed', // auto-completed (no feedback requested)
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Falta (base)', points: -8 },
      { label: 'Penalização por confirmação', points: -1 },
      { label: 'Cancelamento tardio', points: -1 },
    ],
  },
  {
    id: 'sc-4',
    consultationId: 'pat-1',
    date: new Date(2026, 0, 10),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    totalPoints: 12,
    feedbackStatus: 'completed',
    patientFeedback: { rating: 4, comment: 'Muito bom', submittedAt: new Date(2026, 0, 11) },
    dentistFeedbackDate: new Date(2026, 0, 10, 15, 0),
    breakdown: [
      { label: 'Confirmação 1h', points: 1 },
      { label: 'Compareceu', points: 5 },
      { label: 'Colaborou durante a consulta', points: 2 },
      { label: 'Higiene oral adequada', points: 2 },
      { label: 'Seguiu recomendações anteriores', points: 2 },
    ],
  },
  {
    id: 'sc-5',
    consultationId: 'pat-2',
    date: new Date(2026, 0, 3),
    dentistName: 'Dr. Alexandre Bernardo',
    clinicName: 'Clínica SmileCheck',
    totalPoints: 0,
    feedbackStatus: 'expired',
    breakdown: [
      { label: 'Cancelamento >24h antes', points: 0 },
    ],
  },
];
// Mock confirmations for clinic dashboard
export const mockConfirmations: ConsultationConfirmation[] = [
  { consultationId: 'gp-1', patientName: 'Pedro Almeida', dentistName: 'Dr. Gonçalo Pipo', time: '09:00', status24h: 'confirmed', status1h: 'confirmed', category: 'primeira_consulta' },
  { consultationId: 'gp-2', patientName: 'Maria Silva', dentistName: 'Dr. Gonçalo Pipo', time: '09:30', status24h: 'confirmed', status1h: 'confirmed', category: 'restauracao' },
  { consultationId: 'gp-3', patientName: 'João Costa', dentistName: 'Dr. Gonçalo Pipo', time: '10:00', status24h: 'confirmed', status1h: 'pending', category: 'destartarizacao' },
  { consultationId: 'gp-4', patientName: 'Ana Ferreira', dentistName: 'Dr. Gonçalo Pipo', time: '10:30', status24h: 'confirmed', status1h: 'pending', category: 'urgencia' },
  { consultationId: 'gp-5', patientName: 'Carlos Santos', dentistName: 'Dr. Gonçalo Pipo', time: '11:00', status24h: 'pending', status1h: 'pending', category: 'endodontia' },
  { consultationId: 'ab-1', patientName: 'Beatriz Lopes', dentistName: 'Dr. Alexandre Bernardo', time: '09:00', status24h: 'confirmed', status1h: 'confirmed', category: 'destartarizacao' },
  { consultationId: 'ab-2', patientName: 'Fernando Costa', dentistName: 'Dr. Alexandre Bernardo', time: '09:30', status24h: 'confirmed', status1h: 'pending', category: 'restauracao' },
  { consultationId: 'ab-3', patientName: 'Catarina Reis', dentistName: 'Dr. Alexandre Bernardo', time: '10:00', status24h: 'declined', status1h: 'pending', category: 'primeira_consulta' },
  { consultationId: 'gs-1', patientName: 'Ricardo Oliveira', dentistName: 'Dr. Gil Santos', time: '09:00', status24h: 'confirmed', status1h: 'confirmed', category: 'ortodontia' },
  { consultationId: 'gs-2', patientName: 'Marta Alves', dentistName: 'Dr. Gil Santos', time: '09:30', status24h: 'pending', status1h: 'pending', category: 'protese' },
];
