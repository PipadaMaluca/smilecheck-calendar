import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Plus, Trash2, Save, Calendar, Video, Plane, GraduationCap, User, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TimeSlot {
  active: boolean;
  start: string;
  end: string;
}

interface DaySchedule {
  dayKey: string;
  morning: TimeSlot;
  afternoon: TimeSlot;
  evening: TimeSlot; // teleconsultations
}

interface ExceptionItem {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  reasonKey: string;
  note?: string;
}

const clinics = [
  { id: '1', name: 'Clínica SmileCheck' },
  { id: '2', name: 'Clínica Mitry-Mory' },
  { id: '3', name: 'Clínica Montfermeil' },
];

const defaultWeek: DaySchedule[] = [
  { dayKey: 'common.weekdays.mon', morning: { active: true, start: '09:00', end: '13:00' }, afternoon: { active: true, start: '14:00', end: '19:00' }, evening: { active: true, start: '19:00', end: '21:30' } },
  { dayKey: 'common.weekdays.tue', morning: { active: true, start: '09:00', end: '13:00' }, afternoon: { active: true, start: '14:00', end: '19:00' }, evening: { active: true, start: '19:00', end: '21:30' } },
  { dayKey: 'common.weekdays.wed', morning: { active: true, start: '09:00', end: '13:00' }, afternoon: { active: false, start: '', end: '' }, evening: { active: true, start: '19:00', end: '21:30' } },
  { dayKey: 'common.weekdays.thu', morning: { active: true, start: '09:00', end: '13:00' }, afternoon: { active: true, start: '14:00', end: '19:00' }, evening: { active: true, start: '19:00', end: '21:30' } },
  { dayKey: 'common.weekdays.fri', morning: { active: true, start: '09:00', end: '13:00' }, afternoon: { active: true, start: '14:00', end: '19:00' }, evening: { active: false, start: '', end: '' } },
  { dayKey: 'common.weekdays.sat', morning: { active: false, start: '', end: '' }, afternoon: { active: false, start: '', end: '' }, evening: { active: false, start: '', end: '' } },
  { dayKey: 'common.weekdays.sun', morning: { active: false, start: '', end: '' }, afternoon: { active: false, start: '', end: '' }, evening: { active: false, start: '', end: '' } },
];

const mockExceptions: ExceptionItem[] = [
  { id: '1', startDate: '2026-08-15', endDate: '2026-08-22', reason: 'Férias', reasonKey: 'availability.reasonHoliday', note: '' },
  { id: '2', startDate: '2026-09-03', endDate: '2026-09-03', reason: 'Formação', reasonKey: 'availability.reasonTraining', note: 'Congresso Lisboa' },
];

