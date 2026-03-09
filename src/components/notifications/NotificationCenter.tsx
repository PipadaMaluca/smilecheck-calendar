import { useState, useMemo, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Calendar, MessageCircle, Star, Award, FileText, Stethoscope, AlertTriangle, ArrowLeft, Clock, UserPlus, BarChart3, Users, XCircle, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';
import { mockScoreHistory } from '@/types/scoring';

export type NotificationType =
'lembrete_24h' | 'lembrete_1h' | 'feedback' | 'receita' | 'referencia' |
'consulta_alterada' | 'consulta_cancelada' | 'pontos' | 'mensagem' | 'referral_usado' |
'novo_agendamento' | 'paciente_confirmou' | 'paciente_cancelou' | 'sala_espera' |
'feedback_recebido' | 'conquista' | 'resumo_diario' | 'novo_dentista' | 'referenciou_paciente';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  linkedScoreId?: string;
  action?: string;
}

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

// Role-specific notifications
const PATIENT_NOTIFICATIONS: Notification[] = [
{ id: 'p1', type: 'lembrete_24h', title: 'Consulta amanhã', description: 'Consulta amanhã às 09:00 com Dr. Gonçalo Pipo', time: 'há 5 min', read: false, actionLabel: 'Confirmar', action: 'agenda' },
{ id: 'p2', type: 'lembrete_1h', title: 'Consulta em 1 hora', description: 'Consulta às 14:30 com Dra. Sofia Almeida', time: 'há 30 min', read: false, action: 'agenda' },
...mockScoreHistory.
filter((s) => s.feedbackStatus === 'pending').
map((s, i) => ({
  id: `fb-${s.id}`,
  type: 'feedback' as NotificationType,
  title: 'Feedback pendente',
  description: `Dê o seu feedback sobre a consulta com ${s.dentistName}`,
  time: i === 0 ? 'há 1h' : `há ${i + 1} dias`,
  read: false,
  actionLabel: 'Dar Feedback',
  linkedScoreId: s.id,
  action: 'feedback'
})),
{ id: 'p3', type: 'mensagem', title: 'Nova mensagem', description: 'Dr. Alexandre Melo enviou uma mensagem', time: 'há 15 min', read: false, action: 'conversas' },
{ id: 'p4', type: 'pontos', title: 'Pontos ganhos!', description: '+15 pontos pela consulta de hoje', time: 'há 1h', read: false },
{ id: 'p5', type: 'consulta_alterada', title: 'Consulta alterada', description: 'A consulta de 5 Fev foi movida para as 14:00', time: 'há 2h', read: true, action: 'agenda' },
{ id: 'p6', type: 'conquista', title: 'Conquista desbloqueada!', description: '"Paciente Exemplar" - 10 consultas seguidas sem faltas', time: 'há 3h', read: true },
{ id: 'p7', type: 'receita', title: 'Nova receita disponível', description: 'Dr. Gonçalo Pipo prescreveu uma receita', time: 'há 5h', read: true, action: 'saude_receitas' },
{ id: 'p8', type: 'referencia', title: 'Nova carta de referência', description: 'Dr. Gonçalo emitiu uma carta de referência', time: 'ontem', read: true, action: 'saude_referencias' },
{ id: 'p9', type: 'consulta_cancelada', title: 'Consulta cancelada', description: 'A consulta de 10 Fev com Dr. Gil Santos foi cancelada', time: 'ontem', read: true },
{ id: 'p10', type: 'referral_usado', title: 'Referral usado!', description: 'João Costa usou o seu código e subscreveu um plano! +50 pontos', time: '2 dias', read: true },
{ id: 'p11', type: 'mensagem', title: 'Nova mensagem', description: 'Clínica SmileCheck enviou uma mensagem', time: '2 dias', read: true, action: 'conversas' }];


const DENTIST_NOTIFICATIONS: Notification[] = [
{ id: 'd1', type: 'novo_agendamento', title: 'Novo agendamento', description: 'Pedro Almeida agendou consulta para 10 Fev às 09:00', time: 'há 10 min', read: false, action: 'agenda' },
{ id: 'd2', type: 'paciente_confirmou', title: 'Paciente confirmou', description: 'Maria Silva confirmou consulta de amanhã às 09:30', time: 'há 20 min', read: false, action: 'agenda' },
{ id: 'd3', type: 'paciente_cancelou', title: 'Paciente cancelou', description: 'João Costa cancelou consulta de 12 Fev às 10:00', time: 'há 1h', read: false, action: 'agenda' },
{ id: 'd4', type: 'sala_espera', title: 'Paciente em sala de espera', description: 'Ana Ferreira chegou e está na sala de espera', time: 'há 5 min', read: false, action: 'agenda' },
{ id: 'd5', type: 'feedback_recebido', title: 'Feedback recebido', description: 'Carlos Santos deu 5 estrelas à sua consulta', time: 'há 2h', read: false },
{ id: 'd6', type: 'mensagem', title: 'Nova mensagem', description: 'Beatriz Lopes enviou uma mensagem', time: 'há 3h', read: true, action: 'conversas' },
{ id: 'd7', type: 'pontos', title: 'Pontos ganhos!', description: '+25 pontos esta semana por consultas realizadas', time: 'há 5h', read: true },
{ id: 'd8', type: 'referral_usado', title: 'Referral usado!', description: 'Dr. Ana Costa usou o seu código e subscreveu Pro! +100 pontos', time: 'ontem', read: true },
{ id: 'd9', type: 'referenciou_paciente', title: 'Paciente referenciado', description: 'O paciente que referenciou a Dr. Ana Costa concluiu consulta. +10 pontos', time: '2 dias', read: true }];


