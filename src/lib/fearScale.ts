import { Smile, Meh, Frown, AlertTriangle, ShieldAlert, type LucideIcon } from 'lucide-react';

export type FearLevel = 0 | 1 | 2 | 3 | 4;
export const FEAR_LEVELS: FearLevel[] = [0, 1, 2, 3, 4];

/** Icon and colour tokens per level (0 neutral, 1 green, 2 amber, 3 orange, 4 red). Texts live in i18n `fear.levels.<n>`. */
export const FEAR_META: Record<FearLevel, { icon: LucideIcon; text: string; bg: string; border: string }> = {
  0: { icon: Smile, text: 'text-fear-0', bg: 'bg-fear-0/15', border: 'border-fear-0/40' },
  1: { icon: Meh, text: 'text-fear-1', bg: 'bg-fear-1/15', border: 'border-fear-1/40' },
  2: { icon: Frown, text: 'text-fear-2', bg: 'bg-fear-2/15', border: 'border-fear-2/40' },
  3: { icon: AlertTriangle, text: 'text-fear-3', bg: 'bg-fear-3/15', border: 'border-fear-3/40' },
  4: { icon: ShieldAlert, text: 'text-fear-4', bg: 'bg-fear-4/15', border: 'border-fear-4/40' },
};

export const clampFear = (n: number | null | undefined): FearLevel | null =>
  n === null || n === undefined || Number.isNaN(n) ? null : (Math.max(0, Math.min(4, Math.round(n))) as FearLevel);

/** Value shown to professionals: their latest assessment when it exists, otherwise the patient's self-assessment. */
export function effectiveFear(patientLevel: number | null | undefined, professionalLevel: number | null | undefined) {
  return clampFear(professionalLevel) ?? clampFear(patientLevel);
}

/** A discreet warning appears when both values exist and differ by 2 or more. */
export function fearMismatch(patientLevel: number | null | undefined, professionalLevel: number | null | undefined) {
  const p = clampFear(patientLevel);
  const c = clampFear(professionalLevel);
  return p !== null && c !== null && Math.abs(p - c) >= 2;
}

/** Agenda cards only flag patients from level 2 up. */
export const showFearDotOnCard = (level: number | null | undefined) => (clampFear(level) ?? 0) >= 2;
