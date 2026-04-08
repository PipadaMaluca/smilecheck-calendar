import { useEffect, useState } from 'react';
import { User, Calendar, Clock, MapPin, Video, Star, Phone, Mail, Camera, MessageCircle, FileText, RefreshCw, Copy, ArrowLeft, AlertTriangle, Pill, ChevronDown, ChevronUp, Ban, Unlock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Consultation, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_CONFIG, ConsultationStatus, UserRole, getCategoryBadgeStyle, getCategoryLabel } from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { pt, enGB, fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTeleconsulta } from '@/contexts/TeleconsultaContext';
import { toast } from 'sonner';

interface ConsultationDetailViewProps {
  consultation: Consultation;
  onClose: () => void;
  onViewDossier: (patientId: string) => void;
  onNavigate: (tab: string) => void;
  onCopy?: (consultation: Consultation) => void;
  userRole?: UserRole;
}

const MOCK_HEALTH_ALERTS: Record<string, { allergies: string[]; medications: { name: string; interaction?: string }[] }> = {
  'gp-p4': { allergies: ['Penicilina', 'Látex'], medications: [{ name: 'Varfarina', interaction: 'Risco com AINEs' }] },
  'gp-p9': { allergies: ['AINEs'], medications: [{ name: 'Metformina' }, { name: 'Lisinopril' }] },
  'ab-p4': { allergies: [], medications: [{ name: 'Aspirina', interaction: 'Risco hemorrágico' }] },
};

const MOCK_HISTORY: Record<string, { date: string; category: string; dentist: string }[]> = {
  default: [
    { date: '15 Jan 2026', category: 'restauracao', dentist: 'Dr. Gonçalo Pipo' },
    { date: '02 Dez 2025', category: 'destartarizacao', dentist: 'Dr. Alexandre Bernardo' },
    { date: '18 Out 2025', category: 'primeira_consulta', dentist: 'Dr. Gonçalo Pipo' },
  ],
};

const DATE_LOCALES: Record<string, typeof pt> = { pt, en: enGB, fr };

interface ResponsiveTextProps {
  full: string;
  med: string;
  short: string;
}

