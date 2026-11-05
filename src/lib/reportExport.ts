import { addDays, isWithinInterval, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, startOfWeek } from 'date-fns';
import type { TFunction } from 'i18next';
import type { Consultation, UserRole } from '@/types/calendar';
import { STATUS_CONFIG, getCategoryLabel } from '@/types/calendar';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { dentistKey } from '@/data/kpis';

/**
 * Real-account report builder. Input must already be the RLS-scoped, role-scoped
 * appointments (useKpiData). Output carries only scheduling columns — never clinical
 * notes, triage, fear, phone, e-mail or birth date of anyone.
 */
export type ReportPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

/** Maps the period ids used by both export screens to one vocabulary. */
export const normalizePeriod = (id: string): ReportPeriod =>
  (({ today: 'today', hoje: 'today', thisWeek: 'week', semana: 'week', thisMonth: 'month', mes: 'month',
    thisQuarter: 'quarter', thisYear: 'year', custom: 'custom', personalizado: 'custom' } as Record<string, ReportPeriod>)[id] ?? 'month');

export function periodBounds(period: ReportPeriod, today: Date, from?: string, to?: string): { start: Date; end: Date } | null {
  switch (period) {
    case 'today': return { start: today, end: today };
    case 'week': { const s = startOfWeek(today, { weekStartsOn: 1 }); return { start: s, end: addDays(s, 6) }; }
    case 'month': return { start: startOfMonth(today), end: endOfMonth(today) };
    case 'quarter': return { start: startOfQuarter(today), end: endOfQuarter(today) };
    case 'year': return { start: startOfYear(today), end: endOfYear(today) };
    case 'custom': {
      if (!from || !to) return null;
      const [ys, ms, ds] = from.split('-').map(Number);
      const [ye, me, de] = to.split('-').map(Number);
      const start = new Date(ys, ms - 1, ds);
      const end = new Date(ye, me - 1, de);
      return start <= end ? { start, end } : null;
    }
  }
}

export function selectReportRows(
  cons: Consultation[], opts: { period: ReportPeriod; today: Date; from?: string; to?: string; dentistId?: string },
): Consultation[] {
  const b = periodBounds(opts.period, opts.today, opts.from, opts.to);
  if (!b) return [];
  return cons
    .filter((c) => isWithinInterval(c.date, b))
    .filter((c) => !opts.dentistId || dentistKey(c) === opts.dentistId)
    .sort((a, b2) => a.date.getTime() - b2.date.getTime() || a.time.localeCompare(b2.time));
}

const csvCell = (v: string) => (/[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Column set allowed in exports — the test asserts nothing else leaks. */
export const REPORT_COLUMNS = ['date', 'time', 'patient', 'dentist', 'clinic', 'type', 'status', 'price'] as const;

export function reportTable(rows: Consultation[], role: UserRole, t: TFunction): string[][] {
  const cols = REPORT_COLUMNS.filter((c) => !(role === 'patient' && c === 'price'));
  const header = cols.map((c) => t(`export.columns.${c}`));
  const body = rows.map((c) => cols.map((col) => {
    switch (col) {
      case 'date': return formatDate(c.date, { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'time': return c.time;
      case 'patient': return c.patient.name;
      case 'dentist': return c.dentist.name;
      case 'clinic': return c.clinic.name;
      case 'type': return c.type === 'teleconsulta' ? t('dashboard.teleconsultations') : c.category ? getCategoryLabel(t, c.category) : '';
      case 'status': return c.status ? STATUS_CONFIG[c.status]?.label ?? '' : '';
      case 'price': return formatCurrency(c.price || 0);
    }
  }));
  return [header, ...body];
}

export function buildReport(rows: Consultation[], role: UserRole, t: TFunction, format: 'csv' | 'text'): string {
  const table = reportTable(rows, role, t);
  if (format === 'csv') return '\uFEFF' + table.map((r) => r.map(csvCell).join(';')).join('\n');
  return [`SmileCheck — ${formatDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric' })}`, '', ...table.map((r) => r.join('  |  '))].join('\n');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Real PDF (jsPDF + autotable): SmileCheck header, report name, period, generation date, same columns. */
export async function buildReportPdf(
  rows: Consultation[], role: UserRole, t: TFunction,
  meta: { title: string; period: string },
): Promise<Blob> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const [header, ...body] = reportTable(rows, role, t);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text('SmileCheck', 40, 48);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
  doc.text(meta.title, 40, 70);
  doc.setFontSize(10);
  doc.text(`${t('export.pdf.period')}: ${meta.period}`, 40, 88);
  doc.text(`${t('export.pdf.generatedAt')}: ${formatDate(new Date(), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 40, 102);
  autoTable(doc, {
    startY: 118, head: [header], body: body.length ? body : [[t('export.pdf.empty'), ...header.slice(1).map(() => '')]],
    styles: { fontSize: 9 }, headStyles: { fillColor: [33, 150, 243] },
  });
  return doc.output('blob');
}
