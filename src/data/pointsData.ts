import { UserRole } from '@/types/calendar';

// ===== DUAL POINTS SYSTEM =====

export interface LevelConfig {
  key: string;
  name: string;
  icon: string;
  minXP: number;
  maxXP: number; // exclusive, Infinity for last
  color: string;
  bgColor: string;
  borderColor: string;
}

export const LEVELS: LevelConfig[] = [
  { key: 'lata', name: 'Lata', icon: '🥫', minXP: 0, maxXP: 100, color: 'text-level-can', bgColor: 'bg-level-can/20', borderColor: 'border-level-can/40' },
  { key: 'bronze', name: 'Bronze', icon: '🥉', minXP: 100, maxXP: 300, color: 'text-level-bronze', bgColor: 'bg-level-bronze/20', borderColor: 'border-level-bronze/40' },
  { key: 'prata', name: 'Prata', icon: '🥈', minXP: 300, maxXP: 700, color: 'text-level-silver', bgColor: 'bg-level-silver/20', borderColor: 'border-level-silver/40' },
  { key: 'ouro', name: 'Ouro', icon: '🥇', minXP: 700, maxXP: 1500, color: 'text-level-gold', bgColor: 'bg-level-gold/20', borderColor: 'border-level-gold/40' },
  { key: 'platina', name: 'Platina', icon: '💎', minXP: 1500, maxXP: 3500, color: 'text-white', bgColor: 'bg-white/20', borderColor: 'border-white/40' },
  { key: 'diamante', name: 'Diamante', icon: '💠', minXP: 3500, maxXP: 7000, color: 'text-level-diamond', bgColor: 'bg-level-diamond/20', borderColor: 'border-level-diamond/40' },
  { key: 'adamantino', name: 'Adamantino', icon: '🏆', minXP: 7000, maxXP: 10000, color: 'text-red-500', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/40' },
];

/** Maximum XP a user can accumulate. After Adamantino threshold, they keep earning XP up to this cap. */
export const MAX_XP = 10000;

/** Point multiplier per level — applied to ALL point earnings. */
export const LEVEL_MULTIPLIERS: Record<string, number> = {
  lata: 1.0,
  bronze: 1.1,
  prata: 1.3,
  ouro: 1.5,
  platina: 2.0,
  diamante: 2.5,
  adamantino: 3.0,
};

/** Visual ring color for avatar frame (Tailwind ring color). Lata = no frame. */
export const LEVEL_FRAME_RING: Record<string, string> = {
  lata: '',
  bronze: 'ring-amber-700/70',
  prata: 'ring-slate-300/80',
  ouro: 'ring-amber-400/90',
  platina: 'ring-purple-400/90',
  diamante: 'ring-blue-400/90',
  adamantino: 'ring-amber-300',
};

/** One-time level-up rewards. */
export interface LevelReward {
  bonusPoints: number;
  badgeName: string;
  badgeIcon: string;
  frameLabelKey: string;
}
export const LEVEL_REWARDS: Record<string, LevelReward> = {
  bronze:    { bonusPoints: 25,  badgeName: 'Primeiro Passo',  badgeIcon: '🥉', frameLabelKey: 'level.frame.bronze' },
  prata:     { bonusPoints: 50,  badgeName: 'Em Ascensão',     badgeIcon: '🥈', frameLabelKey: 'level.frame.silver' },
  ouro:      { bonusPoints: 100, badgeName: 'Estrela Dourada', badgeIcon: '🥇', frameLabelKey: 'level.frame.gold' },
  platina:   { bonusPoints: 200, badgeName: 'Elite',           badgeIcon: '💎', frameLabelKey: 'level.frame.platinum' },
  diamante:  { bonusPoints: 400, badgeName: 'Lendário',        badgeIcon: '💠', frameLabelKey: 'level.frame.diamond' },
  adamantino:{ bonusPoints: 800, badgeName: 'Imortal',         badgeIcon: '🏆', frameLabelKey: 'level.frame.adamantine' },
};

// ===== UNLOCKABLE FEATURES PER LEVEL (per role) =====
export interface LevelUnlock {
  key: string;       // i18n key suffix → level.unlocks.<role>.<key>
  badgeSlots?: number;
}

export const LEVEL_UNLOCKS: Record<UserRole, Record<string, LevelUnlock[]>> = {
  patient: {
    lata:       [{ key: 'basicProfile' }, { key: 'badges2', badgeSlots: 2 }, { key: 'basicSearch' }],
    bronze:     [{ key: 'badges3', badgeSlots: 3 }, { key: 'fullHistory' }],
    prata:      [{ key: 'badges4', badgeSlots: 4 }, { key: 'rateClinics' }, { key: 'personalStats' }],
    ouro:       [{ key: 'badges6', badgeSlots: 6 }, { key: 'sealLoyal' }, { key: 'higherWaitingPriority' }],
    platina:    [{ key: 'badges8', badgeSlots: 8 }, { key: 'sealExemplary' }, { key: 'priorityBooking' }, { key: 'earlyVacancy' }],
    diamante:   [{ key: 'badgesUnlimited' }, { key: 'sealDiamond' }, { key: 'maxCancellationPriority' }],
    adamantino: [{ key: 'animatedSeal' }, { key: 'goldenHighlight' }, { key: 'vipSupport' }],
  },
  dentist: {
    lata:       [{ key: 'basicProfile' }, { key: 'badges2', badgeSlots: 2 }, { key: 'clinicRanking' }],
    bronze:     [{ key: 'badges3', badgeSlots: 3 }, { key: 'nationalRankingView' }],
    prata:      [{ key: 'badges4', badgeSlots: 4 }, { key: 'nationalRankingPosition' }, { key: 'basicStats' }],
    ouro:       [{ key: 'badges6', badgeSlots: 6 }, { key: 'sealRecommended' }, { key: 'searchHighlight' }],
    platina:    [{ key: 'badges8', badgeSlots: 8 }, { key: 'sealTop' }, { key: 'searchPriority' }, { key: 'advancedStats' }],
    diamante:   [{ key: 'badgesUnlimited' }, { key: 'sealDiamond' }, { key: 'premiumHighlight' }, { key: 'earlyAccess' }],
    adamantino: [{ key: 'animatedSeal' }, { key: 'goldenFrame' }, { key: 'vipSupport' }, { key: 'betaInvites' }],
  },
  clinic: {
    lata:       [{ key: 'basicProfile' }, { key: 'badges2', badgeSlots: 2 }, { key: 'basicTeam' }],
    bronze:     [{ key: 'badges3', badgeSlots: 3 }, { key: 'basicStats' }],
    prata:      [{ key: 'badges4', badgeSlots: 4 }, { key: 'anonComparison' }, { key: 'monthlyReports' }],
    ouro:       [{ key: 'badges6', badgeSlots: 6 }, { key: 'sealRecommended' }, { key: 'searchHighlight' }],
    platina:    [{ key: 'badges8', badgeSlots: 8 }, { key: 'sealTop' }, { key: 'advancedReports' }, { key: 'maxSearchPriority' }],
    diamante:   [{ key: 'badgesUnlimited' }, { key: 'sealDiamond' }, { key: 'premiumHighlight' }, { key: 'advancedAnalytics' }],
    adamantino: [{ key: 'animatedSeal' }, { key: 'goldenFrame' }, { key: 'vipSupport' }, { key: 'consultancyBadge' }],
  },
};

// ===== PRIORITY × SUBSCRIPTION PLAN =====
/** Boost percentage used for search ranking. */
export function getVisibilityBoost(levelKey: string, plan: 'free' | 'pro' | 'premium'): number {
  const isLow = levelKey === 'lata' || levelKey === 'bronze' || levelKey === 'prata';
  const isMid = levelKey === 'ouro' || levelKey === 'platina';
  // high = diamante / adamantino
  if (isLow) return plan === 'premium' ? 20 : plan === 'pro' ? 10 : 0;
  if (isMid) return plan === 'premium' ? 40 : plan === 'pro' ? 20 : 5;
  return plan === 'premium' ? 60 : plan === 'pro' ? 35 : 15;
}

// Map from level key to translation key
export const LEVEL_TRANSLATION_KEYS: Record<string, string> = {
  lata: 'onboarding.levels.can',
  bronze: 'onboarding.levels.bronze',
  prata: 'onboarding.levels.silver',
  ouro: 'onboarding.levels.gold',
  platina: 'onboarding.levels.platinum',
  diamante: 'onboarding.levels.diamond',
  adamantino: 'onboarding.levels.adamantine',
};

export function getLevelForXP(xp: number): LevelConfig {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(currentLevel: LevelConfig): LevelConfig | null {
  const idx = LEVELS.findIndex(l => l.key === currentLevel.key);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getXPProgress(xp: number): { current: number; target: number; percent: number; remaining: number; nextLevelName: string | null; nextLevelKey: string | null } {
  const level = getLevelForXP(xp);
  const next = getNextLevel(level);
  if (!next) {
    // Adamantino — keep accumulating up to MAX_XP but stay at this level
    return { current: xp, target: MAX_XP, percent: Math.min(100, (xp / MAX_XP) * 100), remaining: Math.max(0, MAX_XP - xp), nextLevelName: null, nextLevelKey: null };
  }
  const range = next.minXP - level.minXP;
  const progress = xp - level.minXP;
  return {
    current: xp,
    target: next.minXP,
    percent: Math.min(100, (progress / range) * 100),
    remaining: next.minXP - xp,
    nextLevelName: next.name,
    nextLevelKey: next.key,
  };
}

// ===== MOCK USER DATA PER ROLE =====
export interface UserPointsData {
  xp: number;
  rewardPoints: number;
  streak: number;
  bestStreak: number;
  plan: 'free' | 'pro' | 'premium';
  todayConsultations: { presencial: number; teleconsulta: number };
}

export const USER_POINTS: Record<UserRole, UserPointsData> = {
  patient: {
    xp: 450,
    rewardPoints: 320,
    streak: 7,
    bestStreak: 21,
    plan: 'pro',
    todayConsultations: { presencial: 1, teleconsulta: 0 },
  },
  dentist: {
    xp: 1850,
    rewardPoints: 850,
    streak: 14,
    bestStreak: 32,
    plan: 'premium',
    todayConsultations: { presencial: 13, teleconsulta: 5 },
  },
  clinic: {
    xp: 3800,
    rewardPoints: 2100,
    streak: 30,
    bestStreak: 45,
    plan: 'pro',
    todayConsultations: { presencial: 40, teleconsulta: 14 },
  },
};

// ===== POINTS EARNING ACTIONS (PER ROLE) =====
export interface PointAction {
  action: string;
  xp: number;
  points: number;
}

// Helper to get earn/penalty actions by role
export function getEarnActionsForRole(role: UserRole): PointAction[] {
  switch (role) {
    case 'patient': return PATIENT_EARN_ACTIONS;
    case 'dentist': return DENTIST_EARN_ACTIONS;
    case 'clinic': return CLINIC_EARN_ACTIONS;
  }
}

export function getPenaltyActionsForRole(role: UserRole): PointAction[] {
  switch (role) {
    case 'patient': return PATIENT_PENALTY_ACTIONS;
    case 'dentist': return DENTIST_PENALTY_ACTIONS;
    case 'clinic': return CLINIC_PENALTY_ACTIONS;
  }
}

// ===== POINTS HISTORY =====
export interface PointsHistoryEntry {
  id: string;
  date: Date;
  time: string;
  description: string;
  xp: number;
  points: number;
  relatedName?: string;
}

export function getPointsHistoryForRole(role: UserRole): PointsHistoryEntry[] {
  switch (role) {
    case 'patient': return PATIENT_POINTS_HISTORY;
    case 'dentist': return DENTIST_POINTS_HISTORY;
    case 'clinic': return CLINIC_POINTS_HISTORY;
  }
}

// ===== STREAK DATA =====
export interface StreakHistory {
  label: string;
  days: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export const MOCK_STREAK_HISTORY: Record<UserRole, StreakHistory[]> = {
  patient: [
    { label: 'Atual', days: 7, startDate: '25 Jan 2026', endDate: 'hoje', isCurrent: true },
    { label: 'Melhor', days: 21, startDate: '1 Dez 2025', endDate: '21 Dez 2025', isCurrent: false },
    { label: 'Anterior', days: 14, startDate: '10 Nov 2025', endDate: '23 Nov 2025', isCurrent: false },
  ],
  dentist: [
    { label: 'Atual', days: 14, startDate: '18 Jan 2026', endDate: 'hoje', isCurrent: true },
    { label: 'Melhor', days: 32, startDate: '1 Dez 2025', endDate: '1 Jan 2026', isCurrent: false },
    { label: 'Anterior', days: 20, startDate: '5 Nov 2025', endDate: '24 Nov 2025', isCurrent: false },
  ],
  clinic: [
    { label: 'Atual', days: 30, startDate: '2 Jan 2026', endDate: 'hoje', isCurrent: true },
    { label: 'Melhor', days: 45, startDate: '15 Out 2025', endDate: '28 Nov 2025', isCurrent: false },
  ],
};

// Check-in calendar mock (January 2026)
export function getCheckinDays(role: UserRole): number[] {
  const streak = USER_POINTS[role].streak;
  const days: number[] = [];
  // Fill in streak days from day 31 going back
  for (let i = 0; i < streak; i++) {
    days.push(31 - i);
  }
  // Add some scattered earlier days
  days.push(15, 10, 5, 3, 1);
  return [...new Set(days)].sort((a, b) => a - b);
}
