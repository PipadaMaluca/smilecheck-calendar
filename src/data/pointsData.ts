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
  { key: 'bronze', name: 'Bronze', icon: '🥉', minXP: 100, maxXP: 250, color: 'text-level-bronze', bgColor: 'bg-level-bronze/20', borderColor: 'border-level-bronze/40' },
  { key: 'prata', name: 'Prata', icon: '🥈', minXP: 250, maxXP: 500, color: 'text-level-silver', bgColor: 'bg-level-silver/20', borderColor: 'border-level-silver/40' },
  { key: 'ouro', name: 'Ouro', icon: '🥇', minXP: 500, maxXP: 1000, color: 'text-level-gold', bgColor: 'bg-level-gold/20', borderColor: 'border-level-gold/40' },
  { key: 'platina', name: 'Platina', icon: '💎', minXP: 1000, maxXP: 2000, color: 'text-white', bgColor: 'bg-white/20', borderColor: 'border-white/40' },
  { key: 'diamante', name: 'Diamante', icon: '💠', minXP: 2000, maxXP: 5000, color: 'text-level-diamond', bgColor: 'bg-level-diamond/20', borderColor: 'border-level-diamond/40' },
  { key: 'adamantino', name: 'Adamantino', icon: '🔱', minXP: 5000, maxXP: Infinity, color: 'text-red-500', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/40' },
];

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

export function getXPProgress(xp: number): { current: number; target: number; percent: number; remaining: number; nextLevelName: string | null } {
  const level = getLevelForXP(xp);
  const next = getNextLevel(level);
  if (!next) return { current: xp, target: xp, percent: 100, remaining: 0, nextLevelName: null };
  const range = next.minXP - level.minXP;
  const progress = xp - level.minXP;
  return {
    current: xp,
    target: next.minXP,
    percent: Math.min(100, (progress / range) * 100),
    remaining: next.minXP - xp,
    nextLevelName: next.name,
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
    xp: 1250,
    rewardPoints: 850,
    streak: 14,
    bestStreak: 32,
    plan: 'pro',
    todayConsultations: { presencial: 13, teleconsulta: 5 },
  },
  clinic: {
    xp: 3800,
    rewardPoints: 2100,
    streak: 30,
    bestStreak: 45,
    plan: 'premium',
    todayConsultations: { presencial: 40, teleconsulta: 14 },
  },
};

// ===== POINTS EARNING ACTIONS (PER ROLE) =====
export interface PointAction {
  action: string;
  xp: number;
  points: number;
}

// PATIENT: 2x values
export const PATIENT_EARN_ACTIONS: PointAction[] = [
  { action: 'Confirmação 24h', xp: 2, points: 2 },
  { action: 'Confirmação 1h', xp: 2, points: 2 },
  { action: 'Compareceu', xp: 10, points: 10 },
  { action: 'Chegou a horas', xp: 4, points: 4 },
  { action: 'Colaborou durante consulta', xp: 4, points: 4 },
  { action: 'Higiene oral adequada', xp: 4, points: 4 },
  { action: 'Seguiu recomendações', xp: 4, points: 4 },
  { action: 'Avaliação 5★', xp: 10, points: 10 },
  { action: 'Avaliação 4★', xp: 6, points: 6 },
  { action: 'Deixar avaliação', xp: 2, points: 2 },
  { action: 'Convidar amigo', xp: 20, points: 20 },
  { action: 'Check-in diário', xp: 2, points: 2 },
  { action: 'Streak 7 dias', xp: 10, points: 10 },
  { action: 'Streak 30 dias', xp: 30, points: 30 },
];

export const PATIENT_PENALTY_ACTIONS: PointAction[] = [
  { action: 'Falta não justificada (base)', xp: 0, points: -16 },
  { action: 'Penalização por confirmação', xp: 0, points: -2 },
  { action: 'Cancelamento tardio', xp: 0, points: -2 },
];

