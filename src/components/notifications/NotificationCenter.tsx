import { useState, useMemo, useCallback } from 'react';
import { Bell, Check, CheckCheck, Calendar, MessageCircle, Star, Award, FileText, Stethoscope, AlertTriangle, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';
import { ConsultationScore, mockScoreHistory } from '@/types/scoring';

export interface Notification {
  id: string;
  type: 'confirmacao' | 'feedback' | 'mensagem' | 'consulta_alterada' | 'receita' | 'referencia' | 'pontos' | 'conquista';
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  linkedScoreId?: string; // links to a ConsultationScore for feedback actions
}

const NOTIFICATION_ICONS: Record<Notification['type'], React.ElementType> = {
  confirmacao: Calendar,
  feedback: Stethoscope,
  mensagem: MessageCircle,
  consulta_alterada: AlertTriangle,
  receita: FileText,
  referencia: FileText,
  pontos: Star,
  conquista: Award
};

// Generate feedback notifications from pending scores
const generateFeedbackNotifications = (): Notification[] => {
  return mockScoreHistory
    .filter(s => s.feedbackStatus === 'pending')
    .map((s, i) => ({
      id: `fb-${s.id}`,
      type: 'feedback' as const,
      title: 'Feedback pendente',
      description: `Dê o seu feedback sobre a consulta com ${s.dentistName}`,
      time: i === 0 ? 'há 1h' : `há ${i + 1} dias`,
      read: false,
      actionLabel: 'Dar Feedback',
      linkedScoreId: s.id,
    }));
};

const STATIC_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'confirmacao', title: 'Confirmar presença', description: 'Consulta amanhã às 09:00 com Dr. Gonçalo Pipo', time: 'há 5 min', read: false, actionLabel: 'Confirmar' },
  { id: '2', type: 'mensagem', title: 'Nova mensagem', description: 'Dr. Alexandre Melo enviou uma mensagem', time: 'há 15 min', read: false },
  { id: '3', type: 'pontos', title: 'Pontos ganhos!', description: '+15 pontos pela consulta de hoje', time: 'há 1h', read: false },
  { id: '4', type: 'consulta_alterada', title: 'Consulta alterada', description: 'A consulta de 5 Fev foi movida para as 14:00', time: 'há 2h', read: true },
  { id: '5', type: 'conquista', title: 'Conquista desbloqueada!', description: '"Paciente Exemplar" - 10 consultas seguidas sem faltas', time: 'há 3h', read: true },
  { id: '6', type: 'receita', title: 'Nova receita disponível', description: 'Dr. Gonçalo Pipo prescreveu uma receita', time: 'há 5h', read: true },
  { id: '7', type: 'confirmacao', title: 'Confirmar presença (1h)', description: 'Consulta às 14:30 com Dra. Sofia Almeida', time: 'há 6h', read: true },
  { id: '8', type: 'referencia', title: 'Nova carta de referência', description: 'Dr. Gonçalo emitiu uma carta de referência', time: 'ontem', read: true },
  { id: '9', type: 'mensagem', title: 'Nova mensagem', description: 'Clínica SmileCheck enviou uma mensagem', time: '2 dias', read: true },
];

const getInitialNotifications = (): Notification[] => {
  const feedbackNotifs = generateFeedbackNotifications();
  // Insert feedback notifications after position 2
  const result = [...STATIC_NOTIFICATIONS];
  result.splice(2, 0, ...feedbackNotifs);
  return result;
};

type FilterType = 'todas' | 'nao_lidas' | 'consultas' | 'mensagens' | 'pontos';

const FILTERS: { id: FilterType; label: string; }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'nao_lidas', label: 'Não lidas' },
  { id: 'consultas', label: 'Consultas' },
  { id: 'mensagens', label: 'Mensagens' },
  { id: 'pontos', label: 'Pontos' },
];


interface NotificationBellProps {
  onClick: () => void;
  className?: string;
}

