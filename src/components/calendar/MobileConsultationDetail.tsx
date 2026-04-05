import { useState } from 'react';
import { ArrowLeft, User, Calendar, Clock, MapPin, Video, Star, Phone, Mail, Camera, MessageCircle, FileText, RefreshCw, Copy, X, AlertTriangle, Pill, ChevronDown, ChevronUp, Ban, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Consultation, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_CONFIG, UserRole, getCategoryBadgeStyle , getCategoryLabel} from '@/types/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTeleconsulta } from '@/contexts/TeleconsultaContext';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { toast } from 'sonner';

interface MobileConsultationDetailProps {
  consultation: Consultation;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onCopy?: (consultation: Consultation) => void;
  onViewDossier?: (patientId: string) => void;
  userRole?: UserRole;
}

const MOCK_HEALTH_ALERTS: Record<string, { allergies: string[]; medications: { name: string; interaction?: string }[] }> = {
  'gp-p4': { allergies: ['Penicilina', 'Látex'], medications: [{ name: 'Varfarina', interaction: 'Risco com AINEs' }] },
  'gp-p9': { allergies: ['AINEs'], medications: [{ name: 'Metformina' }, { name: 'Lisinopril' }] },
  'ab-p4': { allergies: [], medications: [{ name: 'Aspirina', interaction: 'Risco hemorrágico' }] },
};

const MOCK_HISTORY = [
  { date: '15 Jan 2026', typeKey: 'restauracao' as const, dentist: 'Dr. Gonçalo Pipo', category: 'restauracao' },
  { date: '02 Dez 2025', typeKey: 'destartarizacao' as const, dentist: 'Dr. Alexandre Bernardo', category: 'destartarizacao' },
  { date: '18 Out 2025', typeKey: 'primeira_consulta' as const, dentist: 'Dr. Gonçalo Pipo', category: 'primeira_consulta' },
];