// DENTIST: 1x values
export const DENTIST_EARN_ACTIONS: PointAction[] = [
  { action: 'Consulta concluída', xp: 8, points: 8 },
  { action: 'Teleconsulta', xp: 10, points: 10 },
  { action: 'Responder mensagem em 24h', xp: 2, points: 2 },
  { action: 'Emitir receita', xp: 1, points: 1 },
  { action: 'Carta de referência', xp: 2, points: 2 },
  { action: 'Avaliação 5★', xp: 5, points: 5 },
  { action: 'Avaliação 4★', xp: 3, points: 3 },
  { action: 'Check-in diário', xp: 1, points: 1 },
  { action: 'Streak 7 dias', xp: 5, points: 5 },
  { action: 'Streak 30 dias', xp: 15, points: 15 },
];

export const DENTIST_PENALTY_ACTIONS: PointAction[] = [
  { action: 'Cancelamento de consulta tardio', xp: 0, points: -5 },
  { action: 'Não responder mensagem 48h', xp: 0, points: -2 },
];

// CLINIC: 1x values
export const CLINIC_EARN_ACTIONS: PointAction[] = [
  { action: 'Consulta na clínica', xp: 3, points: 3 },
  { action: 'Teleconsulta', xp: 5, points: 5 },
  { action: 'Avaliação 5★', xp: 5, points: 5 },
  { action: 'Novo dentista ativo', xp: 15, points: 15 },
  { action: 'Taxa confirmação >90% (semanal)', xp: 10, points: 10 },
  { action: 'Check-in diário', xp: 1, points: 1 },
  { action: 'Streak 7 dias', xp: 5, points: 5 },
  { action: 'Streak 30 dias', xp: 15, points: 15 },
];

export const CLINIC_PENALTY_ACTIONS: PointAction[] = [
  { action: 'Reclamação não resolvida', xp: 0, points: -10 },
];

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

// Patient history (2x values)
export const PATIENT_POINTS_HISTORY: PointsHistoryEntry[] = [
  { id: 'ph-1', date: new Date(2026, 0, 31), time: '09:15', description: 'Confirmação 24h', xp: 2, points: 2, relatedName: 'Dr. Gonçalo Pipo' },
  { id: 'ph-2', date: new Date(2026, 0, 31), time: '09:00', description: 'Compareceu', xp: 10, points: 10, relatedName: 'Dr. Gonçalo Pipo' },
  { id: 'ph-3', date: new Date(2026, 0, 31), time: '09:00', description: 'Chegou a horas', xp: 4, points: 4, relatedName: 'Dr. Gonçalo Pipo' },
  { id: 'ph-4', date: new Date(2026, 0, 31), time: '09:00', description: 'Colaborou durante consulta', xp: 4, points: 4, relatedName: 'Dr. Gonçalo Pipo' },
  { id: 'ph-5', date: new Date(2026, 0, 30), time: '08:00', description: 'Check-in diário', xp: 2, points: 2 },
  { id: 'ph-6', date: new Date(2026, 0, 29), time: '08:00', description: 'Check-in diário', xp: 2, points: 2 },
  { id: 'ph-7', date: new Date(2026, 0, 28), time: '10:00', description: 'Falta não justificada', xp: 0, points: -16, relatedName: 'Dr. Alexandre Bernardo' },
  { id: 'ph-8', date: new Date(2026, 0, 28), time: '10:00', description: 'Penalização por confirmação', xp: 0, points: -2, relatedName: 'Dr. Alexandre Bernardo' },
  { id: 'ph-9', date: new Date(2026, 0, 27), time: '08:00', description: 'Check-in diário', xp: 2, points: 2 },
  { id: 'ph-10', date: new Date(2026, 0, 24), time: '11:00', description: 'Avaliação 5★ (Dentista)', xp: 10, points: 10, relatedName: 'Dr. Alexandre Bernardo' },
  { id: 'ph-11', date: new Date(2026, 0, 24), time: '11:00', description: 'Avaliação 5★ (Clínica)', xp: 10, points: 10, relatedName: 'Clínica SmileCheck' },
  { id: 'ph-12', date: new Date(2026, 0, 20), time: '14:00', description: 'Streak 7 dias', xp: 10, points: 10 },
  { id: 'ph-13', date: new Date(2026, 0, 15), time: '10:00', description: 'Convidar amigo', xp: 20, points: 20 },
];

