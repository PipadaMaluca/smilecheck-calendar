import { useState, useRef, useEffect } from 'react';
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

const STATUS_OPTIONS: { status: ConsultationStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'em_sala_espera', label: 'Em sala de espera', icon: Clock, color: 'text-blue-400' },
  { status: 'em_consulta', label: 'Em consulta', icon: Stethoscope, color: 'text-amber-400' },
  { status: 'visto', label: 'Visto', icon: CheckCircle2, color: 'text-emerald-400' },
  { status: 'falta_justificada', label: 'Falta justificada', icon: AlertTriangle, color: 'text-orange-400' },
  { status: 'falta_nao_justificada', label: 'Falta não justificada', icon: XCircle, color: 'text-destructive' },
];

const ACTION_OPTIONS = [
  { id: 'copy', label: 'Copiar consulta', icon: Copy },
  { id: 'profile', label: 'Ver perfil do paciente', icon: User },
  { id: 'message', label: 'Enviar mensagem', icon: MessageCircle },
] as const;

export function ConsultationContextMenu({
  consultation,
  position,
  onClose,
  onStatusChange,
  onCopy,
  onViewProfile,
  onSendMessage,
}: ConsultationContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!position) return null;

  // Adjust position to keep menu in viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    zIndex: 100,
  };

  const handleAction = (id: string) => {
    if (id === 'copy') onCopy(consultation);
    else if (id === 'profile') onViewProfile(consultation);
    else if (id === 'message') onSendMessage(consultation);
    onClose();
  };

  return (
    <div ref={menuRef} style={style} className="bg-card border border-border rounded-lg shadow-xl min-w-[220px] py-1 animate-fade-in">
      {/* Status options */}
      {STATUS_OPTIONS.map(({ status, label, icon: Icon, color }) => (
        <button
          key={status}
          onClick={() => { onStatusChange(consultation, status); onClose(); }}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/50 transition-colors text-left',
            consultation.status === status && 'bg-accent/30'
          )}
        >
          <Icon className={cn('w-4 h-4', color)} />
          <span>{label}</span>
          {consultation.status === status && (
            <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto" />
          )}
        </button>
      ))}

      {/* Separator */}
      <div className="border-t border-border my-1" />

      {/* Action options */}
      {ACTION_OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => handleAction(id)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/50 transition-colors text-left"
        >
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