export function DentistAvailabilityTab() {
  const { t } = useTranslation();
  const [selectedClinic, setSelectedClinic] = useState('1');
  const [applyToAll, setApplyToAll] = useState(false);
  const [week, setWeek] = useState<DaySchedule[]>(defaultWeek);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(mockExceptions);
  const [teleEnabled, setTeleEnabled] = useState(true);
  const [maxTelePerDay, setMaxTelePerDay] = useState(4);
  const [editingCell, setEditingCell] = useState<{ day: number; period: 'morning' | 'afternoon' | 'evening'; field: 'start' | 'end' } | null>(null);

  const togglePeriod = (dayIdx: number, period: 'morning' | 'afternoon' | 'evening') => {
    setWeek(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      const slot = d[period];
      const defaults: Record<string, { start: string; end: string }> = {
        morning: { start: '09:00', end: '13:00' },
        afternoon: { start: '14:00', end: '19:00' },
        evening: { start: '19:00', end: '21:30' },
      };
      return {
        ...d,
        [period]: slot.active
          ? { active: false, start: '', end: '' }
          : { active: true, ...defaults[period] }
      };
    }));
  };

  const updateTime = (dayIdx: number, period: 'morning' | 'afternoon' | 'evening', field: 'start' | 'end', value: string) => {
    setWeek(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      return { ...d, [period]: { ...d[period], [field]: value } };
    }));
  };

  const deleteException = (id: string) => {
    setExceptions(prev => prev.filter(e => e.id !== id));
  };

  const handleSave = () => {
    toast.success(t('availability.savedSuccess'));
  };

  const isDayOff = (day: DaySchedule) => !day.morning.active && !day.afternoon.active && !day.evening.active;

  const reasonIcon = (key: string) => {
    if (key.includes('Holiday')) return <Plane className="w-4 h-4 text-primary" />;
    if (key.includes('Training')) return <GraduationCap className="w-4 h-4 text-amber-400" />;
    if (key.includes('Personal')) return <User className="w-4 h-4 text-muted-foreground" />;
    return <MoreHorizontal className="w-4 h-4 text-muted-foreground" />;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderTimeCell = (dayIdx: number, period: 'morning' | 'afternoon' | 'evening', slot: TimeSlot) => {
    if (!slot.active) {
      return (
        <button
          onClick={() => togglePeriod(dayIdx, period)}
          className="flex items-center justify-center gap-1 text-xs text-destructive/70 bg-destructive/10 rounded-md px-2 py-2 hover:bg-destructive/20 transition-colors min-h-[44px] w-full"
        >
          ❌ {t('team.closed')}
        </button>
      );
    }

    const isEditing = editingCell?.day === dayIdx && editingCell?.period === period;

    if (isEditing) {
      return (
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1">
            <input
              type="time"
              value={slot.start}
              onChange={(e) => updateTime(dayIdx, period, 'start', e.target.value)}
              className="h-7 text-xs bg-background border border-input rounded px-1 w-full"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <input
              type="time"
              value={slot.end}
              onChange={(e) => updateTime(dayIdx, period, 'end', e.target.value)}
              className="h-7 text-xs bg-background border border-input rounded px-1 w-full"
            />
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-6 text-[10px] flex-1" onClick={() => setEditingCell(null)}>
              ✓
            </Button>
            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive flex-1" onClick={() => togglePeriod(dayIdx, period)}>
              ✕
            </Button>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={() => setEditingCell({ day: dayIdx, period, field: 'start' })}
        className={cn(
          'flex items-center justify-center gap-1 text-xs font-medium rounded-md px-2 py-2 transition-colors min-h-[44px] w-full',
          period === 'evening'
            ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
        )}
      >
        {slot.start}-{slot.end}
        <Pencil className="w-3 h-3 opacity-50" />
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Clinic Selector */}
      <Card className="border-border/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">{t('availability.selectClinic')}</label>
              <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="applyAll"
                checked={applyToAll}
                onCheckedChange={(v) => setApplyToAll(v === true)}
              />
              <label htmlFor="applyAll" className="text-sm cursor-pointer">
                {t('availability.applyToAll')}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Grid */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🗓️ {t('team.weeklySchedule')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-4 gap-2 text-[11px] font-medium text-muted-foreground mb-2 px-1">
            <span>{t('team.day')}</span>
            <span className="text-center">☀️ {t('availability.morning')}</span>
            <span className="text-center">🌤️ {t('availability.afternoon')}</span>
            <span className="text-center">🌙 {t('availability.eveningTele')}</span>
          </div>

          <div className="space-y-2">
            {week.map((day, idx) => {
              const off = isDayOff(day);
              return (
                <div
                  key={day.dayKey}
                  className={cn(
                    'grid grid-cols-1 sm:grid-cols-4 gap-2 items-center p-2 rounded-lg transition-colors',
                    off ? 'bg-destructive/5 opacity-60' : 'bg-card/50'
                  )}
                >
                  {/* Day name */}
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <span className={cn('text-sm font-semibold', off && 'text-destructive/70')}>
                      {t(day.dayKey)}
                    </span>
                    {off && (
                      <Badge variant="outline" className="text-[9px] bg-destructive/10 text-destructive border-destructive/30 sm:ml-2">
                        {t('team.closed')}
                      </Badge>
                    )}
                  </div>

                  {/* Mobile: label + cell per period */}
                  <div className="sm:hidden space-y-2">
                    {(['morning', 'afternoon', 'evening'] as const).map(period => (
                      <div key={period} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-16 flex-shrink-0">
                          {period === 'morning' ? `☀️ ${t('availability.morning')}` :
                           period === 'afternoon' ? `🌤️ ${t('availability.afternoon')}` :
                           `🌙 ${t('availability.eveningShort')}`}
                        </span>
                        <div className="flex-1">
                          {renderTimeCell(idx, period, day[period])}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: cells inline */}
                  <div className="hidden sm:block">{renderTimeCell(idx, 'morning', day.morning)}</div>
                  <div className="hidden sm:block">{renderTimeCell(idx, 'afternoon', day.afternoon)}</div>
                  <div className="hidden sm:block">{renderTimeCell(idx, 'evening', day.evening)}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Exceptions & Holidays */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">📅 {t('availability.exceptionsTitle')}</CardTitle>
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Plus className="w-3 h-3" />{t('availability.addException')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {exceptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('availability.noExceptions')}</p>
          ) : (
            exceptions.map(ex => (
              <div key={ex.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/30">
                <div className="flex items-center gap-3">
                  {reasonIcon(ex.reasonKey)}
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(ex.startDate)}
                      {ex.startDate !== ex.endDate && ` — ${formatDate(ex.endDate)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(ex.reasonKey)}
                      {ex.note && ` (${ex.note})`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">{t('common.edit')}</Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive" onClick={() => deleteException(ex.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Teleconsultation Availability */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📱 {t('availability.teleAvailability')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('team.availableForTeleconsult')}</span>
            <Switch checked={teleEnabled} onCheckedChange={setTeleEnabled} />
          </div>
          {teleEnabled && (
            <>
              <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <p className="text-xs text-orange-400">
                  <Video className="w-3.5 h-3.5 inline mr-1" />
                  {t('availability.teleScheduleNote')}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('team.maxTeleconsultPerDay')}</span>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={maxTelePerDay}
                  onChange={(e) => setMaxTelePerDay(+e.target.value)}
                  className="w-20 h-8 text-center px-2"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button className="gap-2 w-full sm:w-auto" onClick={handleSave}>
        <Save className="w-4 h-4" />{t('availability.saveChanges')}
      </Button>
    </div>
  );
}
