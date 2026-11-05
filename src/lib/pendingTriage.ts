import type { TriageData } from '@/types/triage';

/**
 * Triage answers waiting for the next booking in this tab. Answers only (no
 * photos, no AI text): general guidance, never a diagnosis. Stored in
 * sessionStorage for at most 2 hours and consumed by the booking.
 */
const KEY = 'sc:pending-triage';
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export interface TriageAnswers {
  symptoms: string[]; otherSymptom: string; selectedTeeth: string[]; unknownLocation: boolean;
  duration: string; painIntensity: number; isRoutineCheckup: boolean; photos: number;
}

export function toAnswers(d: TriageData): TriageAnswers {
  return {
    symptoms: d.symptoms.slice(0, 20), otherSymptom: (d.otherSymptom ?? '').slice(0, 500),
    selectedTeeth: d.selectedTeeth.slice(0, 32), unknownLocation: d.unknownLocation, duration: d.duration,
    painIntensity: Math.max(0, Math.min(10, Number(d.painIntensity) || 0)), isRoutineCheckup: d.isRoutineCheckup,
    photos: d.photos.length,
  };
}

export function savePendingTriage(d: TriageData, now = Date.now()) {
  try { sessionStorage.setItem(KEY, JSON.stringify({ at: now, answers: toAnswers(d) })); } catch { /* ignore */ }
}

/** Returns and clears the pending answers (null if none or expired). */
export function takePendingTriage(now = Date.now()): TriageAnswers | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { at: number; answers: TriageAnswers };
    return now - v.at <= MAX_AGE_MS ? v.answers : null;
  } catch { return null; }
}
