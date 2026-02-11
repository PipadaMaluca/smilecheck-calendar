import { Video, AlertTriangle, MoreHorizontal, Check, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Consultation, Dentist, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ListViewProps {
  consultations: Consultation[];
  dentists: Dentist[];
  onConsultationClick: (consultation: Consultation) => void;
}

export function ListView({ consultations, dentists, onConsultationClick }: ListViewProps) {
  // Sort consultations by time
  const sortedConsultations = [...consultations].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  const getStatusBadge = (consultation: Consultation) => {
    if (consultation.type === 'teleconsulta') {
      return consultation.isPaid ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
          <Check className="w-3 h-3" />
          Pago
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
          <Clock className="w-3 h-3" />
          Pendente
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
        <Clock className="w-3 h-3" />
        A pagar
      </span>
    );
  };

  const getArrivalTime = (consultation: Consultation) => {
    // Mock arrival time - for presencial, show random time before appointment
    if (consultation.type === 'presencial' && consultation.isPaid) {
      const [hour, min] = consultation.time.split(':').map(Number);
      const arrivalMin = min - Math.floor(Math.random() * 15 + 5);
      const arrivalHour = arrivalMin < 0 ? hour - 1 : hour;
      const finalMin = arrivalMin < 0 ? 60 + arrivalMin : arrivalMin;
      return `${arrivalHour.toString().padStart(2, '0')}:${finalMin.toString().padStart(2, '0')}`;
    }
    return '-';
  };

  return (
    <div className="flex-1 overflow-auto bg-[#1A2F3D] p-4">
      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#1E3A5F] hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground w-[140px]">Agenda</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">Horário</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[100px]">Estatuto</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">Chegou às</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[180px]">Paciente</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">Ação</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Motivo de consulta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedConsultations.map((consultation) => {
              const category = consultation.category || 'restauracao';
              const colors = CATEGORY_COLORS[category];
              const isTeleconsulta = consultation.type === 'teleconsulta';
              const isUrgentTeleconsulta = consultation.isUrgentTeleconsulta;

              return (
                <TableRow
                  key={consultation.id}
                  className="border-b border-[#1E3A5F]/50 cursor-pointer hover:bg-[#152238] transition-colors"
                  onClick={() => onConsultationClick(consultation)}
                >
                  {/* Color indicator + Dentist */}
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colors.hex }}
                      />
                      <ClickableDentistName name={consultation.dentist.name} className="text-xs" />
                    </div>
                  </TableCell>

                  {/* Time */}
                  <TableCell className="py-2">
                    <span className="text-xs font-mono">{consultation.time}</span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-2">
                    {getStatusBadge(consultation)}
                  </TableCell>

                  {/* Arrival time */}
                  <TableCell className="py-2">
                    <span className="text-xs text-muted-foreground">
                      {getArrivalTime(consultation)}
                    </span>
                  </TableCell>

                  {/* Patient */}
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs font-bold uppercase truncate">
                        {consultation.patient.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConsultationClick(consultation);
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>

                  {/* Reason / Category */}
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${colors.hex}20`,
                          color: colors.hex,
                        }}
                      >
                        {isTeleconsulta && (
                          <Video className="w-3 h-3" />
                        )}
                        {isUrgentTeleconsulta && (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {CATEGORY_LABELS[category] || 'Consulta'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {sortedConsultations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Sem consultas para este dia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
