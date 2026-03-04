// Shared achievement types and data, extracted from AchievementsView for reuse

export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  progress?: { current: number; target: number };
  secret?: boolean;
}

export interface AchievementCategory {
  title: string;
  achievements: Achievement[];
}

export type BadgeTier = 'easy' | 'medium' | 'hard' | 'expert' | 'legendary' | 'secret';

export function getBadgeTier(achievement: Achievement): BadgeTier {
  if (achievement.secret) return 'secret';
  if (achievement.points >= 76) return 'legendary';
  if (achievement.points >= 51) return 'expert';
  if (achievement.points >= 26) return 'hard';
  if (achievement.points >= 11) return 'medium';
  return 'easy';
}

export const BADGE_TIER_STYLES: Record<BadgeTier, {
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  label: string;
}> = {
  easy: {
    borderColor: 'border-slate-400/60',
    glowColor: 'shadow-slate-400/20',
    bgGradient: 'from-slate-500/20 to-slate-600/20',
    label: 'Fácil',
  },
  medium: {
    borderColor: 'border-blue-400/60',
    glowColor: 'shadow-blue-400/30',
    bgGradient: 'from-blue-500/20 to-blue-600/20',
    label: 'Médio',
  },
  hard: {
    borderColor: 'border-purple-400/60',
    glowColor: 'shadow-purple-400/30',
    bgGradient: 'from-purple-500/20 to-purple-600/20',
    label: 'Difícil',
  },
  expert: {
    borderColor: 'border-amber-400/60',
    glowColor: 'shadow-amber-400/30',
    bgGradient: 'from-amber-500/20 to-amber-600/20',
    label: 'Expert',
  },
  legendary: {
    borderColor: 'border-amber-300/80',
    glowColor: 'shadow-amber-300/40',
    bgGradient: 'from-amber-400/30 to-purple-500/30',
    label: 'Lendário',
  },
  secret: {
    borderColor: 'border-emerald-500/40',
    glowColor: 'shadow-emerald-500/20',
    bgGradient: 'from-emerald-900/30 to-slate-900/30',
    label: 'Secreto',
  },
};

// Default showcased badges per role (pre-selected for demo)
export const DEFAULT_SHOWCASED: Record<string, string[]> = {
  patient: ['p1', 'p5', 'c4', 's1', 'so1', 'so2', 'c1', 'p3'],
  dentist: ['dp1', 'dp4', 'd1', 'd4', 'q4', 'q2', 'q1', 'r1'],
  clinic: ['cl1', 'cl5', 'cl2', 'eq1', 'eq2', 'v1', 'cq1', 'cq2'],
};
