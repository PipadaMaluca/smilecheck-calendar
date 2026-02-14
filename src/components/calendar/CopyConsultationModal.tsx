import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Save, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Consultation, ConsultationCategory, CATEGORY_LABELS } from '@/types/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

interface CopyConsultationModalProps {
  consultation: Consultation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (consultation: Consultation) => void;
  isMobile?: boolean;
}

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
});

const DURATION_OPTIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
  { value: '90', label: '90 min' },
  { value: '120', label: '120 min' },
];

const CONSULTATION_TYPES: { value: ConsultationCategory; label: string }[] = [
  { value: 'restauracao', label: 'Restauração' },
  { value: 'primeira_consulta', label: 'Primeira Consulta' },
  { value: 'destartarizacao', label: 'Destartarização' },
  { value: 'endodontia', label: 'Endodontia' },
  { value: 'cirurgia', label: 'Cirurgia' },
  { value: 'ortodontia', label: 'Ortodontia' },
  { value: 'protese', label: 'Prótese' },
  { value: 'odontopediatria', label: 'Odontopediatria' },
  { value: 'urgencia', label: 'Urgência' },
  { value: 'teleconsulta', label: 'Teleconsulta' },
  { value: 'outro', label: 'Outro' },
];

export function CopyConsultationModal({
  consultation,
  isOpen,
  onClose,
  onSave,
  isMobile = false,
}: CopyConsultationModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [category, setCategory] = useState<ConsultationCategory>('restauracao');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (consultation) {
      setSelectedDate(undefined);
      setSelectedTime('');
      setDuration(consultation.duration.toString());
      setCategory(consultation.category || 'restauracao');
      setNotes(consultation.notes || '');
    }
  }, [consultation]);

  if (!isOpen || !consultation) return null;

  const handleSave = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Selecione a data e hora para a nova consulta.');
      return;
    }
    if (onSave) {
      onSave({
        ...consultation,
        id: `copy-${Date.now()}`,
        date: selectedDate,
        time: selectedTime,
        duration: parseInt(duration),
        category,
        type: category === 'teleconsulta' ? 'teleconsulta' : 'presencial',
        notes,
        status: 'agendada',
      });
    }
    toast.success('Consulta copiada com sucesso!');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={onClose} />
      <div className={cn(
        'bg-card flex flex-col',
        isMobile
          ? 'fixed inset-x-0 bottom-0 rounded-t-2xl max-h-[90vh] animate-slide-up-modal z-50'
          : 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl w-[95%] max-w-lg max-h-[90vh] z-50'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Copiar Consulta</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Patient Info (read-only) */}
          <div className="bg-secondary/30 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">{consultation.patient.name}</p>
                <p className="text-xs text-muted-foreground">
                  {consultation.dentist.name} • {consultation.clinic.name}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* New Date */}
          <div className="space-y-2">
            <Label>Nova Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "d 'de' MMMM yyyy", { locale: pt })
                    : <span className="text-muted-foreground">Selecionar data</span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* New Time */}
          <div className="space-y-2">
            <Label>Nova Hora *</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-full">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Selecionar hora" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-60">
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duração</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {DURATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Tipo de Consulta</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ConsultationCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {CONSULTATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              placeholder="Notas sobre a consulta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Alterações
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
