import { useState } from 'react';
import { X, Video, MapPin, Calendar, Clock, User, Phone, Star, Mail, MessageCircle, FileText, RefreshCw, Check, Edit, Copy, Ban, Unlock, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Consultation, UserRole } from '@/types/calendar';
import { ConsultationExportDropdown } from '@/components/export/ConsultationExportDropdown';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DesktopConsultationDetailProps {
  consultation: Consultation | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
  onNavigate?: (tab: string) => void;
  onCopy?: (consultation: Consultation) => void;
  onViewDossier?: (patientId: string) => void;
}

export function DesktopConsultationDetail({
  consultation,
  isOpen,
  onClose,
  userRole = 'dentist',
  onNavigate,
  onCopy,
  onViewDossier,
}: DesktopConsultationDetailProps) {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  if (!isOpen || !consultation) return null;

  const isTeleconsulta = consultation.type === 'teleconsulta';
  const isDentist = userRole === 'dentist';
  const isClinic = userRole === 'clinic';

  const handleBlock = () => {
    setIsBlocked(true);
    setShowBlockModal(false);
    setBlockReason('');
    toast.success(`Paciente bloqueado com sucesso`);
  };

  const handleUnblock = () => {
    setIsBlocked(false);
    toast.success(`Paciente desbloqueado`);
  };

  const renderActions = () => {
    if (isDentist) {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onCopy?.(consultation)}>
              <Copy className="w-3 h-3" /> Copiar Consulta
            </Button>
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onNavigate?.('prescrever')}>
              <Pill className="w-3 h-3" /> Prescrever Receita
            </Button>
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onNavigate?.('conversas')}>
              <MessageCircle className="w-3 h-3" /> Enviar Mensagem
            </Button>
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onNavigate?.('referencia')}>
              <FileText className="w-3 h-3" /> Recomendar Paciente
            </Button>
            <Button variant="outline" className="gap-2 text-xs justify-start">
              <RefreshCw className="w-3 h-3" /> Reagendar Consulta
            </Button>
            {isBlocked ? (
              <Button variant="outline" className="gap-2 text-xs justify-start text-emerald-400 border-emerald-500/30" onClick={handleUnblock}>
                <Unlock className="w-3 h-3" /> Desbloquear
              </Button>
            ) : (
              <Button variant="outline" className="gap-2 text-xs justify-start text-destructive border-destructive/30" onClick={() => setShowBlockModal(true)}>
                <Ban className="w-3 h-3" /> Bloquear Paciente
              </Button>
            )}
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onViewDossier?.(consultation.patient.id)}>
              <FileText className="w-3 h-3" /> Ver Dossier
            </Button>
            <Button variant="outline" className="gap-2 text-xs justify-start border-destructive/30 text-destructive hover:bg-destructive/10">
              <X className="w-3 h-3" /> Cancelar Consulta
            </Button>
          </div>
        </div>
      );
    }

    if (isClinic) {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onCopy?.(consultation)}>
              <Copy className="w-3 h-3" /> Copiar Consulta
            </Button>
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onNavigate?.('conversas')}>
              <MessageCircle className="w-3 h-3" /> Enviar Mensagem
            </Button>
            <Button variant="outline" className="gap-2 text-xs justify-start">
              <RefreshCw className="w-3 h-3" /> Reagendar Consulta
            </Button>
            {isBlocked ? (
              <Button variant="outline" className="gap-2 text-xs justify-start text-emerald-400 border-emerald-500/30" onClick={handleUnblock}>
                <Unlock className="w-3 h-3" /> Desbloquear
              </Button>
            ) : (
              <Button variant="outline" className="gap-2 text-xs justify-start text-destructive border-destructive/30" onClick={() => setShowBlockModal(true)}>
                <Ban className="w-3 h-3" /> Bloquear Paciente
              </Button>
            )}
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onViewDossier?.(consultation.patient.id)}>
              <FileText className="w-3 h-3" /> Ver Dossier
            </Button>
            <Button variant="outline" className="gap-2 text-xs justify-start border-destructive/30 text-destructive hover:bg-destructive/10">
              <X className="w-3 h-3" /> Cancelar Consulta
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-card border-l border-border z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Detalhes da Consulta</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">
                {format(consultation.date, "EEEE, d MMMM yyyy", { locale: pt })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>
                {consultation.time} - {(() => {
                  const [h, m] = consultation.time.split(':').map(Number);
                  const endDate = new Date();
                  endDate.setHours(h, m + consultation.duration);
                  return format(endDate, 'HH:mm');
                })()} ({consultation.duration} min)
              </span>
            </div>
          </div>

          <Separator />

          {/* Patient Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
              Paciente
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-semibold uppercase">{consultation.patient.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{consultation.patient.rating}</span>
                  <span className="text-primary">| {consultation.patient.level}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{consultation.patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span>{consultation.patient.name.toLowerCase().replace(' ', '.')}@email.com</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Consultation Type */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Motivo
            </h3>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  isTeleconsulta ? 'bg-orange-500/20' : 'bg-blue-500/20'
                )}
              >
                {isTeleconsulta ? (
                  <Video className="w-4 h-4 text-orange-400" />
                ) : (
                  <MapPin className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <span className="text-sm">
                {isTeleconsulta ? 'Teleconsulta' : 'Consulta Presencial'}
              </span>
            </div>
          </div>

          {/* Triage Info */}
          {consultation.triage && (
            <>
              <Separator />
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  Triagem
                </h3>
                <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                  <p className="text-sm">{consultation.triage.symptom}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>⏱️ {consultation.triage.duration}</span>
                    <span>😰 Intensidade: {consultation.triage.intensity}/5</span>
                    <span>📷 {consultation.triage.photos} fotos</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Export */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Exportar
            </h3>
            <ConsultationExportDropdown consultation={consultation} />
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Notas
            </h3>
            <div className="bg-secondary/30 rounded-lg p-3 min-h-[80px]">
              <p className="text-sm text-muted-foreground italic">
                {consultation.notes || 'Sem notas adicionadas.'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Payment */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pagamento</span>
            <span
              className={cn(
                'font-semibold',
                consultation.isPaid ? 'text-primary' : 'text-yellow-400'
              )}
            >
              €{consultation.price}{' '}
              {consultation.isPaid
                ? `(pago via ${consultation.paymentMethod})`
                : '(pendente)'}
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-border space-y-3">
          {renderActions()}

          {isTeleconsulta && (
            <Button className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white">
              <Video className="w-4 h-4" />
              Iniciar Teleconsulta
            </Button>
          )}

          <Button variant="secondary" className="w-full gap-2">
            <Check className="w-4 h-4" />
            Marcar como Concluída
          </Button>
        </div>
      </div>

      {/* Block Patient Modal */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="sm:max-w-md z-[70]">
          <DialogHeader>
            <DialogTitle>⚠️ Bloquear {consultation.patient.name}?</DialogTitle>
            <DialogDescription>
              Este paciente não poderá agendar consultas consigo. Poderá continuar a marcar com outros dentistas da mesma clínica.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Motivo (obrigatório)</label>
              <Textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Indique o motivo do bloqueio..."
                className="mt-1 min-h-[80px] bg-secondary/50 border-border text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">A clínica será notificada deste bloqueio.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowBlockModal(false)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" disabled={!blockReason.trim()} onClick={handleBlock}>Bloquear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
