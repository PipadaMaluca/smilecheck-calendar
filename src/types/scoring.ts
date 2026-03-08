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
  patientName?: string;
  category?: string;
  consultationTime?: string;
  totalPoints: number;
  breakdown: ScoreBreakdownItem[];
  feedbackStatus: FeedbackStatus;
  patientFeedback?: PatientFeedback;
  receivedRating?: number;
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
  /** true when the patient was a no-show (falta) — makes 1h column irrelevant */
  isNoShow?: boolean;
}

// Mock score history for patient view
export const mockScoreHistory: ConsultationScore[] = [
  {
    id: 'sc-1',
    consultationId: 'gp-1',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Pedro Almeida',
    category: 'primeira_consulta',
    consultationTime: '09:00',
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
    patientName: 'Ana Costa',
    category: 'restauracao',
    consultationTime: '10:00',
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
    patientName: 'Marta Santos',
    category: 'primeira_consulta',
    consultationTime: '11:00',
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
    id: 'sc-4',
    consultationId: 'pat-1',
    date: new Date(2026, 0, 10),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'João Mendes',
    category: 'endodontia',
    consultationTime: '10:15',
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
    patientName: 'Inês Marques',
    category: 'ortodontia',
    consultationTime: '09:30',
    totalPoints: 0,
    feedbackStatus: 'expired',
    breakdown: [
      { label: 'Cancelamento >24h antes', points: 0 },
    ],
  },
];

// ===== DENTIST HISTORY =====
// Dr. Gonçalo Pipo — sorted: expirados first, then today by time, then past by date desc
export const mockDentistScoreHistory: ConsultationScore[] = [
  // Expirado (previous month — feedback expired yesterday)
  {
    id: 'dh-exp',
    consultationId: 'prev-exp',
    date: new Date(2025, 11, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Sofia Rodrigues',
    category: 'ortodontia',
    consultationTime: '10:00',
    totalPoints: 0,
    feedbackStatus: 'expired',
    breakdown: [
      { label: 'Período de feedback expirado — pontos não atribuídos', points: 0 },
    ],
  },
  // Today 09:00 — Pedro Almeida — Concluído +15
  {
    id: 'dh-1',
    consultationId: 'gp-1',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Pedro Almeida',
    category: 'primeira_consulta',
    consultationTime: '09:00',
    totalPoints: 15,
    feedbackStatus: 'completed',
    patientFeedback: { rating: 5, comment: 'Excelente consulta!', submittedAt: new Date(2026, 0, 31, 12, 0) },
    dentistFeedbackDate: new Date(2026, 0, 31, 9, 30),
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
  // Today 09:30 — Maria Silva — Falta -9
  {
    id: 'dh-2',
    consultationId: 'gp-2',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Maria Silva',
    category: 'restauracao',
    consultationTime: '09:30',
    totalPoints: -9,
    feedbackStatus: 'completed',
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Falta (base)', points: -8 },
      { label: 'Penalização por confirmação', points: -1 },
      { label: 'Cancelamento tardio', points: -1 },
    ],
  },
  // Today 10:00 — João Costa — Pendente (em consulta) +2
  {
    id: 'dh-3',
    consultationId: 'gp-3',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'João Costa',
    category: 'destartarizacao',
    consultationTime: '10:00',
    totalPoints: 2,
    feedbackStatus: 'pending',
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Confirmação 1h', points: 1 },
    ],
  },
  // Today 10:30 — Ana Ferreira — Pendente (sala de espera) +1
  {
    id: 'dh-4',
    consultationId: 'gp-4',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Ana Ferreira',
    category: 'urgencia',
    consultationTime: '10:30',
    totalPoints: 1,
    feedbackStatus: 'pending',
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
    ],
  },
];

