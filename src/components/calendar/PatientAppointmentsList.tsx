import { Video, MapPin, Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Consultation, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';

interface PatientAppointmentsListProps {
  consultations: Consultation[];
  selectedDate: Date;
  onConsultationClick: (consultation: Consultation) => void;
}

export function PatientAppointmentsList({
  consultations,
  selectedDate,
  onConsultationClick,
}: PatientAppointmentsListProps) {
  // Sort by date and time
  const sortedConsultations = [...consultations].sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  const getPaymentStatus = (consultation: Consultation) => {
    if (consultation.type === 'teleconsulta') {
      return consultation.isPaid ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-green-500/20 text-green-400">
          <Check className="w-3 h-3" />
          Pago
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-yellow-500/20 text-yellow-400">
          <AlertCircle className="w-3 h-3" />
          Pendente
        </span>
      );
    }
    // Presencial always shows "A pagar"
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-400">
        <Clock className="w-3 h-3" />
        A pagar
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-4 bg-[#1A2F3D]">
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold mb-4">Minhas Consultas</h2>

        {sortedConsultations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Sem consultas agendadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedConsultations.map((consultation) => {
              const category = consultation.category || 'restauracao';
              const colors = CATEGORY_COLORS[category];
              const isTeleconsulta = consultation.type === 'teleconsulta';

              return (
                <div
                  key={consultation.id}
                  className={cn(
                    'bg-card rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg',
                    'border-l-4'
                  )}
                  style={{ borderLeftColor: colors.hex }}
                  onClick={() => onConsultationClick(consultation)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">
                          {format(consultation.date, "EEEE, d 'de' MMMM", { locale: pt })}
                        </span>
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{consultation.time}</span>
                      </div>

                      {/* Category */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: `${colors.hex}20`,
                            color: colors.hex,
                          }}
                        >
                          {isTeleconsulta && <Video className="w-3.5 h-3.5" />}
                          {CATEGORY_LABELS[category] || 'Consulta'}
                        </span>
                        {getPaymentStatus(consultation)}
                      </div>

                      {/* Patient name (for family view) */}
                      <p className="text-xs text-primary font-medium mb-1">
                        Para: {consultation.patient.name}
                      </p>

                      {/* Dentist & Clinic */}
                      <ClickableDentistName name={consultation.dentist.name} className="text-sm font-medium" />
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <ClickableClinicName name={consultation.clinic.name} className="text-xs text-muted-foreground" />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-bold">{consultation.price}€</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle reschedule
                      }}
                    >
                      Reagendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle cancel
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
