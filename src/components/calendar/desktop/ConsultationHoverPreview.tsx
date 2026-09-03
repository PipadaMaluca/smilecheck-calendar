import { User, Check } from 'lucide-react';
import { Glyph } from '@/components/ui/glyph';
import { addMinutes, format } from 'date-fns';
import { pt, enUS, fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  CATEGORY_COLORS,
  CATEGORY_PILL_EMOJIS,
  Consultation,
  getCategoryBadgeStyle,
  getCategoryLabel,
} from '@/types/calendar';

interface ConsultationHoverPreviewProps {
  consultation: Consultation;
}

const locales = { pt, en: enUS, fr };

function getTimeRange(consultation: Consultation) {
  const [hour, minute] = consultation.time.split(':').map(Number);
  const start = new Date(consultation.date);
  start.setHours(hour, minute, 0, 0);
  return `${format(start, 'HH:mm')} → ${format(addMinutes(start, consultation.duration), 'HH:mm')}`;
}

export function ConsultationHoverPreview({ consultation }: ConsultationHoverPreviewProps) {
  const { t, i18n } = useTranslation();
  const category = consultation.category || 'restauracao';
  const colors = CATEGORY_COLORS[category];
  const locale = locales[(i18n.language?.split('-')[0] as keyof typeof locales) || 'pt'] || pt;
  const status = consultation.status || 'agendada';
  const isConfirmed = status === 'confirmada' || status === 'visto' || status === 'em_consulta';
  const emoji = CATEGORY_PILL_EMOJIS[category];

  return (
    <div className="m-3 rounded-md bg-white p-4 text-[#0F172A] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:bg-[#1E293B] dark:text-[#E2E8F0] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
      <div className="space-y-4 divide-y divide-[#E2E8F0] dark:divide-[rgba(255,255,255,0.08)]">
        <section className="space-y-2">
          <span
            className="inline-flex items-center gap-1 rounded-full text-sm font-bold leading-none whitespace-nowrap"
            style={{ ...getCategoryBadgeStyle(colors.hex), padding: '3px 10px' }}
          >
            {getCategoryLabel(t, category)}
            {emoji && <Glyph emoji={emoji} className="w-3.5 h-3.5" />}
          </span>
          <div className="text-[13px] capitalize text-[#64748B] dark:text-[#94A3B8]">
            {format(consultation.date, 'EEE d MMM', { locale })}
          </div>
          <div className="text-base font-bold" style={{ color: colors.hex }}>
            {getTimeRange(consultation)}
          </div>
        </section>

        <section className="space-y-1 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4 flex-shrink-0" />
            <span>{consultation.patient.name}</span>
          </div>
          <div className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">{consultation.patient.phone}</div>
          <div className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
            {consultation.patient.dateOfBirth || '—'}{consultation.patient.age ? ` (${consultation.patient.age} anos)` : ''}
          </div>
        </section>

        <section className="pt-4 text-[13px] font-semibold">
          {isConfirmed ? (
            <span className="text-success inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Confirmada</span>
          ) : (
            <span className="text-amber-500">⏳ Pendente</span>
          )}
        </section>

        <section className="pt-4">
          <p className="text-xs leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
            {consultation.notes || 'Sem observações'}
          </p>
        </section>

        <section className="space-y-1 pt-4 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
          <div className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{consultation.dentist.name}</div>
          <div>{consultation.clinic.name}</div>
        </section>
      </div>
    </div>
  );
}