// ===== CLINIC HISTORY =====
// All dentists combined, sorted: expirados first, then today by time, then past by date desc
export const mockClinicScoreHistory: ConsultationScore[] = [
  // --- Expirados ---
  {
    id: 'ch-exp-1',
    consultationId: 'prev-exp-gp',
    date: new Date(2025, 11, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Sofia Rodrigues',
    category: 'ortodontia',
    consultationTime: '',
    totalPoints: 0,
    feedbackStatus: 'expired',
    breakdown: [
      { label: 'Período de feedback expirado — pontos não atribuídos', points: 0 },
    ],
  },
  // --- Today 09:00 ---
  {
    id: 'ch-1',
    consultationId: 'gp-1',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Pedro Almeida',
    category: 'primeira_consulta',
    consultationTime: '09:00',
    totalPoints: 15,
    feedbackStatus: 'completed',
    patientFeedback: { rating: 5, comment: 'Excelente consulta!', submittedAt: new Date(2026, 0, 31, 12, 0) },
    dentistFeedbackDate: new Date(2026, 0, 31, 9, 30),
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
    id: 'ch-2',
    consultationId: 'gs-1',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gil Santos',
    clinicName: 'Clínica SmileCheck',
    patientName: 'André Gomes',
    category: 'destartarizacao',
    consultationTime: '09:00',
    totalPoints: 12,
    feedbackStatus: 'completed',
    patientFeedback: { rating: 5, submittedAt: new Date(2026, 0, 31, 10, 0) },
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Confirmação 1h', points: 1 },
      { label: 'Compareceu', points: 5 },
      { label: 'Chegou a horas', points: 2 },
      { label: 'Colaborou durante a consulta', points: 2 },
      { label: 'Seguiu recomendações anteriores', points: 1 },
    ],
  },
  {
    id: 'ch-3',
    consultationId: 'ab-1c',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Alexandre Bernardo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Inês Marques',
    category: 'protese',
    consultationTime: '09:00',
    totalPoints: 10,
    feedbackStatus: 'completed',
    patientFeedback: { rating: 4, comment: 'Muito boa consulta', submittedAt: new Date(2026, 0, 31, 11, 0) },
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Confirmação 1h', points: 1 },
      { label: 'Compareceu', points: 5 },
      { label: 'Chegou a horas', points: 2 },
      { label: 'Higiene oral adequada', points: 1 },
    ],
  },
  // --- Today 09:30 ---
  {
    id: 'ch-4',
    consultationId: 'gp-2c',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Maria Silva',
    category: 'restauracao',
    consultationTime: '09:30',
    totalPoints: -9,
    feedbackStatus: 'completed',
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Falta (base)', points: -8 },
      { label: 'Penalização por confirmação', points: -1 },
      { label: 'Cancelamento tardio', points: -1 },
    ],
  },
  {
    id: 'ch-5',
    consultationId: 'gs-2c',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gil Santos',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Mariana Reis',
    category: 'primeira_consulta',
    consultationTime: '09:30',
    totalPoints: -8,
    feedbackStatus: 'completed',
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Falta (base)', points: -8 },
      { label: 'Penalização por confirmação', points: -1 },
    ],
  },
  // --- Today 10:00 ---
  {
    id: 'ch-6',
    consultationId: 'gp-3c',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'João Costa',
    category: 'destartarizacao',
    consultationTime: '10:00',
    totalPoints: 2,
    feedbackStatus: 'pending',
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Confirmação 1h', points: 1 },
    ],
  },
  {
    id: 'ch-7',
    consultationId: 'ab-2c',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Alexandre Bernardo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Miguel Almeida',
    category: 'cirurgia',
    consultationTime: '10:00',
    totalPoints: 2,
    feedbackStatus: 'pending',
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Confirmação 1h', points: 1 },
    ],
  },
  {
    id: 'ch-8',
    consultationId: 'gs-3c',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gil Santos',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Catarina Dias',
    category: 'endodontia',
    consultationTime: '10:00',
    totalPoints: 2,
    feedbackStatus: 'pending',
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
      { label: 'Confirmação 1h', points: 1 },
    ],
  },
  // --- Today 10:30 ---
  {
    id: 'ch-9',
    consultationId: 'gp-4c',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Gonçalo Pipo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Ana Ferreira',
    category: 'urgencia',
    consultationTime: '10:30',
    totalPoints: 1,
    feedbackStatus: 'pending',
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
    ],
  },
  {
    id: 'ch-10',
    consultationId: 'ab-3c',
    date: new Date(2026, 0, 31),
    dentistName: 'Dr. Alexandre Bernardo',
    clinicName: 'Clínica SmileCheck',
    patientName: 'Bruno Cardoso',
    category: 'restauracao',
    consultationTime: '10:30',
    totalPoints: 1,
    feedbackStatus: 'pending',
    breakdown: [
      { label: 'Confirmação 24h', points: 1 },
    ],
  },
];

