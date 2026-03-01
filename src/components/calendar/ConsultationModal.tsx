import { ArrowLeft, Video, MapPin, Calendar, Clock, User, Phone, Star, Camera, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Consultation } from '@/types/calendar';
import { ConsultationExportDropdown } from '@/components/export/ConsultationExportDropdown';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ConsultationModalProps {
  consultation: Consultation;
  isOpen: boolean;
  onClose: () => void;
}

export function ConsultationModal({ consultation, isOpen, onClose }: ConsultationModalProps) {
  if (!isOpen) return null;

  const isTeleconsulta = consultation.type === 'teleconsulta';

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgente':
        return { label: 'URGENTE', className: 'badge-urgente', icon: '🔴' };
      case 'prioritario':
        return { label: 'PRIORITÁRIO', className: 'badge-prioritario', icon: '🟡' };
      default:
        return { label: 'ROTINA', className: 'badge-rotina', icon: '🟢' };
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden pb-[60px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-base font-semibold">Detalhes da Consulta</h2>
        <div className="w-10" />
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-lg mx-auto p-5 space-y-5">
          {/* Type Badge */}
          <div
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold',
              isTeleconsulta ? 'badge-teleconsulta' : 'badge-presencial'
            )}
          >
            {isTeleconsulta ? (
              <>
                <Video className="w-4 h-4" />
                🟢 TELECONSULTA
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                🔵 PRESENCIAL
              </>
            )}
          </div>

          {/* Date & Duration */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                {format(consultation.date, "EEEE, d 'de' MMMM", { locale: pt })}, {consultation.time}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Duração estimada: {consultation.duration} min</span>
            </div>
          </div>

          {/* Patient Section */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">PACIENTE</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{consultation.patient.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                <span>
                  {consultation.patient.rating} | 🥈 {consultation.patient.level}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{consultation.patient.phone}</span>
              </div>
            </div>
          </div>

          {/* Triage Section */}
          {consultation.triage && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3">TRIAGEM</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">😬 </span>
                  {consultation.triage.symptom}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>⏱️ {consultation.triage.duration}</span>
                  <span>😰 Intensidade: {consultation.triage.intensity}/5</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Camera className="w-4 h-4" />
                  <span>{consultation.triage.photos} fotos anexadas</span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">Ver</Button>
                </div>
                <div className="mt-2">
                  {(() => {
                    const badge = getUrgencyBadge(consultation.triage.urgency);
                    return (
                      <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', badge.className)}>
                        {badge.icon} {badge.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-4">
            <span className="text-sm text-muted-foreground">💰 Pagamento</span>
            <span className={cn('font-semibold', consultation.isPaid ? 'text-primary' : 'text-yellow-400')}>
              €{consultation.price} {consultation.isPaid ? `(pago via ${consultation.paymentMethod})` : '(pendente)'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Abrir Chat
            </Button>
            {isTeleconsulta && (
              <Button className="flex items-center gap-2 bg-[hsl(var(--teleconsulta))] hover:bg-[hsl(var(--teleconsulta))]/90 text-white">
                <Video className="w-4 h-4" />
                Iniciar Consulta
              </Button>
            )}
            <Button
              variant="outline"
              className="flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <FileText className="w-4 h-4" />
              Cancelar
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notas
            </Button>
            <ConsultationExportDropdown consultation={consultation} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
