import { UserRole } from '@/types/calendar';

// New scoring scale for ALL bidirectional feedback (replaces old +5/+1/-3).
// Receiver gets pointsForStars, giver always gets +2 for completing feedback.
export const BIDIRECTIONAL_POINTS: Record<number, number> = {
  1: 0,
  2: 3,
  3: 6,
  4: 10,
  5: 15,
};
export const FEEDBACK_GIVER_REWARD = 2;
export function pointsForStars(stars: number): number {
  return BIDIRECTIONAL_POINTS[stars] ?? 0;
}

export type FeedbackTargetRole = 'patient' | 'dentist' | 'clinic';
export type FeedbackDirection =
  | 'patient_to_dentist'
  | 'patient_to_clinic'
  | 'dentist_to_patient'
  | 'dentist_to_clinic'
  | 'clinic_to_patient'
  | 'clinic_to_dentist';

export interface PendingFeedbackItem {
  id: string;
  /** ID linking the two sides of the same consultation (or D-C link) */
  pairId: string;
  giverRole: UserRole;
  targetRole: FeedbackTargetRole;
  targetId: string;
  targetName: string;
  /** Optional metadata */
  date?: Date;
  time?: string;
  consultationType?: string;
  /** For clinic dashboard listing patient items: which dentist treated them */
  dentistName?: string;
  /** Whether this pending item arose because a consultation completed */
  contextLabel?: string;
  /** Real (DB) items only: the appointment being rated */
  appointmentId?: string;
  /** Real (DB) items only: the recipient's profile UUID */
  targetProfileId?: string;
}

export interface SubmittedFeedback {
  id: string;
  pairId: string;
  direction: FeedbackDirection;
  giverName: string;
  targetName: string;
  targetId: string;
  rating: number;
  comment?: string;
  submittedAt: Date;
}

/* ==================== MOCK PENDING FEEDBACK ==================== */

export const MOCK_PATIENT_PENDING: PendingFeedbackItem[] = [
  {
    id: 'pf-pat-1d',
    pairId: 'cons-pat-gp-0900',
    giverRole: 'patient',
    targetRole: 'dentist',
    targetId: 'dentist-1',
    targetName: 'Dr. Gonçalo Pipo',
    date: new Date(2026, 0, 31),
    time: '09:00',
    contextLabel: 'Clínica SmileCheck',
  },
  {
    id: 'pf-pat-1c',
    pairId: 'cons-pat-gp-0900',
    giverRole: 'patient',
    targetRole: 'clinic',
    targetId: '1',
    targetName: 'Clínica SmileCheck',
    date: new Date(2026, 0, 31),
    time: '09:00',
    contextLabel: 'Dr. Gonçalo Pipo',
  },
  {
    id: 'pf-pat-2d',
    pairId: 'cons-pat-sa-1000',
    giverRole: 'patient',
    targetRole: 'dentist',
    targetId: 'dentist-3',
    targetName: 'Dra. Sofia Almeida',
    date: new Date(2026, 0, 31),
    time: '10:00',
    contextLabel: 'Clínica SmileCheck',
  },
  {
    id: 'pf-pat-2c',
    pairId: 'cons-pat-sa-1000',
    giverRole: 'patient',
    targetRole: 'clinic',
    targetId: '1',
    targetName: 'Clínica SmileCheck',
    date: new Date(2026, 0, 31),
    time: '10:00',
    contextLabel: 'Dra. Sofia Almeida',
  },
];

export const MOCK_DENTIST_PENDING: PendingFeedbackItem[] = [
  {
    id: 'pf-den-1',
    pairId: 'cons-den-jc-1000',
    giverRole: 'dentist',
    targetRole: 'patient',
    targetId: 'pat-joao-costa',
    targetName: 'João Costa',
    date: new Date(2026, 0, 31),
    time: '10:00',
    consultationType: 'destartarizacao',
  },
  {
    id: 'pf-den-2',
    pairId: 'cons-den-af-1030',
    giverRole: 'dentist',
    targetRole: 'patient',
    targetId: 'pat-ana-ferreira',
    targetName: 'Ana Ferreira',
    date: new Date(2026, 0, 31),
    time: '10:30',
    consultationType: 'restauracao',
  },
];

export const MOCK_CLINIC_PENDING: PendingFeedbackItem[] = [
  {
    id: 'pf-cli-1',
    pairId: 'cons-cli-pa-0900',
    giverRole: 'clinic',
    targetRole: 'patient',
    targetId: 'pat-pedro-almeida',
    targetName: 'Pedro Almeida',
    date: new Date(2026, 0, 31),
    time: '09:00',
    dentistName: 'Dr. Gonçalo Pipo',
  },
  {
    id: 'pf-cli-2',
    pairId: 'cons-cli-jc-1000',
    giverRole: 'clinic',
    targetRole: 'patient',
    targetId: 'pat-joao-costa',
    targetName: 'João Costa',
    date: new Date(2026, 0, 31),
    time: '10:00',
    dentistName: 'Dr. Gonçalo Pipo',
  },
];

export function getPendingForRole(role: UserRole): PendingFeedbackItem[] {
  if (role === 'patient') return MOCK_PATIENT_PENDING;
  if (role === 'dentist') return MOCK_DENTIST_PENDING;
  return MOCK_CLINIC_PENDING;
}