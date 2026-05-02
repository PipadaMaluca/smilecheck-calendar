import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pill, FileText, FolderOpen, CheckCircle2, X, Clock, ChevronUp } from 'lucide-react';
import { Consultation } from '@/types/calendar';
import { useIsMobile } from '@/hooks/use-mobile';

interface InConsultationModeProps {
  consultation: Consultation | null;
  onEndConsultation: () => void;
  onDismiss: () => void;
  onOpenDossier: (patientId: string) => void;
  onPrescribe: () => void;
  onReferral: () => void;
  onRate: (consultation: Consultation) => void;
}

// Top bar component
export function InConsultationBar({
  consultation,
  elapsedSeconds,
  onDismiss,
  onOpenDossier,
}: {
  consultation: Consultation;
  elapsedSeconds: number;
  onDismiss: () => void;
  onOpenDossier: (patientId: string) => void;
}) {
  const { t } = useTranslation();
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const elapsed = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div
      className="h-10 flex items-center justify-between px-4 cursor-pointer animate-fade-in flex-shrink-0"
      style={{ backgroundColor: 'rgba(27, 94, 32, 0.9)' }}
      onClick={() => onOpenDossier(consultation.patient.id)}
    >
      <div className="flex items-center gap-2 text-white text-sm min-w-0">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
        <span className="font-medium truncate">
          {t('consultationMode.inConsultation')}: {consultation.patient.name} — {consultation.notes || t('consultation.scheduled')} — {consultation.time}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-white/80 text-sm">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono text-xs">{elapsed}</span>
        </div>
        <button
          className="text-white/60 hover:text-white text-xs px-2 py-0.5 rounded border border-white/20 hover:border-white/40 transition-colors"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        >
          {t('consultationMode.postpone')}
        </button>
      </div>
    </div>
  );
}

// FAB component
export function ConsultationFAB({
  consultation,
  onEndConsultation,
  onOpenDossier,
  onPrescribe,
  onReferral,
}: {
  consultation: Consultation;
  onEndConsultation: () => void;
  onOpenDossier: () => void;
  onPrescribe: () => void;
  onReferral: () => void;
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: t('consultationMode.openDossier'), icon: FolderOpen, onClick: onOpenDossier, bg: '#FF9800' },
    { label: t('consultationMode.referralLetter'), icon: FileText, onClick: onReferral, bg: '#9C27B0' },
    { label: t('consultationMode.prescribe'), icon: Pill, onClick: onPrescribe, bg: '#2196F3' },
    { label: t('consultationMode.endConsultation'), icon: CheckCircle2, onClick: onEndConsultation, bg: '#4CAF50' },
  ];

  // Flush bottom-right. On mobile/tablet sit above the bottom nav (~64px); on desktop, 8px from edge.
  return (
    <div
      className="fixed z-40 right-2"
      style={{
        bottom: 'calc(var(--fab-bottom-offset, 8px) + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Action buttons */}
      {isOpen && (
        <div className="absolute bottom-[calc(100%+8px)] right-0 flex flex-col gap-2 animate-fade-in items-end">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-medium shadow-lg transition-all hover:scale-105 whitespace-nowrap min-h-[44px]"
                style={{ backgroundColor: action.bg }}
                onClick={() => { setIsOpen(false); action.onClick(); }}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB — responsive sizing */}
      <button
        className={cn(
          'rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
          'w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14',
          isOpen
            ? 'bg-destructive text-white rotate-45'
            : 'bg-emerald-600 text-white hover:bg-emerald-500'
        )}
        style={{ boxShadow: '0 4px 20px rgba(76,175,80,0.4)' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <ChevronUp className="w-5 h-5 md:w-6 md:h-6" />}
      </button>
    </div>
  );
}

// End consultation confirmation dialog
export function EndConsultationDialog({
  consultation,
  onConfirm,
  onCancel,
}: {
  consultation: Consultation;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-[90%] animate-scale-in space-y-4">
        <h3 className="text-lg font-bold text-foreground">
          {t('consultationMode.endTitle')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('consultationMode.endDescription', { name: consultation.patient.name })}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={onConfirm}>
            {t('consultationMode.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Points earned animation
export function PointsEarnedAnimation({ xp, pts }: { xp: number; pts: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] pointer-events-none flex flex-col items-center gap-1">
      <span className="text-2xl font-bold text-emerald-400 animate-points-float">+{xp} XP</span>
      <span className="text-xl font-bold text-amber-400 animate-points-float" style={{ animationDelay: '0.15s' }}>+{pts} pts</span>
    </div>
  );
}

// Quick star rating after ending consultation
export function QuickRatingPrompt({
  consultation,
  onRate,
  onSkip,
}: {
  consultation: Consultation;
  onRate: (stars: number) => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const [hoveredStar, setHoveredStar] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onSkip} />
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-[90%] animate-scale-in space-y-4 text-center">
        <h3 className="text-lg font-bold text-foreground">
          {t('consultationMode.ratePatient')}
        </h3>
        <p className="text-sm text-muted-foreground">{consultation.patient.name}</p>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={cn(
                'text-3xl transition-transform duration-100',
                (hoveredStar >= star) ? 'scale-110' : 'opacity-40'
              )}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => onRate(star)}
            >
              ⭐
            </button>
          ))}
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground" onClick={onSkip}>
          {t('consultationMode.skipRating')}
        </button>
      </div>
    </div>
  );
}

// Main hook to manage consultation mode state
export function useConsultationMode(consultations: Consultation[]) {
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [endedConsultation, setEndedConsultation] = useState<Consultation | null>(null);

  // Mock: find a consultation at 10:00 for dentist 1
  useEffect(() => {
    if (isDismissed || activeConsultation) return;
    const match = consultations.find(
      (c) => c.time === '10:00' && c.status !== 'visto' && (c.status as string) !== 'cancelada'
    );
    if (match) {
      setActiveConsultation(match);
    }
  }, [consultations, isDismissed, activeConsultation]);

  // Elapsed timer
  useEffect(() => {
    if (!activeConsultation) return;
    // Start at a mock 14:32 (872 seconds)
    setElapsedSeconds(872);
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeConsultation]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    setActiveConsultation(null);
  }, []);

  const requestEnd = useCallback(() => {
    setShowEndDialog(true);
  }, []);

  const confirmEnd = useCallback(() => {
    setShowEndDialog(false);
    setEndedConsultation(activeConsultation);
    setShowPoints(true);
    setTimeout(() => {
      setShowPoints(false);
      setShowRating(true);
    }, 1800);
    setActiveConsultation(null);
  }, [activeConsultation]);

  const cancelEnd = useCallback(() => {
    setShowEndDialog(false);
  }, []);

  const finishRating = useCallback(() => {
    setShowRating(false);
    setEndedConsultation(null);
  }, []);

  return {
    activeConsultation,
    elapsedSeconds,
    isDismissed,
    showEndDialog,
    showPoints,
    showRating,
    endedConsultation,
    dismiss,
    requestEnd,
    confirmEnd,
    cancelEnd,
    finishRating,
  };
}
