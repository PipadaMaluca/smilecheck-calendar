import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock, Stethoscope, CheckCircle2, AlertTriangle, XCircle,
  Copy, User, MessageCircle
} from 'lucide-react';
import { Consultation, ConsultationStatus } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface ConsultationContextMenuProps {
  consultation: Consultation;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onStatusChange: (consultation: Consultation, status: ConsultationStatus) => void;
  onCopy: (consultation: Consultation) => void;
  onViewProfile: (consultation: Consultation) => void;
  onSendMessage: (consultation: Consultation) => void;
}

export function ConsultationContextMenu({ consultation, position, onClose, onStatusChange, onCopy, onViewProfile, onSendMessage }: ConsultationContextMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  const STATUS_OPTIONS: { status: ConsultationStatus; label: string; icon: React.ElementType; color: string }[] = [
    { status: 'em_sala_espera', label: t('contextMenu.inWaitingRoom'), icon: Clock, color: 'text-blue-400' },
    { status: 'em_consulta', label: t('contextMenu.inConsultation'), icon: Stethoscope, color: 'text-warning' },
    { status: 'visto', label: t('contextMenu.seen'), icon: CheckCircle2, color: 'text-success' },
    { status: 'falta_justificada', label: t('contextMenu.justifiedAbsence'), icon: AlertTriangle, color: 'text-orange-400' },
    { status: 'falta_nao_justificada', label: t('contextMenu.unjustifiedAbsence'), icon: XCircle, color: 'text-destructive' },
  ];

  const ACTION_OPTIONS = [
    { id: 'copy', label: t('contextMenu.copyConsultation'), icon: Copy },
    { id: 'profile', label: t('contextMenu.viewProfile'), icon: User },
    { id: 'message', label: t('contextMenu.sendMessage'), icon: MessageCircle },
  ] as const;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('mousedown', handleClickOutside); document.removeEventListener('keydown', handleEscape); };
  }, [onClose]);

  if (!position) return null;

  const style: React.CSSProperties = { position: 'fixed', left: position.x, top: position.y, zIndex: 100 };

  const handleAction = (id: string) => {
    if (id === 'copy') onCopy(consultation);
    else if (id === 'profile') onViewProfile(consultation);
    else if (id === 'message') onSendMessage(consultation);
    onClose();
  };

  return (
    <div ref={menuRef} style={style} className="bg-card border border-border rounded-lg shadow-xl min-w-[220px] py-1 animate-fade-in">
      {STATUS_OPTIONS.map(({ status, label, icon: Icon, color }) => (
        <button key={status} onClick={() => { onStatusChange(consultation, status); onClose(); }}
          className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/50 transition-colors text-left press', consultation.status === status && 'bg-accent/30')}>
          <Icon className={cn('w-4 h-4', color)} /><span>{label}</span>
          {consultation.status === status && <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto" />}
        </button>
      ))}
      <div className="border-t border-border my-1" />
      {ACTION_OPTIONS.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => handleAction(id)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/50 transition-colors text-left press">
          <Icon className="w-4 h-4 text-muted-foreground" /><span>{label}</span>
        </button>
      ))}
    </div>
  );
}
