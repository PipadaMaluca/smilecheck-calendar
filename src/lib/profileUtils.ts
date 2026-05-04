import i18n from '@/i18n';
import { formatDate } from '@/lib/formatters';

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

// Relative date formatting — accepts ISO, DD/MM/YYYY, and "28 Jan 2026" inputs.
export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  // Skip already-relative strings
  if (/^(Há|Hace|There|Ago|Il y a)/i.test(dateStr)) return dateStr;

  let date: Date | null = null;
  // ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    date = new Date(dateStr);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    // DD/MM/YYYY
    const [d, m, y] = dateStr.split('/').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    // Try "28 Jan 2026" style — Date constructor handles English month abbrev.
    // For PT abbreviations we try a small map.
    const PT = { Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5, Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11 } as Record<string, number>;
    const m = dateStr.match(/^(\d{1,2})\s+([A-Za-zçÇãÃéÉ]{3,})\s+(\d{4})$/);
    if (m) {
      const monthIdx = PT[m[2].slice(0, 3).replace(/^./, c => c.toUpperCase())];
      if (monthIdx !== undefined) date = new Date(Number(m[3]), monthIdx, Number(m[1]));
    }
    if (!date) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) date = parsed;
    }
  }

  if (!date || isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return formatReadableDate(date);
  if (diffDays === 0) return i18n.t('common.today');
  if (diffDays === 1) return i18n.t('common.yesterday');
  if (diffDays < 7) return i18n.t('common.daysAgo', { n: diffDays });
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return i18n.t('common.weeksAgo', { n: weeks, defaultValue: weeks === 1 ? 'Há 1 semana' : `Há ${weeks} semanas` });
  }
  return formatReadableDate(date);
}

function formatReadableDate(date: Date): string {
  return formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' });
}
