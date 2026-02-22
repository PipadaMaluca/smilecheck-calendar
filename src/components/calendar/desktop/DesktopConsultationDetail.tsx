import { X, Video, MapPin, Calendar, Clock, User, Phone, Star, Mail, MessageCircle, FileText, RefreshCw, Check, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Consultation } from '@/types/calendar';
import { ConsultationExportDropdown } from '@/components/export/ConsultationExportDropdown';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DesktopConsultationDetailProps {
  consultation: Consultation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DesktopConsultationDetail({
  consultation,
  isOpen,
  onClose,
}: DesktopConsultationDetailProps) {
  if (!isOpen || !consultation) return null;

  const isTeleconsulta = consultation.type === 'teleconsulta';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-card border-l border-border z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Detalhes da Consulta</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">
                {format(consultation.date, "EEEE, d MMMM yyyy", { locale: pt })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>
                {consultation.time} - {(() => {
                  const [h, m] = consultation.time.split(':').map(Number);
                  const endDate = new Date();
                  endDate.setHours(h, m + consultation.duration);
                  return format(endDate, 'HH:mm');
                })()} ({consultation.duration} min)
              </span>
            </div>
          </div>

          <Separator />

          {/* Patient Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
              Paciente
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-semibold uppercase">{consultation.patient.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{consultation.patient.rating}</span>
                  <span className="text-primary">| {consultation.patient.level}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{consultation.patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span>{consultation.patient.name.toLowerCase().replace(' ', '.')}@email.com</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Consultation Type */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Motivo
            </h3>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  isTeleconsulta ? 'bg-orange-500/20' : 'bg-blue-500/20'
                )}
              >
                {isTeleconsulta ? (
                  <Video className="w-4 h-4 text-orange-400" />
                ) : (
                  <MapPin className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <span className="text-sm">
                {isTeleconsulta ? 'Teleconsulta' : 'Consulta Presencial'}
              </span>
            </div>
          </div>

          {/* Triage Info */}
          {consultation.triage && (
            <>
              <Separator />
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Triagem
                </h3>
                <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                  <p className="text-sm">{consultation.triage.symptom}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>⏱️ {consultation.triage.duration}</span>
                    <span>😰 Intensidade: {consultation.triage.intensity}/5</span>
                    <span>📷 {consultation.triage.photos} fotos</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Export */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Exportar
            </h3>
            <ConsultationExportDropdown consultation={consultation} />
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Notas
            </h3>
            <div className="bg-secondary/30 rounded-lg p-3 min-h-[80px]">
              <p className="text-sm text-muted-foreground italic">
                {consultation.notes || 'Sem notas adicionadas.'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Payment */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pagamento</span>
            <span
              className={cn(
                'font-semibold',
                consultation.isPaid ? 'text-primary' : 'text-yellow-400'
              )}
            >
              €{consultation.price}{' '}
              {consultation.isPaid
                ? `(pago via ${consultation.paymentMethod})`
                : '(pendente)'}
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Enviar Mensagem
            </Button>
            <Button variant="secondary" className="gap-2">
              <Phone className="w-4 h-4" />
              Ligar
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="gap-2 text-xs">
              <Edit className="w-3 h-3" />
              Editar
            </Button>
            <Button variant="outline" className="gap-2 text-xs">
              <RefreshCw className="w-3 h-3" />
              Reagendar
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <X className="w-3 h-3" />
              Cancelar
            </Button>
          </div>

          {isTeleconsulta && (
            <Button className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white">
              <Video className="w-4 h-4" />
              Iniciar Teleconsulta
            </Button>
          )}

          <Button variant="secondary" className="w-full gap-2">
            <Check className="w-4 h-4" />
            Marcar como Concluída
          </Button>
        </div>
      </div>
    </>
  );
}
