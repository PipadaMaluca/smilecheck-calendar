import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Star, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Consultation, ConsultationCategory } from '@/types/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EditConsultationModalProps {
  consultation: Consultation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (consultation: Consultation) => void;
  onCancel?: (consultation: Consultation) => void;
  isMobile?: boolean;
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
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
  { value: 'protese', label: 'Prótese' },
  { value: 'urgencia', label: 'Urgência' },
  { value: 'teleconsulta', label: 'Teleconsulta' },
  { value: 'outro', label: 'Outro' },
];

export function EditConsultationModal({
  consultation,
  isOpen,
  onClose,
  onSave,
  onCancel,
  isMobile = false,
}: EditConsultationModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState('30');
  const [category, setCategory] = useState<ConsultationCategory>('restauracao');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (consultation) {
      setSelectedDate(consultation.date);
      setSelectedTime(consultation.time);
      setDuration(consultation.duration.toString());
      setCategory(consultation.category || (consultation.type === 'teleconsulta' ? 'teleconsulta' : 'restauracao'));
      setNotes(consultation.notes || '');
    }
  }, [consultation]);

  if (!isOpen || !consultation) return null;

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...consultation,
        date: selectedDate,
        time: selectedTime,
        duration: parseInt(duration),
        category,
        type: category === 'teleconsulta' ? 'teleconsulta' : 'presencial',
        notes,
      });
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(consultation);
    }
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden pb-[60px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-base font-semibold">Detalhes da Consulta</h2>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Patient Info (read-only) */}
        <div className="bg-secondary/30 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{consultation.patient.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-3 h-3 text-yellow-400" />
                <span>{consultation.patient.rating}</span>
                <span className="text-primary">| {consultation.patient.level}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span>{consultation.patient.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Date Picker */}
        <div className="space-y-2">
          <Label>Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {format(selectedDate, "d 'de' MMMM yyyy", { locale: pt })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Picker */}
        <div className="space-y-2">
          <Label>Hora</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="w-full">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Selecionar hora" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border max-h-60">
              {TIME_SLOTS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label>Duração</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecionar duração" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {DURATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Consultation Type */}
        <div className="space-y-2">
          <Label>Tipo de Consulta</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as ConsultationCategory)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {CONSULTATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notas (opcional)</Label>
          <Textarea
            placeholder="Adicionar notas sobre a consulta..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar Consulta
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Alterações
          </Button>
        </div>
      </div>
    </div>
  );

  return modalContent;
}