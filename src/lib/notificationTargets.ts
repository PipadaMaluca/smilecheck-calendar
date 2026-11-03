/**
 * Single source of truth: notification type -> in-app destination.
 *
 * A destination is stored as an app URL (`/app?tab=<tab>&<param>=<value>`), the
 * same format persisted in `notifications.action_url`. Mock and real
 * notifications both resolve through here, so a click can never be a no-op:
 * a missing / generic / unknown URL falls back to the destination of the type.
 */
import type { NotificationType } from '@/components/notifications/notificationTypes';
import { setPendingDeepLink, type DeepLink } from '@/lib/deepLink';

export const APPOINTMENT_TYPES: NotificationType[] = [
  'lembrete_24h', 'lembrete_1h', 'consulta_alterada', 'consulta_cancelada',
  'novo_agendamento', 'paciente_confirmou', 'paciente_cancelou', 'sala_espera',
];

/** Default destination for each notification type (no ids). */
export const TYPE_TARGETS: Record<NotificationType, string> = {
  lembrete_24h: '/app?tab=agenda',
  lembrete_1h: '/app?tab=agenda',
  consulta_alterada: '/app?tab=agenda',
  consulta_cancelada: '/app?tab=agenda',
  novo_agendamento: '/app?tab=agenda',
  paciente_confirmou: '/app?tab=agenda',
  paciente_cancelou: '/app?tab=agenda',
  sala_espera: '/app?tab=agenda',
  feedback: '/app?tab=pontuacoes',
  mensagem: '/app?tab=conversas',
  pontos: '/app?tab=pontuacoes',
  conquista: '/app?tab=conquistas',
  receita: '/app?tab=saude&section=receitas',
  referencia: '/app?tab=saude&section=referencias',
  referral_usado: '/app?tab=convidar&section=convites',
  feedback_recebido: '/app?tab=pontuacoes&section=avaliacoes',
  referenciou_paciente: '/app?tab=conversas',
  resumo_diario: '/app?tab=estatisticas',
  novo_dentista: '/app?tab=equipa',
};

/** Tabs the app shells know how to open. Anything else is "unknown". */
export const KNOWN_TABS = new Set([
  'home', 'agenda', 'conversas', 'pontuacoes', 'classificacoes', 'conquistas', 'saude',
  'convidar', 'estatisticas', 'equipa', 'loja', 'plano', 'faturacao', 'configuracoes',
  'pesquisa', 'notificacoes', 'dossier',
]);

/** Build a specific destination URL (used when creating notifications). */
export function buildTargetUrl(tab: string, params: Record<string, string | null | undefined> = {}): string {
  const q = new URLSearchParams({ tab });
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  return `/app?${q.toString()}`;
}

export function appointmentTargetUrl(appointmentId: string | null | undefined, date?: string | null): string {
  return buildTargetUrl('agenda', { appointment: appointmentId ?? undefined, date: date ?? undefined });
}

export function parseTarget(url: string | null | undefined): DeepLink | null {
  if (!url) return null;
  const qIndex = url.indexOf('?');
  if (qIndex < 0) return null;
  const q = new URLSearchParams(url.slice(qIndex + 1));
  const tab = q.get('tab');
  if (!tab || !KNOWN_TABS.has(tab)) return null;
  return {
    tab,
    section: q.get('section') ?? undefined,
    appointmentId: q.get('appointment') ?? undefined,
    date: q.get('date') ?? undefined,
    conversationId: q.get('conversation') ?? undefined,
    achievementKey: q.get('achievement') ?? undefined,
    patientId: q.get('patient') ?? undefined,
  };
}

/**
 * Resolve the final destination URL: a specific, known URL wins; a generic
 * "/app" or unknown URL falls back to the type default.
 */
export function resolveTargetUrl(type: NotificationType, url: string | null | undefined): string {
  const parsed = parseTarget(url);
  if (parsed && !(parsed.tab === 'agenda' && !parsed.appointmentId && !parsed.date && !APPOINTMENT_TYPES.includes(type))) {
    return url as string;
  }
  return TYPE_TARGETS[type] ?? '/app?tab=home';
}

/**
 * Turn a destination URL into the shell navigation string and park the
 * sub-target (section, conversation, achievement, date) for the screen that
 * opens next. Returns what to pass to the shell's `onNavigate`.
 */
export function prepareNavigation(url: string, role?: string): string {
  const link = parseTarget(url) ?? { tab: 'home' };
  if (link.tab === 'dossier' && link.patientId) {
    setPendingDeepLink(link);
    return `dossier:${link.patientId}`;
  }
  if (link.tab === 'equipa' && role === 'patient') return 'home';
  setPendingDeepLink(link);
  if (link.tab === 'agenda') {
    if (link.appointmentId) return `consulta-detalhe:${link.appointmentId}`;
    if (!link.date) return 'consulta-detalhe';
  }
  return link.tab;
}
