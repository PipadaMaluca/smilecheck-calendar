import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';
import type { Notification, NotificationType } from '@/components/notifications/notificationTypes';

/**
 * Final backend phase — notifications.
 *
 * - READ: `notifications` scoped by RLS to `profile_id = auth.uid()`.
 * - WRITE (read state): the owner may UPDATE its own rows only.
 * - GENERATION: points / level-up / streak / achievement / feedback-received rows
 *   are inserted by SECURITY DEFINER backend functions (`create_notification`),
 *   never by the client. Appointment events are written by the acting
 *   professional / patient through `notifyProfile`, which RLS restricts to
 *   `can_notify_profile()`.
 * - Demo mode never reaches this module: call sites branch on `demoMode`.
 */

interface Row {
  id: string;
  type: string | null;
  title: string;
  message: string | null;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

/** DB `type` -> UI notification type (drives the icon and the filter tabs). */
const TYPE_MAP: Record<string, NotificationType> = {
  appointment: 'novo_agendamento',
  appointment_created: 'novo_agendamento',
  appointment_confirmed: 'paciente_confirmou',
  appointment_cancelled: 'consulta_cancelada',
  appointment_changed: 'consulta_alterada',
  appointment_reminder_24h: 'lembrete_24h',
  appointment_reminder_1h: 'lembrete_1h',
  waiting_list: 'novo_agendamento',
  waiting_room: 'sala_espera',
  points: 'pontos',
  level_up: 'pontos',
  streak: 'pontos',
  achievement: 'conquista',
  feedback_pending: 'feedback',
  feedback_received: 'feedback_recebido',
  message: 'mensagem',
};

export function mapNotificationType(dbType: string | null): NotificationType {
  return (dbType && TYPE_MAP[dbType]) || 'pontos';
}

/** `/app?tab=pontuacoes` -> `pontuacoes` so the existing navigation keeps working. */
export function actionFromUrl(actionUrl: string | null): string | undefined {
  if (!actionUrl) return undefined;
  const tab = /[?&]tab=([^&]+)/.exec(actionUrl);
  if (tab) return decodeURIComponent(tab[1]);
  if (actionUrl.startsWith('/app')) return 'agenda';
  return undefined;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat(i18n.language || 'pt', { numeric: 'auto' });
  if (minutes < 1) return rtf.format(0, 'minute');
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  if (days < 30) return rtf.format(-days, 'day');
  return rtf.format(-Math.round(days / 30), 'month');
}

function toNotification(row: Row): Notification {
  return {
    id: row.id,
    type: mapNotificationType(row.type),
    title: row.title,
    description: row.message ?? '',
    time: relativeTime(row.created_at),
    read: row.read,
    action: actionFromUrl(row.action_url),
  };
}

export async function fetchNotifications(limit = 100): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, read, action_url, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<Row[]>();
  if (error) throw error;
  return (data ?? []).map(toNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(profileId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('profile_id', profileId)
    .eq('read', false);
  if (error) throw error;
}

/**
 * Client-side notification writer for events the acting user performs on
 * someone else's behalf (appointment created / confirmed / cancelled,
 * feedback requests). RLS (`can_notify_profile`) rejects anything else.
 * Never blocks the primary action.
 */
export async function notifyProfile(input: {
  profileId: string | null | undefined;
  type: string;
  title: string;
  message?: string;
  actionUrl?: string;
}): Promise<void> {
  if (!input.profileId) return;
  const { error } = await supabase.from('notifications').insert({
    profile_id: input.profileId,
    type: input.type,
    title: input.title,
    message: input.message ?? null,
    action_url: input.actionUrl ?? '/app?tab=agenda',
    read: false,
  });
  if (error) console.warn('[notifications] insert failed', error.message);
}

/** Fire-and-forget variant for UI side effects. */
export function notifyProfileSilently(input: Parameters<typeof notifyProfile>[0]) {
  void notifyProfile(input).catch(() => undefined);
}

export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  /** false in demo mode / without a session: callers keep the mock list. */
  enabled: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refresh: () => void;
}

export function useNotifications(): UseNotificationsResult {
  const { demoMode, user } = useAuth();
  const enabled = !demoMode && !!user;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(enabled);

  const load = useCallback(() => {
    if (!enabled) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchNotifications()
      .then(setNotifications)
      .catch((e) => {
        console.warn('[notifications] read failed', e?.message ?? e);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(load, [load]);

  // Live updates so events triggered elsewhere in the app show up immediately.
  useEffect(() => {
    if (!enabled || !user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `profile_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, user, load]);

  const markRead = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      void markNotificationRead(id).catch((e) => console.warn('[notifications]', e?.message ?? e));
    },
    []
  );

  const markAllRead = useCallback(() => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    void markAllNotificationsRead(user.id).catch((e) =>
      console.warn('[notifications]', e?.message ?? e)
    );
  }, [user]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return { notifications, unreadCount, loading, enabled, markRead, markAllRead, refresh: load };
}
