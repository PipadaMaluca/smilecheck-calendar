import { useState, useMemo, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Calendar, MessageCircle, Star, Award, FileText, Stethoscope, AlertTriangle, ArrowLeft, Clock, UserPlus, BarChart3, Users, XCircle, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';
import { mockScoreHistory } from '@/types/scoring';
import { useTranslation } from 'react-i18next';

import { useNotifications } from '@/data/notificationsSource';
import type { Notification, NotificationType } from '@/components/notifications/notificationTypes';

export type { Notification, NotificationType };


const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  lembrete_24h: Calendar,
  lembrete_1h: Clock,
  feedback: Stethoscope,
  receita: FileText,
  referencia: FileText,
  consulta_alterada: AlertTriangle,
  consulta_cancelada: XCircle,
  pontos: Star,
  mensagem: MessageCircle,
  referral_usado: Gift,
  novo_agendamento: Calendar,
  paciente_confirmou: Check,
  paciente_cancelou: XCircle,
  sala_espera: Users,
  feedback_recebido: Star,
  conquista: Award,
  resumo_diario: BarChart3,
  novo_dentista: UserPlus,
  referenciou_paciente: Star
};

// Role-specific notifications — built lazily via t() so they react to language switches.
import i18n from '@/i18n';

const tn = (k: string, opts?: Record<string, unknown>) => i18n.t(`notifMock.${k}`, opts);

const buildPatientNotifications = (): Notification[] => [
  { id: 'p1', type: 'lembrete_24h', title: tn('p1Title'), description: tn('p1Desc'), time: tn('time5min'), read: false, actionLabel: i18n.t('swipeActions.confirm'), action: 'agenda' },
  { id: 'p2', type: 'lembrete_1h', title: tn('p2Title'), description: tn('p2Desc'), time: tn('time30min'), read: false, action: 'agenda' },
  ...mockScoreHistory
    .filter((s) => s.feedbackStatus === 'pending')
    .map((s, i) => ({
      id: `fb-${s.id}`,
      type: 'feedback' as NotificationType,
      title: tn('fbTitle'),
      description: tn('fbDescTpl', { name: s.dentistName }) as string,
      time: i === 0 ? tn('time1h') as string : i18n.t('common.daysAgo', { n: i + 1 }) as string,
      read: false,
      actionLabel: tn('fbAction') as string,
      linkedScoreId: s.id,
      action: 'feedback',
    })),
  { id: 'p3', type: 'mensagem', title: tn('p3Title'), description: tn('p3Desc'), time: tn('time15min'), read: false, action: 'conversas' },
  { id: 'p4', type: 'pontos', title: tn('p4Title'), description: tn('p4Desc'), time: tn('time1h'), read: false },
  { id: 'p5', type: 'consulta_alterada', title: tn('p5Title'), description: tn('p5Desc'), time: tn('time2h'), read: true, action: 'agenda' },
  { id: 'p6', type: 'conquista', title: tn('p6Title'), description: tn('p6Desc'), time: tn('time3h'), read: true },
  { id: 'p7', type: 'receita', title: tn('p7Title'), description: tn('p7Desc'), time: tn('time5h'), read: true, action: 'saude_receitas' },
  { id: 'p8', type: 'referencia', title: tn('p8Title'), description: tn('p8Desc'), time: tn('yesterday'), read: true, action: 'saude_referencias' },
  { id: 'p9', type: 'consulta_cancelada', title: tn('p9Title'), description: tn('p9Desc'), time: tn('yesterday'), read: true },
  { id: 'p10', type: 'referral_usado', title: tn('p10Title'), description: tn('p10Desc'), time: tn('days2'), read: true },
  { id: 'p11', type: 'mensagem', title: tn('p11Title'), description: tn('p11Desc'), time: tn('days2'), read: true, action: 'conversas' },
];