const CLINIC_NOTIFICATIONS: Notification[] = [
{ id: 'c1', type: 'novo_agendamento', title: 'Novo agendamento', description: 'Pedro Almeida agendou com Dr. Gonçalo Pipo para 10 Fev', time: 'há 10 min', read: false, action: 'agenda' },
{ id: 'c2', type: 'paciente_confirmou', title: 'Paciente confirmou', description: 'Maria Silva confirmou consulta com Dr. Gonçalo Pipo', time: 'há 30 min', read: false },
{ id: 'c3', type: 'paciente_cancelou', title: 'Paciente cancelou', description: 'João Costa cancelou consulta com Dr. Alexandre Bernardo', time: 'há 1h', read: false },
{ id: 'c4', type: 'resumo_diario', title: 'Resumo diário', description: '15 consultas hoje, 93% confirmação, 2 faltas', time: 'há 2h', read: false, actionLabel: 'Ver estatísticas', action: 'estatisticas' },
{ id: 'c5', type: 'novo_dentista', title: 'Novo dentista registou-se', description: 'Dra. Mariana Costa registou-se na plataforma', time: 'há 4h', read: true },
{ id: 'c6', type: 'mensagem', title: 'Nova mensagem', description: 'Pedro Almeida enviou uma mensagem', time: 'há 5h', read: true, action: 'conversas' },
{ id: 'c7', type: 'referral_usado', title: 'Referral usado!', description: 'Clínica DentalPro usou o seu código e subscreveu Pro!', time: 'ontem', read: true }];


const getNotificationsForRole = (role: UserRole): Notification[] => {
  switch (role) {
    case 'patient':return PATIENT_NOTIFICATIONS;
    case 'dentist':return DENTIST_NOTIFICATIONS;
    case 'clinic':return CLINIC_NOTIFICATIONS;
    default:return PATIENT_NOTIFICATIONS;
  }
};

type FilterType = 'todas' | 'nao_lidas' | 'consultas' | 'mensagens' | 'pontos';

const FILTERS: {id: FilterType;label: string;}[] = [
{ id: 'todas', label: 'Todas' },
{ id: 'nao_lidas', label: 'Não lidas' },
{ id: 'consultas', label: 'Consultas' },
{ id: 'mensagens', label: 'Mensagens' },
{ id: 'pontos', label: 'Pontos' }];


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

// ─── Bell ───
interface NotificationBellProps {
  onClick: () => void;
  className?: string;
  userRole?: UserRole;
}

export function NotificationBell({ onClick, className, userRole = 'patient' }: NotificationBellProps) {
  const unreadCount = getNotificationsForRole(userRole).filter((n) => !n.read).length;
  return (
    <button
      data-notification-bell
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn("relative p-2 rounded-lg hover:bg-accent/50 transition-colors pb-[10px] pt-[13px] pl-[5px] pr-[7px] border border-secondary", className)}>

      <Bell className="w-5 h-5 text-muted-foreground ml-0 mr-[10px]" />
      {unreadCount > 0 &&
      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 mb-0 mt-[5px] ml-0 mr-[5px]">
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
  const [notifications, setNotifications] = useState(() => getNotificationsForRole(userRole));
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const recent = notifications.slice(0, 12);
  const filteredRecent = useMemo(() => filterNotifications(recent, activeFilter), [recent, activeFilter]);
  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (e: React.MouseEvent, notification: Notification) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead(notification.id);

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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Keep dropdown open
  };

  const handleViewAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewAll();
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="fixed right-2 sm:right-4 top-14 w-[calc(100vw-16px)] sm:w-[400px] max-w-[400px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in"
      style={{ zIndex: 9999 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">Notificações</h3>
        <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={handleMarkAllRead}>
          <CheckCheck className="w-3.5 h-3.5 mr-1" />
          Marcar todas como lidas
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/50 overflow-x-auto">
        {FILTERS.map((f) =>
        <button
          key={f.id}
          onClick={(e) => {e.stopPropagation();setActiveFilter(f.id);}}
          className={cn(
            'px-2.5 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors',
            activeFilter === f.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
          )}>

            {f.label}
            {f.id === 'nao_lidas' && unreadCount > 0 && <span className="ml-0.5">({unreadCount})</span>}
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-[420px] overflow-y-auto">
        {filteredRecent.length === 0 ?
        <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Sem notificações</p>
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
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{notification.time}</p>
                  {notification.actionLabel && !notification.read &&
                <Badge className="mt-1.5 text-[10px] h-5">{notification.actionLabel}</Badge>
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

          Ver todas as notificações
        </div>
      </div>
    </div>);

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
          <h2 className="text-lg font-bold">Notificações</h2>
        </div>
      }

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map((f) =>
        <button
          key={f.id}
          onClick={() => setActiveFilter(f.id)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors',
            activeFilter === f.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
          )}>

            {f.label}
            {f.id === 'nao_lidas' && unreadCount > 0 && <span className="ml-1">({unreadCount})</span>}
          </button>
        )}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="text-xs text-primary flex-shrink-0" onClick={markAllRead}>
          <CheckCheck className="w-3.5 h-3.5 mr-1" />
          Marcar todas
        </Button>
      </div>

      <div className="space-y-1">
        {filteredNotifications.length === 0 ?
        <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sem notificações</p>
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
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{notification.time}</p>
                  {notification.actionLabel && !notification.read &&
                <Badge className="mt-1.5 text-[10px] h-5 cursor-pointer">{notification.actionLabel}</Badge>
                }
                </div>
              </div>);

        })
        }
      </div>
    </div>);

}