// Dentist history (1x values)
export const DENTIST_POINTS_HISTORY: PointsHistoryEntry[] = [
  { id: 'dh-1', date: new Date(2026, 0, 31), time: '09:30', description: 'Consulta concluída', xp: 8, points: 8, relatedName: 'Pedro Almeida' },
  { id: 'dh-2', date: new Date(2026, 0, 31), time: '10:00', description: 'Consulta concluída', xp: 8, points: 8, relatedName: 'Maria Silva' },
  { id: 'dh-3', date: new Date(2026, 0, 31), time: '10:30', description: 'Teleconsulta', xp: 10, points: 10, relatedName: 'Ana Ferreira' },
  { id: 'dh-4', date: new Date(2026, 0, 31), time: '11:00', description: 'Emitir receita', xp: 1, points: 1, relatedName: 'Pedro Almeida' },
  { id: 'dh-5', date: new Date(2026, 0, 30), time: '08:00', description: 'Check-in diário', xp: 1, points: 1 },
  { id: 'dh-6', date: new Date(2026, 0, 30), time: '14:00', description: 'Avaliação 5★', xp: 5, points: 5, relatedName: 'Carlos Santos' },
  { id: 'dh-7', date: new Date(2026, 0, 29), time: '09:00', description: 'Responder mensagem em 24h', xp: 2, points: 2, relatedName: 'Beatriz Lopes' },
  { id: 'dh-8', date: new Date(2026, 0, 28), time: '16:00', description: 'Carta de referência', xp: 2, points: 2, relatedName: 'João Silva' },
  { id: 'dh-9', date: new Date(2026, 0, 24), time: '14:00', description: 'Streak 7 dias', xp: 5, points: 5 },
  { id: 'dh-10', date: new Date(2026, 0, 20), time: '10:00', description: 'Cancelamento de consulta tardio', xp: 0, points: -5, relatedName: 'Rita Oliveira' },
];

// Clinic history (1x values)
export const CLINIC_POINTS_HISTORY: PointsHistoryEntry[] = [
  { id: 'ch-1', date: new Date(2026, 0, 31), time: '09:30', description: 'Consulta na clínica', xp: 3, points: 3, relatedName: 'Pedro Almeida' },
  { id: 'ch-2', date: new Date(2026, 0, 31), time: '10:00', description: 'Consulta na clínica', xp: 3, points: 3, relatedName: 'Maria Silva' },
  { id: 'ch-3', date: new Date(2026, 0, 31), time: '10:30', description: 'Teleconsulta', xp: 5, points: 5, relatedName: 'Ana Ferreira' },
  { id: 'ch-4', date: new Date(2026, 0, 30), time: '08:00', description: 'Check-in diário', xp: 1, points: 1 },
  { id: 'ch-5', date: new Date(2026, 0, 28), time: '09:00', description: 'Avaliação 5★', xp: 5, points: 5, relatedName: 'Carlos Santos' },
  { id: 'ch-6', date: new Date(2026, 0, 25), time: '10:00', description: 'Taxa confirmação >90% (semanal)', xp: 10, points: 10 },
  { id: 'ch-7', date: new Date(2026, 0, 20), time: '12:00', description: 'Novo dentista ativo', xp: 15, points: 15, relatedName: 'Dr. Fábio Lobo' },
  { id: 'ch-8', date: new Date(2026, 0, 15), time: '10:00', description: 'Reclamação não resolvida', xp: 0, points: -10, relatedName: 'Rita Oliveira' },
];

// Keep old export for backward compat
export const MOCK_POINTS_HISTORY = PATIENT_POINTS_HISTORY;

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