const buildDentistNotifications = (): Notification[] => [
  { id: 'd1', type: 'novo_agendamento', title: tn('d1Title'), description: tn('d1Desc'), time: tn('time10min'), read: false, action: 'agenda' },
  { id: 'd2', type: 'paciente_confirmou', title: tn('d2Title'), description: tn('d2Desc'), time: tn('time20min'), read: false, action: 'agenda' },
  { id: 'd3', type: 'paciente_cancelou', title: tn('d3Title'), description: tn('d3Desc'), time: tn('time1h'), read: false, action: 'agenda' },
  { id: 'd4', type: 'sala_espera', title: tn('d4Title'), description: tn('d4Desc'), time: tn('time5min'), read: false, action: 'agenda' },
  { id: 'd5', type: 'feedback_recebido', title: tn('d5Title'), description: tn('d5Desc'), time: tn('time2h'), read: false },
  { id: 'd6', type: 'mensagem', title: tn('d6Title'), description: tn('d6Desc'), time: tn('time3h'), read: true, action: 'conversas' },
  { id: 'd7', type: 'pontos', title: tn('d7Title'), description: tn('d7Desc'), time: tn('time5h'), read: true },
  { id: 'd8', type: 'referral_usado', title: tn('d8Title'), description: tn('d8Desc'), time: tn('yesterday'), read: true },
  { id: 'd9', type: 'referenciou_paciente', title: tn('d9Title'), description: tn('d9Desc'), time: tn('days2'), read: true },
];

const buildClinicNotifications = (): Notification[] => [
  { id: 'c1', type: 'novo_agendamento', title: tn('c1Title'), description: tn('c1Desc'), time: tn('time10min'), read: false, action: 'agenda' },
  { id: 'c2', type: 'paciente_confirmou', title: tn('c2Title'), description: tn('c2Desc'), time: tn('time30min'), read: false },
  { id: 'c3', type: 'paciente_cancelou', title: tn('c3Title'), description: tn('c3Desc'), time: tn('time1h'), read: false },
  { id: 'c4', type: 'resumo_diario', title: tn('c4Title'), description: tn('c4Desc'), time: tn('time2h'), read: false, actionLabel: tn('c4Action') as string, action: 'estatisticas' },
  { id: 'c5', type: 'novo_dentista', title: tn('c5Title'), description: tn('c5Desc'), time: tn('time4h'), read: true },
  { id: 'c6', type: 'mensagem', title: tn('c6Title'), description: tn('c6Desc'), time: tn('time5h'), read: true, action: 'conversas' },
  { id: 'c7', type: 'referral_usado', title: tn('c7Title'), description: tn('c7Desc'), time: tn('yesterday'), read: true },
];

const getNotificationsForRole = (role: UserRole): Notification[] => {
  switch (role) {
    case 'patient': return buildPatientNotifications();
    case 'dentist': return buildDentistNotifications();
    case 'clinic': return buildClinicNotifications();
    default: return buildPatientNotifications();
  }
};

type FilterType = 'todas' | 'nao_lidas' | 'consultas' | 'mensagens' | 'pontos';

type FilterLabel = { id: FilterType; label: string };

function useFilterLabels() {
  const { t } = useTranslation();
  return [
    { id: 'todas' as FilterType, label: t('notifications.all') },
    { id: 'nao_lidas' as FilterType, label: t('notifications.unread') },
    { id: 'consultas' as FilterType, label: t('notifications.appointments') },
    { id: 'mensagens' as FilterType, label: t('notifications.messages') },
    { id: 'pontos' as FilterType, label: t('notifications.points') },
  ] as FilterLabel[];
}

interface NotificationFilterTabsProps {
  filters: FilterLabel[];
  activeFilter: FilterType;
  unreadCount: number;
  onChange: (filter: FilterType) => void;
  className?: string;
}

function NotificationFilterTabs({ filters, activeFilter, unreadCount, onChange, className }: NotificationFilterTabsProps) {
  return (
    <div className={cn('notification-tabs-container', className)}>
      {filters.map((f) =>
        <button
          key={f.id}
          onClick={(e) => {e.stopPropagation();onChange(f.id);}}
          className={cn(
            'notification-tab relative font-medium transition-colors',
            activeFilter === f.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
          )}>

          <span>{f.label}</span>
          {f.id === 'nao_lidas' && unreadCount > 0 &&
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" aria-label={`${unreadCount} notificações não lidas`} />
          }
        </button>
      )}
    </div>
  );
}


const CONSULTATION_TYPES: NotificationType[] = ['lembrete_24h', 'lembrete_1h', 'consulta_alterada', 'consulta_cancelada', 'feedback', 'novo_agendamento', 'paciente_confirmou', 'paciente_cancelou', 'sala_espera', 'feedback_recebido'];
const POINTS_TYPES: NotificationType[] = ['pontos', 'conquista', 'referral_usado', 'referenciou_paciente'];

function filterNotifications(notifications: Notification[], filter: FilterType) {
  switch (filter) {
    case 'nao_lidas':return notifications.filter((n) => !n.read);
    case 'consultas':return notifications.filter((n) => CONSULTATION_TYPES.includes(n.type));
    case 'mensagens':return notifications.filter((n) => n.type === 'mensagem');
    case 'pontos':return notifications.filter((n) => POINTS_TYPES.includes(n.type));
    default:return notifications;
  }
}

