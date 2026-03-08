import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Video, User, MessageCircle, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Consultation, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_CONFIG, getCategoryBadgeStyle } from '@/types/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { useTeleconsulta } from '@/contexts/TeleconsultaContext';

interface PatientConsultationDetailProps {
  consultation: Consultation;
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_HISTORY = [
  { date: '15 Jan 2026', type: 'Restauração', dentist: 'Dr. Gonçalo Pipo', category: 'restauracao' },
  { date: '02 Dez 2025', type: 'Destartarização', dentist: 'Dr. Alexandre Bernardo', category: 'destartarizacao' },
  { date: '18 Out 2025', type: '1ª Consulta', dentist: 'Dr. Gonçalo Pipo', category: 'primeira_consulta' },
];

const CANCELLATION_REASONS = [
  'Conflito de agenda',
  'Emergência médica/pessoal',
  'Já não preciso desta consulta',
  'Quero reagendar para outra data',
  'Outro motivo',
];

export function PatientConsultationDetail({ consultation, isOpen, onClose }: PatientConsultationDetailProps) {
  const startTeleconsulta = useTeleconsulta();
  const [showHistory, setShowHistory] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [cancelled, setCancelled] = useState(false);

  if (!isOpen) return null;

  const isTeleconsulta = consultation.type === 'teleconsulta';
  const category = consultation.category || 'restauracao';
  const colors = CATEGORY_COLORS[category];
  const categoryLabel = CATEGORY_LABELS[category];
  const status = consultation.status || 'agendada';
  const statusConfig = STATUS_CONFIG[status];

  const handleConfirmCancel = () => {
    setCancelled(true);
    setTimeout(() => {
      setShowCancelModal(false);
      setCancelled(false);
      onClose();
    }, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden pb-[60px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-base font-semibold">Detalhes da Consulta</h2>
          <div className="w-10" />
        </div>

        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-5 space-y-5">
            {/* Header — Dentist info */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <ClickableDentistName name={consultation.dentist.name} className="text-lg font-bold" />
                <p className="text-xs text-muted-foreground">{consultation.dentist.specialty || 'Dentista'}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {colors && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={getCategoryBadgeStyle(colors.hex)}>
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
                    {format(consultation.date, "d MMM yyyy", { locale: pt })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {consultation.time} ({consultation.duration} min)
                  </span>
                </div>
              </div>
            </div>

            {/* Teleconsulta CTA */}
            {isTeleconsulta && (
              <Button
                className="w-full gap-2 bg-[hsl(var(--teleconsulta))] hover:bg-[hsl(var(--teleconsulta))]/90 text-white py-5 text-base font-semibold"
                onClick={() => startTeleconsulta(consultation.dentist.name)}
              >
                <Video className="w-5 h-5" />
                Iniciar Teleconsulta
              </Button>
            )}

            {/* Informações */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Informações</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <ClickableClinicName name={consultation.clinic.name} className="font-semibold" />
                    <span className="text-muted-foreground"> — {consultation.clinic.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>Duração prevista: {consultation.duration} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  {isTeleconsulta ? <Video className="w-4 h-4 text-muted-foreground shrink-0" /> : <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span>{isTeleconsulta ? 'Teleconsulta' : 'Consulta Presencial'}</span>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">💰 Pagamento</span>
              <span className={cn('font-semibold', consultation.isPaid ? 'text-primary' : 'text-yellow-400')}>
                €{consultation.price} {consultation.isPaid ? '(pago)' : '(pendente)'}
              </span>
            </div>

            {/* Triagem */}
            {consultation.triage && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Triagem</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Sintomas:</span> {consultation.triage.symptom}</p>
                  <p><span className="text-muted-foreground">Duração:</span> {consultation.triage.duration}</p>
                  <p><span className="text-muted-foreground">Intensidade da dor:</span> {consultation.triage.intensity}/5</p>
                </div>
              </div>
            )}

            {/* Notas (read-only) */}
            {consultation.notes && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Notas da Consulta</h3>
                <p className="text-sm text-muted-foreground">{consultation.notes}</p>
              </div>
            )}

            {/* Histórico Resumido */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <button className="flex items-center justify-between w-full" onClick={() => setShowHistory(!showHistory)}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Histórico Resumido</h3>
                {showHistory ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {showHistory && (
                <div className="space-y-2">
                  {MOCK_HISTORY.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', CATEGORY_COLORS[h.category as keyof typeof CATEGORY_COLORS]?.bg || 'bg-muted')} />
                        <span className="text-muted-foreground">{h.date}</span>
                        <span>{h.type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{h.dentist}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ações — 3 buttons, equal width */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Ações</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                  <MessageCircle className="w-4 h-4" /> Mensagem
                </Button>
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                  <RefreshCw className="w-4 h-4" /> Reagendar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setShowCancelModal(true)}
                >
                  <X className="w-4 h-4" /> Cancelar
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Cancellation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md z-[70]">
          {cancelled ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">✅</div>
              <p className="text-lg font-semibold">Consulta cancelada com sucesso</p>
              <p className="text-sm text-muted-foreground">Será redirecionado para o início.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Cancelar Consulta</DialogTitle>
                <DialogDescription>
                  Tem a certeza que deseja cancelar esta consulta?
                </DialogDescription>
              </DialogHeader>

              <div className="bg-destructive/10 rounded-lg p-3 text-sm text-destructive flex items-start gap-2">
                <span>⚠️</span>
                <span>Cancelamentos com menos de 24h de antecedência resultam em penalização de pontos.</span>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Motivo da cancelação</Label>
                <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
                  {CANCELLATION_REASONS.map((reason) => (
                    <div key={reason} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason} id={reason} />
                      <Label htmlFor={reason} className="text-sm font-normal cursor-pointer">{reason}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Observações adicionais</Label>
                <Textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Observações adicionais..."
                  className="min-h-[60px] bg-secondary/50 border-border text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCancelModal(false)}>
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={!cancelReason}
                  onClick={handleConfirmCancel}
                >
                  Confirmar Cancelamento
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
