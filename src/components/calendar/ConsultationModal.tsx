import { ArrowLeft, Video, MapPin, Calendar, Clock, User, Phone, Star, Camera, MessageCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Consultation } from '@/types/calendar';
import { ConsultationExportDropdown } from '@/components/export/ConsultationExportDropdown';
import { format } from 'date-fns';
import { pt, enUS, fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const dateLocales = { pt, en: enUS, fr } as const;

interface ConsultationModalProps {
  consultation: Consultation;
  isOpen: boolean;
  onClose: () => void;
}

export function ConsultationModal({ consultation, isOpen, onClose }: ConsultationModalProps) {
  const { t, i18n } = useTranslation();
  const locale = dateLocales[i18n.language as keyof typeof dateLocales] || pt;

  if (!isOpen) return null;

  const isTeleconsulta = consultation.type === 'teleconsulta';

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgente':
        return { label: t('agenda.urgent'), className: 'badge-urgente', icon: '🔴' };
      case 'prioritario':
        return { label: t('agenda.priority'), className: 'badge-prioritario', icon: '🟡' };
      default:
        return { label: t('agenda.routine'), className: 'badge-rotina', icon: '🟢' };
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden pb-[60px]">
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-base font-semibold">{t('agenda.consultationDetails')}</h2>
        <div className="w-10" />
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-lg mx-auto p-5 space-y-5">
          <div
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold',
              isTeleconsulta ? 'badge-teleconsulta' : 'badge-presencial'
            )}
          >
            {isTeleconsulta ? (
              <>
                <Video className="w-4 h-4" />
                🟢 {t('agenda.teleconsulta')}
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                🔵 {t('agenda.presencial')}
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                {format(consultation.date, "EEEE, d MMMM", { locale })}, {consultation.time}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{t('agenda.estimatedDuration')}: {consultation.duration} min</span>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">{t('agenda.patient').toUpperCase()}</h3>
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

          {consultation.triage && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3">{t('agenda.triage').toUpperCase()}</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">😬 </span>
                  {consultation.triage.symptom}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>⏱️ {consultation.triage.duration}</span>
                  <span>😰 {t('agenda.intensity')}: {consultation.triage.intensity}/5</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Camera className="w-4 h-4" />
                  <span>{consultation.triage.photos} {t('agenda.photosAttached')}</span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">{t('common.view')}</Button>
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

          <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-4">
            <span className="text-sm text-muted-foreground">💰 {t('agenda.payment')}</span>
            <span className={cn('font-semibold', consultation.isPaid ? 'text-primary' : 'text-yellow-400')}>
              €{consultation.price} {consultation.isPaid ? `(${t('agenda.paidVia')} ${consultation.paymentMethod})` : `(${t('agenda.pending')})`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {t('agenda.openChat')}
            </Button>
            {isTeleconsulta && (
              <Button className="flex items-center gap-2 bg-[hsl(var(--teleconsulta))] hover:bg-[hsl(var(--teleconsulta))]/90 text-white">
                <Video className="w-4 h-4" />
                {t('agenda.startConsultation')}
              </Button>
            )}
            <Button
              variant="outline"
              className="flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <FileText className="w-4 h-4" />
              {t('common.cancel')}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t('agenda.notes')}
            </Button>
            <ConsultationExportDropdown consultation={consultation} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