/**
 * Single source of truth for the notification UI.
 *
 * Real users read/write the `notifications` table; demo mode (and unauthenticated
 * viewers) keep the local mock list with zero DB writes.
 */
function useNotificationList(userRole: UserRole) {
  const { i18n: i18nInstance } = useTranslation();
  const db = useNotifications();
  const [mock, setMock] = useState(() => getNotificationsForRole(userRole));

  useEffect(() => {
    if (!db.enabled) setMock(getNotificationsForRole(userRole));
  }, [db.enabled, i18nInstance.language, userRole]);

  const markMockRead = useCallback((id: string) => {
    setMock((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markMockAllRead = useCallback(() => {
    setMock((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  if (db.enabled) {
    return {
      notifications: db.notifications,
      unreadCount: db.unreadCount,
      loading: db.loading,
      markRead: db.markRead,
      markAllRead: db.markAllRead,
    };
  }
  return {
    notifications: mock,
    unreadCount: mock.filter((n) => !n.read).length,
    loading: false,
    markRead: markMockRead,
    markAllRead: markMockAllRead,
  };
}

function NotificationSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="py-2">
      {Array.from({ length: rows }).map((_, i) =>
        <div key={i} className="flex items-start gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-secondary animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-1/2 rounded bg-secondary animate-pulse" />
            <div className="h-2.5 w-3/4 rounded bg-secondary/70 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bell ───
interface NotificationBellProps {
  onClick: () => void;
  className?: string;
  userRole?: UserRole;
}

export function NotificationBell({ onClick, className, userRole = 'patient' }: NotificationBellProps) {
  const { unreadCount } = useNotificationList(userRole);
  return (
    <button
      data-notification-bell
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn("relative p-2 rounded-lg hover:bg-accent/50 transition-colors pb-[10px] pt-[13px] pl-[5px] pr-[7px] border border-secondary", className)}>

      <Bell className="w-5 h-5 text-muted-foreground ml-0 mr-[10px]" />
      {unreadCount > 0 &&
      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center px-1 mb-0 mt-[5px] ml-0 mr-[5px]">
          {unreadCount}
        </span>
      }
    </button>);

}


// ─── Dropdown (Desktop) ───
interface NotificationDropdownProps {
  onViewAll: () => void;
  onClose: () => void;
  onFeedbackAction?: (scoreId: string) => void;
  onNavigate?: (target: string) => void;
  userRole?: UserRole;
}

export function NotificationDropdown({ onViewAll, onClose, onFeedbackAction, onNavigate, userRole = 'patient' }: NotificationDropdownProps) {
  const { t } = useTranslation();
  const FILTERS = useFilterLabels();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotificationList(userRole);
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const recent = notifications.slice(0, 12);
  const filteredRecent = useMemo(() => filterNotifications(recent, activeFilter), [recent, activeFilter]);


  // Close on click outside (but not on the bell button itself - that's handled by toggle)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking on the bell button (it handles its own toggle)
      if (target.closest('[data-notification-bell]')) return;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {clearTimeout(timer);document.removeEventListener('mousedown', handler);};
  }, [onClose]);

  const handleNotificationClick = (e: React.MouseEvent, notification: Notification) => {
    e.preventDefault();
    e.stopPropagation();
    markRead(notification.id);

    if (notification.action === 'feedback' && notification.linkedScoreId && onFeedbackAction) {
      onFeedbackAction(notification.linkedScoreId);
      onClose();
      return;
    }
    if (notification.action && onNavigate) {
      onNavigate(notification.action);
      onClose();
      return;
    }
    onClose();
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllRead();
    // Keep dropdown open
  };


  const handleViewAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewAll();
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay — closes panel when clicked */}
      <div
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="fixed inset-0 bg-black/30 animate-fade-in"
        style={{ zIndex: 9998 }}
      />
    <div
      ref={dropdownRef}
      className="fixed right-2 sm:right-4 top-14 w-[calc(100vw-16px)] sm:w-[400px] max-w-[400px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in"
      style={{ zIndex: 9999 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">{t('notifications.title')}</h3>
        <Button variant="ghost" size="sm" className="text-xs text-primary h-8 px-2" onClick={handleMarkAllRead}>
          <CheckCheck className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">{t('notifications.markAllRead')}</span>
          <span className="sm:hidden">{t('notifications.markRead')}</span>
        </Button>
      </div>

      {/* Filters */}
      <NotificationFilterTabs
        filters={FILTERS}
        activeFilter={activeFilter}
        unreadCount={unreadCount}
        onChange={setActiveFilter}
        className="border-b border-border/50"
      />

      {/* Notification List */}
      <div className="max-h-[75vh] overflow-y-auto">
        {filteredRecent.length === 0 ?
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-xs">{activeFilter === 'todas' ? t('notifications.noNotifications') : t('notifications.noNotificationsInCategory')}</p>
          </div> :

        filteredRecent.map((notification) => {
          const Icon = NOTIFICATION_ICONS[notification.type];
          return (
            <div
              key={notification.id}
              role="button"
              tabIndex={0}
              onClick={(e) => handleNotificationClick(e, notification)}
              onKeyDown={(e) => {if (e.key === 'Enter') handleNotificationClick(e as any, notification);}}
              className={cn(
                'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-0',
                'hover:bg-accent/40 active:bg-accent/60',
                !notification.read && 'bg-primary/5'
              )}>

                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', !notification.read ? 'bg-primary/20' : 'bg-secondary')}>
                  <Icon className={cn('w-4 h-4', !notification.read ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm truncate', !notification.read ? 'font-bold text-foreground' : 'font-medium text-foreground')}>{notification.title}</p>
                    {!notification.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">{notification.time}</p>
                  {notification.actionLabel && !notification.read &&
                <Badge className="mt-1.5 text-[11px] h-5">{notification.actionLabel}</Badge>
                }
                </div>
              </div>);

        })
        }
      </div>

      {/* Footer */}
      <div className="border-t border-border">
        <div
          role="button"
          tabIndex={0}
          onClick={handleViewAll}
          className="w-full py-2.5 text-center text-sm text-primary font-medium hover:bg-accent/30 transition-colors cursor-pointer">

          {t('notifications.viewAll')}
        </div>
      </div>
    </div>
    </>);

}

// ─── Full View (Mobile/Tablet/Desktop tab) ───
interface NotificationsFullViewProps {
  onBack?: () => void;
  inline?: boolean;
  onFeedbackAction?: (scoreId: string) => void;
  onNavigate?: (target: string) => void;
  userRole?: UserRole;
}

export function NotificationsFullView({ onBack, inline, onFeedbackAction, onNavigate, userRole = 'patient' }: NotificationsFullViewProps) {
  const { t } = useTranslation();
  const FILTERS = useFilterLabels();
  const [notifications, setNotifications] = useState(() => getNotificationsForRole(userRole));
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');

  const filteredNotifications = useMemo(() => filterNotifications(notifications, activeFilter), [notifications, activeFilter]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (notification: Notification) => {
    if (notification.action === 'feedback' && notification.linkedScoreId && onFeedbackAction) {
      onFeedbackAction(notification.linkedScoreId);
      return;
    }
    markAsRead(notification.id);
    if (notification.action && onNavigate) {
      onNavigate(notification.action);
    }
  };

  return (
    <div className={cn('flex-1 overflow-y-auto', inline ? '' : 'px-4 py-4')}>
      {onBack && !inline &&
      <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold">{t('notifications.title')}</h2>
        </div>
      }

      <div className="mb-4">
        <NotificationFilterTabs
          filters={FILTERS}
          activeFilter={activeFilter}
          unreadCount={unreadCount}
          onChange={setActiveFilter}
        />
        <div className="mt-2 flex justify-end max-[499px]:hidden">
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={markAllRead}>
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            {t('notifications.markAllRead')}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        {filteredNotifications.length === 0 ?
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">{activeFilter === 'todas' ? t('notifications.noNotifications') : t('notifications.noNotificationsInCategory')}</p>
          </div> :

        filteredNotifications.map((notification) => {
          const Icon = NOTIFICATION_ICONS[notification.type];
          return (
            <div
              key={notification.id}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(notification)}
              className={cn(
                'flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors',
                'hover:bg-accent/40 active:bg-accent/60',
                !notification.read && 'bg-primary/5'
              )}>

                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', !notification.read ? 'bg-primary/20' : 'bg-secondary')}>
                  <Icon className={cn('w-5 h-5', !notification.read ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm', !notification.read ? 'font-bold' : 'font-medium')}>{notification.title}</p>
                    {!notification.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">{notification.time}</p>
                  {notification.actionLabel && !notification.read &&
                <Badge className="mt-1.5 text-[11px] h-5 cursor-pointer">{notification.actionLabel}</Badge>
                }
                </div>
              </div>);

        })
        }
      </div>
    </div>);

}