import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { UserRole } from '@/types/calendar';
import { ConsultationReasonSelector } from '../ConsultationReasonSelector';
import { mockDentists, mockClinics } from '@/data/mockData';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const PRO_COLORS = ['#9E9E9E', '#F44336', '#FF9800', '#FDD835', '#4CAF50', '#2196F3', '#3F51B5', '#9C27B0', '#000000', '#FFFFFF'];

const timeOptions: string[] = [];
for (let h = 6; h <= 22; h++) {
  timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
  if (h < 22) timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
}

interface Props {
  initialDate: Date;
  initialTime: string;
  dentistKey?: string;
  dentistName?: string;
  userRole: UserRole;
  onClose: () => void;
}

export function ExceptionalOpeningTab({ initialDate, initialTime, dentistKey, dentistName, userRole, onClose }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4CAF50');
  const [selectedAgenda, setSelectedAgenda] = useState(dentistKey || '1-1');
  const [date, setDate] = useState<Date>(initialDate);
  const [startTime, setStartTime] = useState(initialTime);
  const [endTime, setEndTime] = useState(() => {
    const [h, m] = initialTime.split(':').map(Number);
    const newH = m === 30 ? h + 1 : h;
    const newM = m === 30 ? '00' : '30';
    return `${newH.toString().padStart(2, '0')}:${newM}`;
  });
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const agendaOptions = mockClinics.flatMap(clinic =>
    mockDentists.slice(0, 3).map(d => ({
      key: `${clinic.id}-${d.id}`,
      label: `${d.name} (${clinic.name.replace('Clínica ', '')})`,
    }))
  );

  const colors = PRO_COLORS;

  const toggleReason = (item: string) => {
    setSelectedReasons(prev =>
      prev.includes(item) ? prev.filter(r => r !== item) : [...prev, item]
    );
  };

  const isValid = title.trim() !== '' && selectedReasons.length > 0;

  const handleCreate = () => {
    if (!isValid) { toast.error(t('creationTabs.fillTitleError')); return; }
    toast.success(t('creationTabs.exceptionalCreated'));
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <div className="max-w-[600px] mx-auto space-y-5">
          {/* Title */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.title')}</h3>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('creationTabs.titlePlaceholder')}
              className="text-sm"
            />
          </section>

          {/* Color */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.bandColor')}</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-[transform,background-color,border-color,color,box-shadow]',
                    selectedColor === color ? 'border-primary scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <Check className={cn('w-4 h-4', color === '#FFFFFF' || color === '#FDD835' ? 'text-black' : 'text-white')} />}
                </button>
              ))}
            </div>
          </section>

          {/* Agenda */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.agenda')}</h3>
            <Select value={selectedAgenda} onValueChange={setSelectedAgenda}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {agendaOptions.map(a => (
                  <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* Schedule */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.schedule')}</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">{t('creationTabs.date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs mt-1">
                      {format(date, 'dd/MM/yyyy', { locale: pt })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={d => d && setDate(d)} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t('creationTabs.startHour')}</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-48">
                      {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t('creationTabs.endHour')}</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-48">
                      {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          {/* Consultation Reasons */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.allowedReasons')}</h3>
            <ConsultationReasonSelector
              value=""
              onChange={() => {}}
              asCheckboxList
              selectedItems={selectedReasons}
              onToggleItem={toggleReason}
            />
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card px-4 py-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>{t('creationTabs.cancel')}</Button>
        <Button size="sm" disabled={!isValid} onClick={handleCreate}>{t('creationTabs.createOpening')}</Button>
      </div>
    </div>
  );
}