export function NotificationBell({ onClick, className }: NotificationBellProps) {
  const unreadCount = getInitialNotifications().filter((n) => !n.read).length;

  return (
    <button
      onClick={onClick}
      className={cn("relative p-2 rounded-lg hover:bg-accent/50 transition-colors pb-[10px] pt-[13px] pl-[5px] pr-[7px]", className)}
    >
      <Bell className="w-5 h-5 text-muted-foreground ml-0 mr-[10px]" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 mb-0 mt-[5px] ml-0 mr-[5px]">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

interface NotificationDropdownProps {
  onViewAll: () => void;
  onClose: () => void;
  onFeedbackAction?: (scoreId: string) => void;
}

export function NotificationDropdown({ onViewAll, onClose, onFeedbackAction }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState(getInitialNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');
  const recent = notifications.slice(0, 10);

  const filteredRecent = useMemo(() => {
    switch (activeFilter) {
      case 'nao_lidas': return recent.filter((n) => !n.read);
      case 'consultas': return recent.filter((n) => ['confirmacao', 'consulta_alterada', 'feedback'].includes(n.type));
      case 'mensagens': return recent.filter((n) => n.type === 'mensagem');
      case 'pontos': return recent.filter((n) => ['pontos', 'conquista'].includes(n.type));
      default: return recent;
    }
  }, [recent, activeFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.linkedScoreId && onFeedbackAction) {
      onFeedbackAction(notification.linkedScoreId);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[998]" onClick={onClose} />
      <div className="fixed right-4 top-14 w-[400px] bg-card border border-border rounded-xl shadow-2xl z-[999] overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-bold">Notificações</h3>
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}>
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Marcar todas como lidas
          </Button>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/50 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors',
                activeFilter === f.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              )}
            >
              {f.label}
              {f.id === 'nao_lidas' && unreadCount > 0 && <span className="ml-0.5">({unreadCount})</span>}
            </button>
          ))}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {filteredRecent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Sem notificações</p>
            </div>
          ) : (
            filteredRecent.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type];
              return (
                <button
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/30 transition-colors border-b border-border/50 last:border-0',
                    !notification.read && 'bg-primary/5'
                  )}
                >
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', !notification.read ? 'bg-primary/20' : 'bg-secondary')}>
                    <Icon className={cn('w-4 h-4', !notification.read ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm truncate', !notification.read ? 'font-bold' : 'font-medium')}>{notification.title}</p>
                      {!notification.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{notification.time}</p>
                    {notification.actionLabel && !notification.read && (
                      <Badge className="mt-1.5 text-[10px] h-5 cursor-pointer">{notification.actionLabel}</Badge>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
        <div className="border-t border-border">
          <button onClick={() => { onViewAll(); onClose(); }} className="w-full py-2.5 text-sm text-primary font-medium hover:bg-accent/30 transition-colors">
            Ver todas as notificações
          </button>
        </div>
      </div>
    </>
  );
}

interface NotificationsFullViewProps {
  onBack?: () => void;
  inline?: boolean;
  onFeedbackAction?: (scoreId: string) => void;
}

export function NotificationsFullView({ onBack, inline, onFeedbackAction }: NotificationsFullViewProps) {
  const [notifications, setNotifications] = useState(getInitialNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'nao_lidas': return notifications.filter((n) => !n.read);
      case 'consultas': return notifications.filter((n) => ['confirmacao', 'consulta_alterada', 'feedback'].includes(n.type));
      case 'mensagens': return notifications.filter((n) => n.type === 'mensagem');
      case 'pontos': return notifications.filter((n) => ['pontos', 'conquista'].includes(n.type));
      default: return notifications;
    }
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.linkedScoreId && onFeedbackAction) {
      onFeedbackAction(notification.linkedScoreId);
    }
  };

  return (
    <div className={cn('flex-1 overflow-y-auto', inline ? '' : 'px-4 py-4')}>
      {onBack && !inline && (
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold">Notificações</h2>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors',
              activeFilter === f.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            )}
          >
            {f.label}
            {f.id === 'nao_lidas' && unreadCount > 0 && <span className="ml-1">({unreadCount})</span>}
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="text-xs text-primary flex-shrink-0" onClick={markAllRead}>
          <CheckCheck className="w-3.5 h-3.5 mr-1" />
          Marcar todas
        </Button>
      </div>

      {/* Notification List */}
      <div className="space-y-1">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sem notificações</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = NOTIFICATION_ICONS[notification.type];
            return (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left rounded-lg hover:bg-accent/30 transition-colors',
                  !notification.read && 'bg-primary/5'
                )}
              >
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
                  {notification.actionLabel && !notification.read && (
                    <Badge className="mt-1.5 text-[10px] h-5 cursor-pointer">{notification.actionLabel}</Badge>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
