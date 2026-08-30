import { UserRole } from '@/types/calendar';

// New scoring scale for ALL bidirectional feedback (replaces old +5/+1/-3).
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

export function getPendingForRole(role: UserRole): PendingFeedbackItem[] {
  if (role === 'patient') return MOCK_PATIENT_PENDING;
  if (role === 'dentist') return MOCK_DENTIST_PENDING;
  return MOCK_CLINIC_PENDING;
}