export function MobileConsultationDetail({ consultation, onClose, onNavigate, onCopy, onViewDossier, userRole = 'dentist' }: MobileConsultationDetailProps) {
  const { t } = useTranslation();
  const [generalNotes, setGeneralNotes] = useState('');
  const [consultationNotes, setConsultationNotes] = useState(consultation.notes || '');
  const [showHistory, setShowHistory] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const startTeleconsulta = useTeleconsulta();

  const isTeleconsulta = consultation.type === 'teleconsulta';
  const status = consultation.status || 'agendada';
  const statusConfig = STATUS_CONFIG[status];
  const categoryColor = consultation.category ? CATEGORY_COLORS[consultation.category] : null;
  const categoryLabel = consultation.category ? getCategoryLabel(t, consultation.category) : t('nav.consultations');
  const healthAlerts = MOCK_HEALTH_ALERTS[consultation.patient.id];
  const isDentist = userRole === 'dentist';
  const isClinic = userRole === 'clinic';

  const handleBlock = () => {
    setIsBlocked(true);
    setShowBlockModal(false);
    setBlockReason('');
    toast.success(t('consultationDetail.blockedSuccess'));
  };

  const handleUnblock = () => {
    setIsBlocked(false);
    toast.success(t('consultationDetail.unblockedSuccess'));
  };

  // Actions grid based on role
  const renderActions = () => {
    if (isDentist) {
      return (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto" onClick={() => onCopy?.(consultation)}>
              <Copy className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.copy')}</span>
            </Button>
            <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto" onClick={() => onNavigate('prescrever')}>
              <Pill className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.prescribe')}</span>
            </Button>
            <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto" onClick={() => onNavigate('conversas')}>
              <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.message')}</span>
            </Button>
            <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto" onClick={() => onNavigate('referencia')}>
              <FileText className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.recommend')}</span>
            </Button>
            <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto">
              <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.rescheduleAction')}</span>
            </Button>
            {isBlocked ? (
              <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto text-emerald-400 border-emerald-500/30" onClick={handleUnblock}>
                <Unlock className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.unblock')}</span>
              </Button>
            ) : (
              <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto text-destructive" onClick={() => setShowBlockModal(true)}>
                <Ban className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.block')}</span>
              </Button>
            )}
            <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto" onClick={() => onViewDossier?.(consultation.patient.id)}>
              <FileText className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.viewDossier')}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto border-destructive/30 text-destructive hover:bg-destructive/10">
              <X className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.cancelAction')}</span>
            </Button>
          </div>
      );
    }

    if (isClinic) {
      return (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto" onClick={() => onCopy?.(consultation)}>
              <Copy className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.copy')}</span>
            </Button>
            <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto" onClick={() => onNavigate('conversas')}>
              <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.message')}</span>
            </Button>
            <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto">
              <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.rescheduleAction')}</span>
            </Button>
            {isBlocked ? (
              <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto text-emerald-400 border-emerald-500/30" onClick={handleUnblock}>
                <Unlock className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.unblock')}</span>
              </Button>
            ) : (
              <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto text-destructive" onClick={() => setShowBlockModal(true)}>
                <Ban className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.block')}</span>
              </Button>
            )}
            <Button variant="secondary" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto" onClick={() => onViewDossier?.(consultation.patient.id)}>
              <FileText className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.viewDossier')}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 justify-start text-[13px] px-3 py-2 h-auto border-destructive/30 text-destructive hover:bg-destructive/10">
              <X className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{t('consultationDetail.cancelAction')}</span>
            </Button>
          </div>
      );
    }

    return null;
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

        <div className="max-w-3xl mx-auto p-5 space-y-4 pb-20 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Header card with patient info */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onViewDossier?.(consultation.patient.id)}
                  className="text-base font-bold text-foreground hover:text-primary transition-colors text-left"
                >
                  {consultation.patient.name}
                </button>
                <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{consultation.patient.rating}</span>
                  <span className="text-primary">| {consultation.patient.level}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {categoryColor && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={getCategoryBadgeStyle(categoryColor.hex)}>
                      {categoryLabel}
                    </span>
                  )}
                  <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1', statusConfig.bg, statusConfig.color)}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/60 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(consultation.date, "d MMM yyyy", { locale: pt })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {consultation.time} ({consultation.duration} min)
              </span>
            </div>
          </div>

          {/* Teleconsulta CTA */}
          {isTeleconsulta && (
            <Button
              className="w-full gap-2 bg-[hsl(var(--teleconsulta))] hover:bg-[hsl(var(--teleconsulta))]/90 text-white py-5 text-base font-semibold"
              onClick={() => startTeleconsulta(consultation.patient.name)}
            >
              <Video className="w-5 h-5" />
              {t('consultationDetail.startTeleconsulta')}
            </Button>
          )}

          {/* Informações */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">{t('consultationDetail.information')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{consultation.clinic.name} — {consultation.clinic.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{t('consultationDetail.expectedDuration')}: {consultation.duration} {t('agenda.minutes')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{consultation.patient.phone}</span>
              </div>
              {isTeleconsulta && (
                <div className="flex items-center gap-2 text-[hsl(var(--teleconsulta))] font-semibold">
                  <span>💰 {t('consultationDetail.amountToReceive')}: €{consultation.price}</span>
                </div>
              )}
            </div>
          </div>

          {/* Triagem */}
          {consultation.triage && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">{t('consultationDetail.triage')}</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">{t('consultationDetail.triageSymptoms')}:</span> {consultation.triage.symptom}</p>
                <p><span className="text-muted-foreground">{t('consultationDetail.triageDuration')}:</span> {consultation.triage.duration}</p>
                <p><span className="text-muted-foreground">{t('consultationDetail.triageIntensity')}:</span> {consultation.triage.intensity}/5</p>
                {consultation.triage.photos > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Camera className="w-4 h-4" />
                    <span>{consultation.triage.photos} {t('consultationDetail.triagePhotos')}</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs">{t('consultationDetail.triageView')}</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Health Alerts */}
          {healthAlerts && (healthAlerts.allergies.length > 0 || healthAlerts.medications.some(m => m.interaction)) && (
            <div className="bg-destructive/10 rounded-xl border border-destructive/30 p-4 space-y-3">
              <h3 className="text-xs font-semibold text-destructive uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t('consultationDetail.healthAlerts')}
              </h3>
              {healthAlerts.allergies.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">⚠️ {t('consultationDetail.allergies')}:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {healthAlerts.allergies.map(a => (
                      <span key={a} className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {healthAlerts.medications.filter(m => m.interaction).map(m => (
                <div key={m.name} className="flex items-start gap-2 text-sm">
                  <Pill className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <span><span className="font-medium text-yellow-400">{m.name}:</span> <span className="text-muted-foreground">{m.interaction}</span></span>
                </div>
              ))}
            </div>
          )}

          {/* Notas */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">{t('consultationDetail.notes')}</h3>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">{t('consultationDetail.generalNote')}</label>
              <Textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder={t('consultationDetail.generalNotePlaceholder')}
                className="min-h-[60px] bg-secondary/50 border-border text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">{t('consultationDetail.consultationNote')}</label>
              <Textarea
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                placeholder={t('consultationDetail.consultationNotePlaceholder')}
                className="min-h-[60px] bg-secondary/50 border-border text-sm"
              />
            </div>
          </div>

          {/* Histórico */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <button className="flex items-center justify-between w-full" onClick={() => setShowHistory(!showHistory)}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">{t('consultationDetail.briefHistory')}</h3>
              {showHistory ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {showHistory && (
              <div className="space-y-2">
                {MOCK_HISTORY.map((h, i) => {
                  const hColors = CATEGORY_COLORS[h.category as keyof typeof CATEGORY_COLORS];
                  return (
                    <div key={i} className="flex flex-col gap-0.5 py-1.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: hColors?.hex || 'hsl(var(--muted-foreground))' }} />
                        <span className="text-[13px] text-muted-foreground whitespace-nowrap">{h.date}</span>
                        <span className="text-[13px] font-medium">{getCategoryLabel(t, h.typeKey as any)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground pl-4">{h.dentist}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">{t('consultationDetail.actions')}</h3>
            {renderActions()}
          </div>
        </div>
      </div>

      {/* Block Patient Modal */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="sm:max-w-md z-[70]">
          <DialogHeader>
            <DialogTitle>⚠️ {t('consultationDetail.blockTitle', { name: consultation.patient.name })}</DialogTitle>
            <DialogDescription>
              {t('consultationDetail.blockDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">{t('consultationDetail.blockReasonLabel')}</label>
              <Textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder={t('consultationDetail.blockReasonPlaceholder')}
                className="mt-1 min-h-[80px] bg-secondary/50 border-border text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">{t('consultationDetail.blockNotify')}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowBlockModal(false)}>{t('common.cancel')}</Button>
              <Button variant="destructive" className="flex-1" disabled={!blockReason.trim()} onClick={handleBlock}>{t('consultationDetail.block')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
