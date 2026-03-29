import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, MapPin, Video, MessageCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Consultation, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_CONFIG, getCategoryBadgeStyle } from '@/types/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { useTeleconsulta } from '@/contexts/TeleconsultaContext';
import { DENTIST_AVATAR_PHOTOS, getDentistInitials } from '@/lib/avatarUtils';
import { RescheduleModal } from './RescheduleModal';

interface PatientConsultationDetailProps {
  consultation: Consultation;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToChat?: (dentistName: string) => void;
}

const MOCK_HISTORY = [
  { date: '15 Jan 2026', type: 'Restauração', dentist: 'Dr. Gonçalo Pipo', category: 'restauracao' },
  { date: '02 Dez 2025', type: 'Destartarização', dentist: 'Dr. Alexandre Bernardo', category: 'destartarizacao' },
  { date: '18 Out 2025', type: '1ª Consulta', dentist: 'Dr. Gonçalo Pipo', category: 'primeira_consulta' },
];

export function PatientConsultationDetail({ consultation, isOpen, onClose, onNavigateToChat }: PatientConsultationDetailProps) {
  const { t } = useTranslation();
  const startTeleconsulta = useTeleconsulta();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [cancelled, setCancelled] = useState(false);
  const [rescheduleCount] = useState(0);

  if (!isOpen) return null;

  const isTeleconsulta = consultation.type === 'teleconsulta';
  const category = consultation.category || 'restauracao';
  const colors = CATEGORY_COLORS[category];
  const categoryLabel = CATEGORY_LABELS[category];
  const status = consultation.status || 'agendada';
  const statusConfig = STATUS_CONFIG[status];
  const dentistAvatar = DENTIST_AVATAR_PHOTOS[consultation.dentist.id];
  const maxReschedules = 2;
  const canReschedule = rescheduleCount < maxReschedules;

  const cancellationReasons = [
    t('consultationDetail.cancellationModal.scheduleConflict'),
    t('consultationDetail.cancellationModal.personalEmergency'),
    t('consultationDetail.cancellationModal.noLongerNeeded'),
    t('consultationDetail.cancellationModal.otherReason'),
  ];

  const handleConfirmCancel = () => {
    setCancelled(true);
    setTimeout(() => {
      setShowCancelModal(false);
      setCancelled(false);
      onClose();
    }, 1500);
  };

  const handleSendMessage = () => {
    if (onNavigateToChat) {
      onNavigateToChat(consultation.dentist.name);
    }
  };

  return (
    <>
      <div className="bg-background">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-base font-semibold">{t('consultationDetail.title')}</h2>
          <div className="w-10" />
        </div>

        <div className="max-w-3xl mx-auto p-5 space-y-4 pb-20">

            {/* ── Dentist Header Card ── */}
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 flex-shrink-0 ring-2 ring-border">
                  <AvatarImage src={dentistAvatar || ''} alt={consultation.dentist.name} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                    {getDentistInitials(consultation.dentist.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('consultationDetail.consultationWith')}</p>
                  <ClickableDentistName name={consultation.dentist.name} className="text-base font-bold leading-tight" />
                  <p className="text-xs text-muted-foreground mt-0.5">{consultation.dentist.specialty || 'Médico Dentista'}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {colors && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={getCategoryBadgeStyle(colors.hex)}>
                        {categoryLabel}
                      </span>
                    )}
                    <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1', statusConfig.bg, statusConfig.color)}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
              {/* Date/time row */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/60 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(consultation.date, "EEEE, d 'de' MMMM yyyy", { locale: pt })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {consultation.time} · {consultation.duration} {t('agenda.minutes')}
                </span>
              </div>
            </div>

            {/* Teleconsulta CTA */}
            {isTeleconsulta && (
              <Button
                className="w-full gap-2 bg-[hsl(var(--teleconsulta))] hover:bg-[hsl(var(--teleconsulta))]/90 text-white py-5 text-base font-semibold"
                onClick={() => startTeleconsulta(consultation.dentist.name)}
              >
                <Video className="w-5 h-5" />
                {t('consultationDetail.startTeleconsulta')}
              </Button>
            )}

            {/* ── Informações ── */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t('consultationDetail.information')}</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <ClickableClinicName name={consultation.clinic.name} className="font-semibold" />
                    <p className="text-muted-foreground text-xs mt-0.5">{consultation.clinic.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{t('consultationDetail.expectedDuration')}:</span>
                  <span className="font-medium">{consultation.duration} {t('agenda.minutes')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {isTeleconsulta
                    ? <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span className="text-muted-foreground">{isTeleconsulta ? t('consultation.teleconsultation') : t('consultationDetail.inPersonConsultation')}</span>
                </div>
              </div>
            </div>

            {/* ── Nota desta Consulta (read-only) ── */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t('consultationDetail.consultationNote')}</h3>
              {consultation.notes ? (
                <p className="text-sm text-foreground leading-relaxed">{consultation.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic">{t('consultationDetail.noNotes')}</p>
              )}
            </div>

            {/* ── Histórico Resumido ── */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t('consultationDetail.briefHistory')}</h3>
              <div className="space-y-0">
                {MOCK_HISTORY.map((h, i) => {
                  const hColors = CATEGORY_COLORS[h.category as keyof typeof CATEGORY_COLORS];
                  return (
                    <div key={i} className="flex items-center justify-between text-sm py-2.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: hColors?.hex || 'hsl(var(--muted-foreground))' }}
                        />
                        <span className="text-muted-foreground text-xs">{h.date}</span>
                        <span className="font-medium text-foreground">{h.type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{h.dentist}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Ações ── */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t('consultationDetail.actions')}</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  className="flex flex-col gap-1 h-14 text-xs px-2"
                  onClick={handleSendMessage}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('consultation.sendMessage')}
                </Button>
                <div className="relative">
                  <Button
                    variant="secondary"
                    className="flex flex-col gap-1 h-14 text-xs px-2 w-full"
                    disabled={!canReschedule}
                    onClick={() => setShowReschedule(true)}
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('consultation.reschedule')}
                  </Button>
                  {rescheduleCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-[9px] bg-muted px-1 rounded text-muted-foreground">
                      {rescheduleCount}/{maxReschedules}
                    </span>
                  )}
                  {!canReschedule && (
                    <p className="text-[9px] text-destructive mt-0.5 text-center">{t('consultationDetail.limitReached')}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="flex flex-col gap-1 h-14 text-xs px-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setShowCancelModal(true)}
                >
                  <X className="w-4 h-4" />
                  {t('consultation.cancel')}
                </Button>
              </div>
            </div>

          </div>
      </div>

      {/* ── Reschedule Modal ── */}
      <RescheduleModal
        consultation={consultation}
        isOpen={showReschedule}
        onClose={() => setShowReschedule(false)}
        rescheduleCount={rescheduleCount}
      />

      {/* ── Cancellation Modal ── */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md z-[70]">
          {cancelled ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">✅</div>
              <p className="text-lg font-semibold">{t('consultationDetail.cancellationModal.cancelledSuccess')}</p>
              <p className="text-sm text-muted-foreground">{t('consultationDetail.cancellationModal.redirecting')}</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t('consultationDetail.cancellationModal.title')}</DialogTitle>
                <DialogDescription>
                  {t('consultationDetail.cancellationModal.subtitle')}
                </DialogDescription>
              </DialogHeader>

              <div className="bg-destructive/10 rounded-lg p-3 text-sm text-destructive flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>{t('consultationDetail.cancellationModal.warning')}</span>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('consultationDetail.cancellationModal.reason')}</Label>
                <RadioGroup value={cancelReason} onValueChange={setCancelReason} className="space-y-2">
                  {cancellationReasons.map((reason) => (
                    <div key={reason} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason} id={reason} />
                      <Label htmlFor={reason} className="text-sm font-normal cursor-pointer">{reason}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('consultationDetail.cancellationModal.observationsLabel')}{' '}
                  <span className="text-muted-foreground font-normal">({t('common.optional')})</span>
                </Label>
                <Textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder={t('consultationDetail.cancellationModal.observations')}
                  className="min-h-[60px] bg-secondary/50 border-border text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCancelModal(false)}>
                  {t('common.back')}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={!cancelReason}
                  onClick={handleConfirmCancel}
                >
                  {t('consultationDetail.cancellationModal.confirmCancel')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
