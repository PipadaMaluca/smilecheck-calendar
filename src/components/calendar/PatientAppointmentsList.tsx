import { useState } from 'react';
import { Video, MapPin, Clock, Calendar, Check, AlertCircle, MessageCircle, Ban } from 'lucide-react';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { ListSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Consultation, CATEGORY_COLORS, CATEGORY_LABELS, getCategoryBadgeStyle , getCategoryLabel} from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { SwipeableRow } from '@/components/ui/swipeable-row';
import { useToast } from '@/hooks/use-toast';

interface PatientAppointmentsListProps {
  consultations: Consultation[];
  selectedDate: Date;
  onConsultationClick: (consultation: Consultation) => void;
  selectedConsultationId?: string | null;
  compact?: boolean;
}

export function PatientAppointmentsList({
  consultations,
  selectedDate,
  onConsultationClick,
  selectedConsultationId,
  compact = false
}: PatientAppointmentsListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isLoading = useSimulatedLoading(1000);
  const [activeSwipeRow, setActiveSwipeRow] = useState<string | null>(null);
  // Sort by date and time
  const sortedConsultations = [...consultations].sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

  const getPaymentStatus = (consultation: Consultation) => {
    if (consultation.type === 'teleconsulta') {
      return consultation.isPaid ?
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-green-500/20 text-green-400">
          <Check className="w-3 h-3" />
          Pago
        </span> :

      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-yellow-500/20 text-yellow-400">
          <AlertCircle className="w-3 h-3" />
          Pendente
        </span>;

    }
    // Presencial always shows "A pagar"
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-400">
        <Clock className="w-3 h-3" />
        A pagar
      </span>);

  };

  if (isLoading) {
    return (
      <div className={cn("flex-1 overflow-auto p-4 bg-[#1A2F3D]", compact && "p-3")}>
        <ListSkeleton rows={5} showAvatar />
      </div>
    );
  }

  return (
    <div className={cn("flex-1 overflow-auto p-4 bg-[#1A2F3D] animate-fade-in", compact && "p-3")}>
      <div className={cn("space-y-4", compact ? "max-w-full" : "max-w-2xl mx-auto")}>
        <h2 className={cn("font-semibold mb-4", compact ? "text-base" : "text-lg")}>Minhas Consultas</h2>

        {sortedConsultations.length === 0 ?
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-bold text-foreground mb-1">{t('emptyStates.agendaTitle')}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">{t('emptyStates.agendaDesc')}</p>
          </div> :

        <div className="space-y-3">
            {sortedConsultations.map((consultation) => {
            const category = consultation.category || 'restauracao';
            const colors = CATEGORY_COLORS[category];
            const isTeleconsulta = consultation.type === 'teleconsulta';
            const isSelected = selectedConsultationId === consultation.id;

            return (
              <SwipeableRow
                key={consultation.id}
                rowId={consultation.id}
                activeRowId={activeSwipeRow}
                onSwipeOpen={setActiveSwipeRow}
                leftActions={[{
                  label: t('common.message'),
                  icon: <MessageCircle className="w-5 h-5" />,
                  color: '#2196F3',
                  onAction: () => {
                    toast({ title: `💬 ${t('common.message')}: ${consultation.dentist.name}`, duration: 2000 });
                  }
                }]}
                rightActions={[{
                  label: t('common.cancel'),
                  icon: <Ban className="w-5 h-5" />,
                  color: '#F44336',
                  onAction: () => {
                    toast({ title: `❌ ${t('common.cancelConsultation')}`, duration: 2000 });
                  }
                }]}
              >
              <div
                className={cn(
                  'bg-card rounded-xl cursor-pointer transition-all duration-200',
                  'border-l-4',
                  compact ? 'p-3' : 'p-4',
                  isSelected 
                    ? 'ring-2 ring-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)] scale-[1.01]' 
                    : 'hover:scale-[1.01] hover:shadow-lg'
                )}
                style={{ borderLeftColor: colors.hex }}
                onClick={() => onConsultationClick(consultation)}>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Date & Time */}
                      <div className={cn("flex items-center gap-2 text-muted-foreground mb-2", compact ? "text-xs" : "text-sm")}>
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="capitalize truncate">
                          {format(consultation.date, compact ? "d MMM" : "EEEE, d 'de' MMMM", { locale: pt })}
                        </span>
                        <span>•</span>
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="font-mono">{consultation.time}</span>
                      </div>

                      {/* Category */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                        style={getCategoryBadgeStyle(colors.hex)}>

                          {isTeleconsulta && <Video className="w-3.5 h-3.5" />}
                          {getCategoryLabel(t, category)}
                        </span>
                        {getPaymentStatus(consultation)}
                      </div>

                      {/* Patient name (for family view) */}
                      <p className="text-xs text-primary font-medium mb-1">
                        Para: {consultation.patient.name}
                      </p>

                      {/* Dentist & Clinic */}
                      <ClickableDentistName name={consultation.dentist.name} className={cn("font-medium", compact ? "text-xs" : "text-sm")} />
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <ClickableClinicName name={consultation.clinic.name} className="text-xs text-muted-foreground truncate" />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      
                    </div>
                  </div>

                  {/* Actions */}
                  {!compact && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle reschedule
                      }}>

                        {t('agenda.reschedule')}
                      </Button>
                      <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}>

                        {t('common.cancel')}
                      </Button>
                    </div>
                  )}
                </div>
              </SwipeableRow>);

          })}
          </div>
        }
      </div>
    </div>);

}