// Mock confirmations — only upcoming (agendada/confirmada, not em_consulta/em_sala_espera/visto/falta)
export const mockConfirmations: ConsultationConfirmation[] = [
  // Dr. Gonçalo Pipo (✓ 3 · ● 7 · ✗ 0)
  { consultationId: 'gp-5', patientName: 'Carlos Santos', dentistName: 'Dr. Gonçalo Pipo', time: '11:00', status24h: 'confirmed', status1h: 'pending', category: 'endodontia' },
  { consultationId: 'gp-6', patientName: 'Rita Oliveira', dentistName: 'Dr. Gonçalo Pipo', time: '12:00', status24h: 'pending', status1h: 'pending', category: 'teleconsulta' },
  { consultationId: 'gp-7', patientName: 'Lucas Mendes', dentistName: 'Dr. Gonçalo Pipo', time: '12:30', status24h: 'confirmed', status1h: 'confirmed', category: 'odontopediatria' },
  { consultationId: 'gp-8', patientName: 'Miguel Rodrigues', dentistName: 'Dr. Gonçalo Pipo', time: '14:00', status24h: 'pending', status1h: 'pending', category: 'cirurgia' },
  { consultationId: 'gp-9', patientName: 'Teresa Martins', dentistName: 'Dr. Gonçalo Pipo', time: '15:00', status24h: 'confirmed', status1h: 'pending', category: 'protese' },
  // Dr. Alexandre Bernardo (✓ 5 · ● 5 · ✗ 0)
  { consultationId: 'ab-c1', patientName: 'Beatriz Lopes', dentistName: 'Dr. Alexandre Bernardo', time: '09:00', status24h: 'confirmed', status1h: 'confirmed', category: 'destartarizacao' },
  { consultationId: 'ab-c2', patientName: 'Fernando Costa', dentistName: 'Dr. Alexandre Bernardo', time: '09:30', status24h: 'confirmed', status1h: 'pending', category: 'restauracao' },
  { consultationId: 'ab-c3', patientName: 'Catarina Reis', dentistName: 'Dr. Alexandre Bernardo', time: '10:00', status24h: 'pending', status1h: 'pending', category: 'primeira_consulta' },
  { consultationId: 'ab-c4', patientName: 'Manuel Sousa', dentistName: 'Dr. Alexandre Bernardo', time: '10:30', status24h: 'confirmed', status1h: 'confirmed', category: 'endodontia' },
  { consultationId: 'ab-c5', patientName: 'Joana Martins', dentistName: 'Dr. Alexandre Bernardo', time: '11:30', status24h: 'confirmed', status1h: 'pending', category: 'urgencia' },
  // Dr. Gil Santos (✓ 4 · ● 6 · ✗ 0)
  { consultationId: 'gs-c1', patientName: 'Daniela Fernandes', dentistName: 'Dr. Gil Santos', time: '09:00', status24h: 'confirmed', status1h: 'confirmed', category: 'restauracao' },
  { consultationId: 'gs-c2', patientName: 'José Ribeiro', dentistName: 'Dr. Gil Santos', time: '09:30', status24h: 'pending', status1h: 'pending', category: 'primeira_consulta' },
  { consultationId: 'gs-c3', patientName: 'Sónia Carvalho', dentistName: 'Dr. Gil Santos', time: '10:00', status24h: 'confirmed', status1h: 'pending', category: 'endodontia' },
  { consultationId: 'gs-c4', patientName: 'Pedro Mendes', dentistName: 'Dr. Gil Santos', time: '11:00', status24h: 'pending', status1h: 'pending', category: 'urgencia' },
  { consultationId: 'gs-c5', patientName: 'Liliana Costa', dentistName: 'Dr. Gil Santos', time: '11:30', status24h: 'confirmed', status1h: 'confirmed', category: 'destartarizacao' },
];
