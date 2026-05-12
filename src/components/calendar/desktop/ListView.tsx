import { useState } from 'react';
import { MoreHorizontal, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Consultation, Dentist, CATEGORY_COLORS, CATEGORY_PILL_EMOJIS, STATUS_CONFIG, getCategoryBadgeStyle , getCategoryLabel} from '@/types/calendar';
import { useTranslation } from 'react-i18next';
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
  onConsultationHover?: (consultation: Consultation | null) => void;
}

export function ListView({ consultations, dentists, onConsultationClick, onConsultationHover }: ListViewProps) {
  const { t } = useTranslation();
  // Sort consultations by time
  const sortedConsultations = [...consultations].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  const getStatusBadge = (consultation: Consultation) => {
    const status = consultation.status || 'agendada';
    const config = STATUS_CONFIG[status];
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs', config.bg, config.color)}>
        {config.icon} {config.label}
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
              <TableHead className="text-xs font-semibold text-muted-foreground w-[140px]">{t('agenda.schedule')}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">{t('agenda.time')}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[100px]">{t('agenda.status')}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">{t('agenda.arrivedAt')}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[180px]">{t('common.patient')}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[80px]">{t('agenda.action')}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">{t('agenda.consultationReason')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedConsultations.map((consultation) => {
              const category = consultation.category || 'restauracao';
              const colors = CATEGORY_COLORS[category];
              const pillEmoji = CATEGORY_PILL_EMOJIS[category];
              return (
                <TableRow
                  key={consultation.id}
                  className="border-b border-[#1E3A5F]/50 cursor-pointer hover:bg-[#152238] transition-colors"
                  onClick={() => onConsultationClick(consultation)}
                  onMouseEnter={() => onConsultationHover?.(consultation)}
                  onMouseLeave={() => onConsultationHover?.(null)}
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
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-flex items-center text-[11px] font-bold leading-none rounded-full whitespace-nowrap flex-shrink-0"
                        style={{ ...getCategoryBadgeStyle(colors.hex), padding: '2px 10px' }}
                      >
                        {pillEmoji && <span style={{ fontSize: 'inherit', lineHeight: 1 }}>{pillEmoji}</span>}
                        {getCategoryLabel(t, category)}
                      </span>
                      {consultation.notes && (
                        <span className="text-xs text-muted-foreground truncate min-w-0 flex-1">
                          {consultation.notes}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {sortedConsultations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {t('agenda.noConsultationsToday')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
