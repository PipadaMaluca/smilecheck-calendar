import { ArrowLeft, Calendar, Clock, MapPin, Video, Star, Phone, MessageCircle, RefreshCw, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Consultation, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_CONFIG, getCategoryTextStyle } from '@/types/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';

interface PatientConsultationDetailProps {
  consultation: Consultation;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientConsultationDetail({ consultation, isOpen, onClose }: PatientConsultationDetailProps) {
  if (!isOpen) return null;

  const isTeleconsulta = consultation.type === 'teleconsulta';
  const category = consultation.category || 'restauracao';
  const colors = CATEGORY_COLORS[category];
  const categoryLabel = CATEGORY_LABELS[category];
  const status = consultation.status || 'agendada';
  const statusConfig = STATUS_CONFIG[status];

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
          {/* Status + Type */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', statusConfig.bg, statusConfig.color)}>
              {statusConfig.icon} {statusConfig.label}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${colors.hex}20`, ...getCategoryTextStyle(colors.hex) }}
            >
              {isTeleconsulta ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
              {isTeleconsulta ? 'Teleconsulta' : 'Presencial'}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${colors.hex}20` }}
            >
              {isTeleconsulta ? (
                <Video className="w-6 h-6" style={{ color: colors.hex }} />
              ) : (
                <MapPin className="w-6 h-6" style={{ color: colors.hex }} />
              )}
            </div>
            <div>
              <p className="text-lg font-bold" style={getCategoryTextStyle(colors.hex)}>
                {categoryLabel}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(consultation.date, "EEEE, d 'de' MMMM yyyy", { locale: pt })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Date, Time, Duration */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{format(consultation.date, "d 'de' MMMM yyyy", { locale: pt })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{consultation.time} — {consultation.duration} min</span>
            </div>
          </div>

          <Separator />

          {/* Dentist */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Dentista</h4>
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <ClickableDentistName name={consultation.dentist.name} className="text-sm font-semibold" />
                  <p className="text-xs text-muted-foreground">
                    {consultation.dentist.specialty || 'Dentista'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinic */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Clínica</h4>
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <ClickableClinicName name={consultation.clinic.name} className="text-sm font-semibold" />
                  <p className="text-xs text-muted-foreground">{consultation.clinic.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-4">
            <span className="text-sm text-muted-foreground">💰 Pagamento</span>
            <span className={cn('font-semibold', consultation.isPaid ? 'text-primary' : 'text-yellow-400')}>
              €{consultation.price} {consultation.isPaid ? `(pago)` : '(pendente)'}
            </span>
          </div>

          {/* Notes */}
          {consultation.notes && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Notas</h4>
              <p className="text-sm text-muted-foreground bg-secondary/30 rounded-xl p-4">{consultation.notes}</p>
            </div>
          )}

          {/* Triage */}
          {consultation.triage && (
            <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Triagem</h4>
              <p className="text-sm">{consultation.triage.symptom}</p>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>⏱️ {consultation.triage.duration}</span>
                <span>😰 Intensidade: {consultation.triage.intensity}/5</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Reagendar
            </Button>
            <Button variant="outline" className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
              <X className="w-4 h-4" /> Cancelar
            </Button>
            <Button variant="secondary" className="gap-2">
              <MessageCircle className="w-4 h-4" /> Mensagem
            </Button>
            {isTeleconsulta && (
              <Button className="gap-2 bg-[hsl(var(--teleconsulta))] hover:bg-[hsl(var(--teleconsulta))]/90 text-white">
                <Video className="w-4 h-4" /> Iniciar
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