function ResponsiveText({ full, med, short }: ResponsiveTextProps) {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const text = width >= 1024 ? full : width >= 768 ? med : short;

  return <span style={{ display: 'inline-block', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>;
}

export function ConsultationDetailView({ consultation, onClose, onViewDossier, onNavigate, onCopy, userRole = 'dentist' }: ConsultationDetailViewProps) {
  const { t, i18n } = useTranslation();
  const [generalNotes, setGeneralNotes] = useState('');
  const [consultationNotes, setConsultationNotes] = useState(consultation.notes || '');
  const [showHistory, setShowHistory] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const startTeleconsulta = useTeleconsulta();

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

  const actionText = (fullKey: string, medKey: string, shortKey: string, namespace = 'actions') => (
    <ResponsiveText
      full={t(`${namespace}.${fullKey}`)}
      med={t(`${namespace}.${medKey}`)}
      short={t(`${namespace}.${shortKey}`)}
    />
  );

  const isTeleconsulta = consultation.type === 'teleconsulta';
  const status = consultation.status || 'agendada';
  const statusConfig = STATUS_CONFIG[status];
  const categoryColor = consultation.category ? CATEGORY_COLORS[consultation.category] : null;
  const categoryLabel = consultation.category ? getCategoryLabel(t, consultation.category) : t('consultationTypes.teleconsultation');
  const healthAlerts = MOCK_HEALTH_ALERTS[consultation.patient.id];
  const history = MOCK_HISTORY.default;
  const dateLocale = DATE_LOCALES[i18n.language] || pt;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 mt-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <button
                  onClick={() => onViewDossier(consultation.patient.id)}
                  className="text-lg font-bold text-foreground hover:text-primary transition-colors text-left"
                >
                  {consultation.patient.name}
                </button>
                <div className="flex items-center gap-3 mt-1">
                  {categoryColor && (
                    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full')} style={getCategoryBadgeStyle(categoryColor.hex)}>
                      {categoryLabel}
                    </span>
                  )}
                  <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1', statusConfig.bg, statusConfig.color)}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(consultation.date, "d MMM yyyy", { locale: dateLocale })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {consultation.time} ({consultation.duration} min)
                  </span>
                </div>
              </div>
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

          {/* Information */}
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
              {isTeleconsulta && (
                <div className="flex items-center gap-2 text-[hsl(var(--teleconsulta))] font-semibold">
                  <span>💰 {t('consultationDetail.amountToReceive')}: €{consultation.price}</span>
                </div>
              )}
            </div>
          </div>

          {/* Triage */}
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

          {/* Notes */}
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

          {/* History */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <button className="flex items-center justify-between w-full" onClick={() => setShowHistory(!showHistory)}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">{t('consultationDetail.briefHistory')}</h3>
              {showHistory ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {showHistory && (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', CATEGORY_COLORS[h.category as keyof typeof CATEGORY_COLORS]?.bg || 'bg-muted')} />
                      <span className="text-muted-foreground">{h.date}</span>
                      <span>{getCategoryLabel(t, h.category as any)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{h.dentist}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">{t('consultationDetail.actions')}</h3>
            {userRole === 'dentist' ? (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" className="gap-2 justify-start min-w-0" onClick={() => onCopy?.(consultation)}>
                  <Copy className="w-4 h-4 flex-shrink-0" /> {actionText('copyFull', 'copyMed', 'copyShort')}
                </Button>
                <Button variant="secondary" size="sm" className="gap-2 justify-start min-w-0" onClick={() => onNavigate('prescrever')}>
                  <Pill className="w-4 h-4 flex-shrink-0" /> {actionText('prescribeFull', 'prescribeMed', 'prescribeShort')}
                </Button>
                <Button variant="secondary" size="sm" className="gap-2 justify-start min-w-0" onClick={() => onNavigate('conversas')}>
                  <MessageCircle className="w-4 h-4 flex-shrink-0" /> {actionText('messageFull', 'messageMed', 'messageShort')}
                </Button>
                <Button variant="secondary" size="sm" className="gap-2 justify-start min-w-0" onClick={() => onNavigate('referencia')}>
                  <FileText className="w-4 h-4 flex-shrink-0" /> {actionText('recommendFull', 'recommendMed', 'recommendShort')}
                </Button>
                <Button variant="secondary" size="sm" className="gap-2 justify-start min-w-0">
                  <RefreshCw className="w-4 h-4 flex-shrink-0" /> {actionText('rescheduleFull', 'rescheduleMed', 'rescheduleShort')}
                </Button>
                {isBlocked ? (
                  <Button variant="secondary" size="sm" className="gap-2 justify-start text-emerald-400 min-w-0" onClick={handleUnblock}>
                    <Unlock className="w-4 h-4 flex-shrink-0" /> {actionText('unblockFull', 'unblockTablet', 'unblock', 'consultationDetail')}
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="gap-2 justify-start text-destructive min-w-0" onClick={() => setShowBlockModal(true)}>
                    <Ban className="w-4 h-4 flex-shrink-0" /> {actionText('blockFull', 'blockMed', 'blockShort')}
                  </Button>
                )}
                <Button variant="secondary" size="sm" className="gap-2 justify-start min-w-0" onClick={() => onViewDossier(consultation.patient.id)}>
                  <FileText className="w-4 h-4 flex-shrink-0" /> {actionText('dossierFull', 'dossierMed', 'dossierShort')}
                </Button>
                <Button variant="outline" size="sm" className="gap-2 justify-start border-destructive/30 text-destructive hover:bg-destructive/10 min-w-0">
                  <X className="w-4 h-4 flex-shrink-0" /> {actionText('cancelFull', 'cancelMed', 'cancelShort')}
                </Button>
              </div>
            ) : userRole === 'clinic' ? (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" className="gap-2 justify-start min-w-0" onClick={() => onCopy?.(consultation)}>
                  <Copy className="w-4 h-4 flex-shrink-0" /> {actionText('copyFull', 'copyMed', 'copyShort')}
                </Button>
                <Button variant="secondary" size="sm" className="gap-2 justify-start min-w-0" onClick={() => onNavigate('conversas')}>
                  <MessageCircle className="w-4 h-4 flex-shrink-0" /> {actionText('messageFull', 'messageMed', 'messageShort')}
                </Button>
                <Button variant="secondary" size="sm" className="gap-2 justify-start min-w-0">
                  <RefreshCw className="w-4 h-4 flex-shrink-0" /> {actionText('rescheduleFull', 'rescheduleMed', 'rescheduleShort')}
                </Button>
                {isBlocked ? (
                  <Button variant="secondary" size="sm" className="gap-2 justify-start text-emerald-400 min-w-0" onClick={handleUnblock}>
                    <Unlock className="w-4 h-4 flex-shrink-0" /> {actionText('unblockFull', 'unblockTablet', 'unblock', 'consultationDetail')}
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="gap-2 justify-start text-destructive min-w-0" onClick={() => setShowBlockModal(true)}>
                    <Ban className="w-4 h-4 flex-shrink-0" /> {actionText('blockFull', 'blockMed', 'blockShort')}
                  </Button>
                )}
                <Button variant="secondary" size="sm" className="gap-2 justify-start min-w-0" onClick={() => onViewDossier(consultation.patient.id)}>
                  <FileText className="w-4 h-4 flex-shrink-0" /> {actionText('dossierFull', 'dossierMed', 'dossierShort')}
                </Button>
                <Button variant="outline" size="sm" className="gap-2 justify-start border-destructive/30 text-destructive hover:bg-destructive/10 min-w-0">
                  <X className="w-4 h-4 flex-shrink-0" /> {actionText('cancelFull', 'cancelMed', 'cancelShort')}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="gap-2 flex-1" onClick={() => onNavigate('conversas')}>
                  <MessageCircle className="w-4 h-4" /> {t('consultationDetail.message')}
                </Button>
                <Button variant="secondary" size="sm" className="gap-2 flex-1">
                  <RefreshCw className="w-4 h-4" /> {t('consultationDetail.rescheduleAction')}
                </Button>
                <Button variant="outline" size="sm" className="gap-2 flex-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                  <X className="w-4 h-4" /> {t('consultationDetail.cancelAction')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Block Patient Modal */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="sm:max-w-md">
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
              <Button className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={!blockReason.trim()} onClick={handleBlock}>
                {t('consultationDetail.blockConfirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
