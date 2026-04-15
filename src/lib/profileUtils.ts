// Level glow styles for badge pills
export const LEVEL_GLOW: Record<string, string> = {
  lata: 'shadow-[0_0_8px_rgba(156,163,175,0.2)]',
  bronze: 'shadow-[0_0_8px_rgba(180,120,60,0.25)]',
  prata: 'shadow-[0_0_8px_rgba(203,213,225,0.2)]',
  ouro: 'shadow-[0_0_8px_rgba(255,215,0,0.2)]',
  platina: 'shadow-[0_0_8px_rgba(168,85,247,0.2)]',
  diamante: 'shadow-[0_0_8px_rgba(33,150,243,0.2)]',
  adamantino: 'shadow-[0_0_8px_rgba(239,68,68,0.25)]',
};

// Trend data for stats (mock)
export interface TrendData {
  direction: 'up' | 'down' | 'neutral';
  value: string;
}

export const DENTIST_TRENDS: Record<string, TrendData> = {
  totalConsultations: { direction: 'up', value: '12%' },
  teleconsultations: { direction: 'up', value: '8%' },
  confirmationRate: { direction: 'down', value: '2%' },
  avgDuration: { direction: 'neutral', value: '' },
};

export const PATIENT_TRENDS: Record<string, TrendData> = {
  totalConsultations: { direction: 'up', value: '15%' },
  teleconsultations: { direction: 'up', value: '25%' },
  attendance: { direction: 'neutral', value: '' },
};

export const CLINIC_TRENDS: Record<string, TrendData> = {
  totalConsultations: { direction: 'up', value: '10%' },
  activePatients: { direction: 'up', value: '5%' },
  confirmationRate: { direction: 'down', value: '1%' },
  activeDentists: { direction: 'neutral', value: '' },
};

export function getTrendDisplay(trend: TrendData) {
  if (trend.direction === 'up') return { arrow: '↑', color: 'text-emerald-400', text: trend.value };
  if (trend.direction === 'down') return { arrow: '↓', color: 'text-destructive', text: trend.value };
  return { arrow: '→', color: 'text-muted-foreground', text: '' };
}

// Relative date formatting
export function formatRelativeDate(dateStr: string): string {
  // Already relative (e.g. "28 Jan 2026", "Há 2 dias")
  if (!dateStr.match(/^\d{4}-\d{2}-\d{2}/)) return dateStr;

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return formatReadableDate(date);
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return formatReadableDate(date);
}

function formatReadableDate(date: Date): string {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
