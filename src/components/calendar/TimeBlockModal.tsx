import { useState } from 'react';
import { X, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

export interface TimeBlock {
  id: string;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  reason: string;
  dentistKey?: string;
  isClinicWide?: boolean;
  repeat?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    until: Date;
  };
}

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: TimeBlock) => void;
  userRole: UserRole;
  initialDate?: Date;
  initialTime?: string;
  editingBlock?: TimeBlock | null;
}

const QUICK_REASONS = ['Reunião', 'Férias', 'Formação', 'Pausa', 'Pessoal'];

const timeOptions: string[] = [];
for (let h = 6; h <= 22; h++) {
  timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
  if (h < 22) timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
}

export function TimeBlockModal({ isOpen, onClose, onSave, userRole, initialDate, initialTime, editingBlock }: TimeBlockModalProps) {
  const [startDate, setStartDate] = useState<Date>(editingBlock?.startDate || initialDate || new Date(2026, 0, 31));
  const [startTime, setStartTime] = useState(editingBlock?.startTime || initialTime || '13:00');
  const [endDate, setEndDate] = useState<Date>(editingBlock?.endDate || initialDate || new Date(2026, 0, 31));
  const [endTime, setEndTime] = useState(editingBlock?.endTime || initialTime ? getNextTime(initialTime || '13:00') : '14:00');
  const [reason, setReason] = useState(editingBlock?.reason || '');
  const [isRepeat, setIsRepeat] = useState(!!editingBlock?.repeat);
  const [repeatFreq, setRepeatFreq] = useState<'daily' | 'weekly' | 'monthly'>(editingBlock?.repeat?.frequency || 'weekly');
  const [repeatUntil, setRepeatUntil] = useState<Date>(editingBlock?.repeat?.until || new Date(2026, 2, 31));
  const [isClinicWide, setIsClinicWide] = useState(editingBlock?.isClinicWide || false);

  if (!isOpen) return null;

  const isEditing = !!editingBlock;
  const reasonRequired = userRole === 'dentist';

  function getNextTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    if (m === 30) return `${(h + 1).toString().padStart(2, '0')}:00`;
    return `${h.toString().padStart(2, '0')}:30`;
  }

  const handleSave = () => {
    if (reasonRequired && !reason.trim()) {
      toast.error('O motivo é obrigatório');
      return;
    }

    const block: TimeBlock = {
      id: editingBlock?.id || `block-${Date.now()}`,
      startDate,
      startTime,
      endDate,
      endTime,
      reason: reason.trim() || 'Bloqueio',
      isClinicWide: userRole === 'clinic' ? isClinicWide : false,
      ...(isRepeat && {
        repeat: {
          frequency: repeatFreq,
          until: repeatUntil,
        }
      }),
    };

    onSave(block);
    toast.success(isEditing ? 'Bloqueio atualizado' : 'Bloqueio criado');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[70]" onClick={onClose} />
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">
              {isEditing ? 'Editar Bloqueio' : 'Novo Bloqueio'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Date/Time Row: Start */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Data início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      {format(startDate, 'dd/MM/yyyy', { locale: pt })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={d => d && setStartDate(d)}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Hora início</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {timeOptions.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date/Time Row: End */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Data fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      {format(endDate, 'dd/MM/yyyy', { locale: pt })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={d => d && setEndDate(d)}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Hora fim</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {timeOptions.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <Label className="text-xs mb-1 block">
                Motivo {reasonRequired && <span className="text-destructive">*</span>}
              </Label>
              <Input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={reasonRequired ? 'Motivo obrigatório...' : 'Motivo opcional...'}
                className="text-sm"
              />
            </div>

            {/* Quick Reasons */}
            <div className="flex flex-wrap gap-2">
              {QUICK_REASONS.map(r => (
                <Button
                  key={r}
                  variant={reason === r ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setReason(r)}
                >
                  {r}
                </Button>
              ))}
            </div>

            {/* Clinic-wide (clinic only) */}
            {userRole === 'clinic' && (
              <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                <div>
                  <Label className="text-xs font-medium">Bloqueio geral (toda a clínica)</Label>
                  <p className="text-[10px] text-muted-foreground">Aplica a todos os dentistas</p>
                </div>
                <Switch checked={isClinicWide} onCheckedChange={setIsClinicWide} />
              </div>
            )}

            {/* Repeat */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-muted-foreground" />
                  <Label>Repetir</Label>
                </div>
                <Switch checked={isRepeat} onCheckedChange={setIsRepeat} />
              </div>

              {isRepeat && (
                <div className="ml-6 space-y-3 border-l-2 border-primary/20 pl-3">
                  <div>
                    <Label className="text-xs mb-1 block">Frequência</Label>
                    <Select value={repeatFreq} onValueChange={v => setRepeatFreq(v as typeof repeatFreq)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Até</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                          {format(repeatUntil, 'dd/MM/yyyy', { locale: pt })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={repeatUntil}
                          onSelect={d => d && setRepeatUntil(d)}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" onClick={handleSave}>
              {isEditing ? 'Guardar' : 'Criar Bloqueio'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

interface TimeBlockDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteSingle: () => void;
  onDeleteAll: () => void;
  isRecurring: boolean;
}

export function TimeBlockDeleteConfirm({ isOpen, onClose, onDeleteSingle, onDeleteAll, isRecurring }: TimeBlockDeleteConfirmProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[80]" onClick={onClose} />
      <div className="fixed inset-0 z-[81] flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground">Eliminar Bloqueio</h3>
          <p className="text-sm text-muted-foreground">Tem a certeza que deseja eliminar este bloqueio?</p>
          <div className="flex flex-col gap-2">
            <Button variant="destructive" size="sm" onClick={() => { onDeleteSingle(); onClose(); }}>
              {isRecurring ? 'Eliminar apenas este' : 'Eliminar'}
            </Button>
            {isRecurring && (
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={() => { onDeleteAll(); onClose(); }}>
                Eliminar todos
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          </div>
        </div>
      </div>
    </>
  );
}
