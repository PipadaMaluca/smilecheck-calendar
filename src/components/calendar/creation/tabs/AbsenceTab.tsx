import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockClinics } from '@/data/mockData';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const FREE_COLORS = ['#9E9E9E'];
const PRO_COLORS = ['#9E9E9E', '#F44336', '#FF9800', '#FDD835', '#4CAF50', '#2196F3', '#3F51B5', '#9C27B0', '#000000', '#FFFFFF'];

const timeOptions: string[] = [];
for (let h = 6; h <= 22; h++) {
  timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
  if (h < 22) timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
}

function getNextTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  if (m === 30) return `${(h + 1).toString().padStart(2, '0')}:00`;
  return `${h.toString().padStart(2, '0')}:30`;
}

interface Props {
  initialDate: Date;
  initialTime: string;
  dentistKey?: string;
  dentistName?: string;
  userRole: UserRole;
  onClose: () => void;
}

export function AbsenceTab({ initialDate, initialTime, dentistKey, dentistName, userRole, onClose }: Props) {
  const { t } = useTranslation();
  const [selectedAgendas, setSelectedAgendas] = useState<string[]>(dentistKey ? [dentistKey] : ['1-1']);
  const [startDate, setStartDate] = useState<Date>(initialDate);
  const [startTime, setStartTime] = useState(initialTime);
  const [endDate, setEndDate] = useState<Date>(initialDate);
  const [endTime, setEndTime] = useState(getNextTime(initialTime));
  const [fullDay, setFullDay] = useState(false);
  const [repeat, setRepeat] = useState<'yes' | 'no'>('no');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [repeatUntil, setRepeatUntil] = useState<Date>(new Date(2026, 2, 31));
  const [repeatCount, setRepeatCount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState('#9E9E9E');

  const WEEKDAYS = [
    t('creationTabs.weekdaysSeg'), t('creationTabs.weekdaysTer'), t('creationTabs.weekdaysQua'),
    t('creationTabs.weekdaysQui'), t('creationTabs.weekdaysSex'), t('creationTabs.weekdaysSab'),
    t('creationTabs.weekdaysDom')
  ];

  const QUICK_REASONS = [
    t('creationTabs.meeting'), t('creationTabs.vacation'), t('creationTabs.training'),
    t('creationTabs.break'), t('creationTabs.personal')
  ];

  const agendaOptions = mockClinics.flatMap(clinic =>
    mockDentists.slice(0, 3).map(d => ({
      key: `${clinic.id}-${d.id}`,
      label: `${d.name} (${clinic.name.replace('Clínica ', '')})`,
    }))
  );

  const toggleAgenda = (key: string) => {
    setSelectedAgendas(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const colors = PRO_COLORS;

  const handleCreate = () => {
    if (userRole === 'dentist' && !reason.trim()) {
      toast.error(t('creationTabs.reasonRequired'));
      return;
    }
    toast.success(t('creationTabs.absenceCreated'));
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <div className="max-w-[600px] mx-auto space-y-5">
          {/* Agendas */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.agendas')}</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {agendaOptions.map(a => (
                <label key={a.key} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted/20 rounded cursor-pointer">
                  <Checkbox
                    checked={selectedAgendas.includes(a.key)}
                    onCheckedChange={() => toggleAgenda(a.key)}
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </section>

          {/* Schedule */}
          <section className="bg-card rounded-xl p-4 border border-border space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">{t('creationTabs.schedule')}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Checkbox checked={fullDay} onCheckedChange={v => setFullDay(!!v)} id="fullday" />
              <Label htmlFor="fullday" className="text-xs">{t('creationTabs.fullDay')}</Label>
            </div>
            {!fullDay && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t('creationTabs.startDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs mt-1">
                          {format(startDate, 'dd/MM/yyyy', { locale: pt })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={startDate} onSelect={d => d && setStartDate(d)} className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-xs">{t('creationTabs.startTime')}</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-48">
                        {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t('creationTabs.endDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs mt-1">
                          {format(endDate, 'dd/MM/yyyy', { locale: pt })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={endDate} onSelect={d => d && setEndDate(d)} className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-xs">{t('creationTabs.endTime')}</Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-48">
                        {timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Repeat */}
          <section className="bg-card rounded-xl p-4 border border-border space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">{t('creationTabs.repeat')}</h3>
            <div className="flex gap-3">
              <Button variant={repeat === 'yes' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setRepeat('yes')}>{t('creationTabs.yes')}</Button>
              <Button variant={repeat === 'no' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setRepeat('no')}>{t('creationTabs.no')}</Button>
            </div>
            {repeat === 'yes' && (
              <div className="space-y-3 border-l-2 border-primary/20 pl-3 ml-1">
                <div>
                  <Label className="text-xs">{t('creationTabs.frequency')}</Label>
                  <Select value={frequency} onValueChange={v => setFrequency(v as typeof frequency)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t('creationTabs.daily')}</SelectItem>
                      <SelectItem value="weekly">{t('creationTabs.weekly')}</SelectItem>
                      <SelectItem value="monthly">{t('creationTabs.monthly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {frequency === 'weekly' && (
                  <div>
                    <Label className="text-xs mb-1 block">{t('creationTabs.weekdays')}</Label>
                    <div className="flex gap-1">
                      {WEEKDAYS.map((day, idx) => (
                        <Button
                          key={day}
                          variant={weekdays.includes(idx) ? 'default' : 'outline'}
                          size="sm"
                          className="text-[11px] h-7 w-8 p-0"
                          onClick={() => setWeekdays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx])}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs">{t('creationTabs.until')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs mt-1">
                        {format(repeatUntil, 'dd/MM/yyyy', { locale: pt })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={repeatUntil} onSelect={d => d && setRepeatUntil(d)} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </section>

          {/* Reason */}
          <section className="bg-card rounded-xl p-4 border border-border space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">
              {t('creationTabs.reason')} {userRole === 'dentist' && <span className="text-destructive">*</span>}
            </h3>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t('creationTabs.absenceReason')}
              className="text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_REASONS.map(r => (
                <Button key={r} variant={reason === r ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setReason(r)}>
                  {r}
                </Button>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.notes')}</h3>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('creationTabs.notes')} rows={3} className="text-sm" />
          </section>

          {/* Color */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.blockColor')}</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                    selectedColor === color ? 'border-primary scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <Check className={cn('w-4 h-4', color === '#FFFFFF' || color === '#FDD835' ? 'text-black' : 'text-white')} />}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">{t('creationTabs.planColorNote')}</p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card px-4 py-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>{t('creationTabs.cancel')}</Button>
        <Button size="sm" onClick={handleCreate}>{t('creationTabs.createAbsence')}</Button>
      </div>
    </div>
  );
}