import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, Copy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DayHours {
  day: string;
  open: boolean;
  start: string;
  end: string;
}

const defaultClinicHours: DayHours[] = [
  { day: 'Segunda', open: true, start: '09:00', end: '19:00' },
  { day: 'Terça', open: true, start: '09:00', end: '19:00' },
  { day: 'Quarta', open: true, start: '09:00', end: '19:00' },
  { day: 'Quinta', open: true, start: '09:00', end: '19:00' },
  { day: 'Sexta', open: true, start: '09:00', end: '19:00' },
  { day: 'Sábado', open: true, start: '09:00', end: '13:00' },
  { day: 'Domingo', open: false, start: '', end: '' },
];

interface HolidayClosure {
  id: string;
  date: string;
  endDate?: string;
  name: string;
  type: 'national' | 'custom';
  reason: string;
  openDespite: boolean;
}

const defaultHolidays: HolidayClosure[] = [
  { id: 'h1', date: '01 Jan 2026', name: 'Nouvel An', type: 'national', reason: 'national', openDespite: false },
  { id: 'h2', date: '21 Abr 2026', name: 'Lundi de Pâques', type: 'national', reason: 'national', openDespite: false },
  { id: 'h3', date: '01 Mai 2026', name: 'Fête du Travail', type: 'national', reason: 'national', openDespite: false },
  { id: 'h4', date: '08 Mai 2026', name: 'Victoire 1945', type: 'national', reason: 'national', openDespite: false },
  { id: 'h5', date: '14 Jul 2026', name: 'Fête Nationale', type: 'national', reason: 'national', openDespite: false },
  { id: 'h6', date: '15 Ago 2026', name: 'Assomption', type: 'national', reason: 'national', openDespite: false },
  { id: 'h7', date: '01 Nov 2026', name: 'Toussaint', type: 'national', reason: 'national', openDespite: false },
  { id: 'h8', date: '25 Dez 2026', name: 'Noël', type: 'national', reason: 'national', openDespite: false },
];

const defaultCustomClosures: HolidayClosure[] = [
  { id: 'c1', date: '15 Ago 2026', name: 'Obras', type: 'custom', reason: 'works', openDespite: false },
];

export function ClinicScheduleTab() {
  const { t } = useTranslation();
  const [hours, setHours] = useState<DayHours[]>(defaultClinicHours);
  const [lunchBreak, setLunchBreak] = useState(false);
  const [lunchStart, setLunchStart] = useState('13:00');
  const [lunchEnd, setLunchEnd] = useState('14:00');
  const [simultaneous, setSimultaneous] = useState(3);
  const [simultaneousTele, setSimultaneousTele] = useState(2);
  const [minInterval, setMinInterval] = useState('10');
  const [holidays, setHolidays] = useState<HolidayClosure[]>(defaultHolidays);
  const [customClosures, setCustomClosures] = useState<HolidayClosure[]>(defaultCustomClosures);
  const [nationalHolidaysEnabled, setNationalHolidaysEnabled] = useState(true);
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [closureForm, setClosureForm] = useState<{ name: string; dateStart: string; dateEnd: string; reason: string }>({
    name: '',
    dateStart: '',
    dateEnd: '',
    reason: 'exceptional',
  });

  const dayKeys = [
    'common.weekdays.mon', 'common.weekdays.tue', 'common.weekdays.wed',
    'common.weekdays.thu', 'common.weekdays.fri', 'common.weekdays.sat',
    'common.weekdays.sun'
  ];

  const toggleDay = (idx: number) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, open: !h.open } : h));
  };

  const updateTime = (idx: number, field: 'start' | 'end', value: string) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  const copyMondayToWeekdays = () => {
    const monday = hours[0];
    setHours(prev => prev.map((h, i) =>
      i > 0 && i < 5 ? { ...h, open: monday.open, start: monday.start, end: monday.end } : h
    ));
    toast.success(t('team.schedule.copiedToWeekdays'));
  };

  const toggleOpenDespiteHoliday = (id: string) => {
    setHolidays(prev => prev.map(h =>
      h.id === id ? { ...h, openDespite: !h.openDespite } : h
    ));
  };

  const removeCustomClosure = (id: string) => {
    setCustomClosures(prev => prev.filter(c => c.id !== id));
  };

  const openAddClosure = () => {
    setClosureForm({ name: '', dateStart: '', dateEnd: '', reason: 'exceptional' });
    setClosureModalOpen(true);
  };

  const formatDateLabel = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const saveClosure = () => {
    if (!closureForm.dateStart || !closureForm.name.trim()) return;
    const dateLabel = closureForm.dateEnd && closureForm.dateEnd !== closureForm.dateStart
      ? `${formatDateLabel(closureForm.dateStart)} — ${formatDateLabel(closureForm.dateEnd)}`
      : formatDateLabel(closureForm.dateStart);
    setCustomClosures(prev => [...prev, {
      id: `c-${Date.now()}`,
      date: dateLabel,
      endDate: closureForm.dateEnd || undefined,
      name: closureForm.name.trim(),
      type: 'custom',
      reason: closureForm.reason,
      openDespite: false,
    }]);
    setClosureModalOpen(false);
  };

  const handleSave = () => {
    toast.success(t('team.schedule.savedSuccess'));
  };

  return (
    <div className="space-y-6">
      {/* Section 1 — Operating Hours */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">🕐 {t('team.operatingHours')}</CardTitle>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={copyMondayToWeekdays}>
              <Copy className="w-3 h-3" />
              <span className="hidden sm:inline">{t('team.schedule.copyMondayToWeekdays')}</span>
              <span className="sm:hidden">{t('team.schedule.copyMon')}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Desktop header */}
            <div className="hidden sm:grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>{t('team.day')}</span>
              <span>{t('team.open')}</span>
              <span>{t('team.opening')}</span>
              <span>{t('team.closing')}</span>
            </div>

            {hours.map((h, i) => (
              <div key={h.day} className={cn(
                'grid grid-cols-2 sm:grid-cols-4 gap-2 items-center p-2 rounded-md transition-colors',
                !h.open && 'opacity-50 bg-muted/30',
                h.open && 'bg-accent/5'
              )}>
                <span className="text-sm font-medium">{t(dayKeys[i])}</span>
                <Switch checked={h.open} onCheckedChange={() => toggleDay(i)} />
                {h.open ? (
                  <>
                    <Input type="time" value={h.start} onChange={e => updateTime(i, 'start', e.target.value)} className="h-8 text-xs px-2" />
                    <Input type="time" value={h.end} onChange={e => updateTime(i, 'end', e.target.value)} className="h-8 text-xs px-2" />
                  </>
                ) : (
                  <span className="col-span-2 text-xs text-destructive font-medium">❌ {t('team.closedFem')}</span>
                )}
              </div>
            ))}

            {!hours[6].open && (
              <p className="text-xs text-muted-foreground pl-2">📱 {t('team.teleOnlyOnSunday')}</p>
            )}
          </div>

          {/* Lunch break */}
          <Separator className="my-4" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">🍽️ {t('team.schedule.lunchBreak')}</span>
                <p className="text-xs text-muted-foreground">{t('team.schedule.lunchBreakDesc')}</p>
              </div>
              <Switch checked={lunchBreak} onCheckedChange={setLunchBreak} />
            </div>
            {lunchBreak && (
              <div className="flex items-center gap-2 pl-2">
                <Input type="time" value={lunchStart} onChange={e => setLunchStart(e.target.value)} className="h-8 text-xs px-2 w-28" />
                <span className="text-xs text-muted-foreground">—</span>
                <Input type="time" value={lunchEnd} onChange={e => setLunchEnd(e.target.value)} className="h-8 text-xs px-2 w-28" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Holidays & Closures */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📅 {t('team.holidays')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('team.schedule.nationalHolidaysFr')}</span>
            <Switch checked={nationalHolidaysEnabled} onCheckedChange={setNationalHolidaysEnabled} />
          </div>

          {nationalHolidaysEnabled && (
            <>
              <Separator />
              <div className="space-y-2">
                {holidays.map(h => (
                  <div key={h.id} className="flex items-center justify-between text-sm gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{h.date} — {h.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {h.openDespite ? (
                        <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/30">
                          {t('team.schedule.openDespite')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                          {t('team.encerrada')}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => toggleOpenDespiteHoliday(h.id)}
                      >
                        {h.openDespite ? t('team.schedule.markClosed') : t('team.schedule.markOpen')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('team.customClosures')}</h4>
            {customClosures.map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm gap-2">
                <span>{c.date} — {c.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                    {t('team.encerrada')}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCustomClosure(c.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto" onClick={openAddClosure}>
              <Plus className="w-3 h-3" />{t('team.schedule.addHolidayClosure')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3 — Capacity */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📊 {t('team.capacity')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">{t('team.simultaneousConsults')}</span>
            <Input type="number" min={1} max={10} value={simultaneous} onChange={e => setSimultaneous(+e.target.value)} className="w-20 h-8 text-center px-2" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">{t('team.schedule.simultaneousTele')}</span>
            <Input type="number" min={1} max={10} value={simultaneousTele} onChange={e => setSimultaneousTele(+e.target.value)} className="w-20 h-8 text-center px-2" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">{t('team.schedule.minIntervalBetween')}</span>
            <Select value={minInterval} onValueChange={setMinInterval}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 min</SelectItem>
                <SelectItem value="5">5 min</SelectItem>
                <SelectItem value="10">10 min</SelectItem>
                <SelectItem value="15">15 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button className="gap-2 w-full sm:w-auto" onClick={handleSave}>
        <Save className="w-4 h-4" />{t('team.schedule.saveSchedules')}
      </Button>

      {/* Add Closure Modal */}
      <Dialog open={closureModalOpen} onOpenChange={setClosureModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('team.schedule.modalTitleAdd')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cl-name" className="text-xs">{t('team.schedule.fieldName')}</Label>
              <Input
                id="cl-name"
                value={closureForm.name}
                onChange={e => setClosureForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t('team.schedule.fieldNamePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cl-start" className="text-xs">{t('team.schedule.fieldDateStart')}</Label>
                <Input
                  id="cl-start"
                  type="date"
                  value={closureForm.dateStart}
                  onChange={e => setClosureForm(f => ({ ...f, dateStart: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cl-end" className="text-xs">{t('team.schedule.fieldDateEnd')}</Label>
                <Input
                  id="cl-end"
                  type="date"
                  value={closureForm.dateEnd}
                  onChange={e => setClosureForm(f => ({ ...f, dateEnd: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('team.schedule.fieldReason')}</Label>
              <Select value={closureForm.reason} onValueChange={(v) => setClosureForm(f => ({ ...f, reason: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">{t('team.schedule.reasonNational')}</SelectItem>
                  <SelectItem value="exceptional">{t('team.schedule.reasonExceptional')}</SelectItem>
                  <SelectItem value="works">{t('team.schedule.reasonWorks')}</SelectItem>
                  <SelectItem value="other">{t('team.schedule.reasonOtherClosure')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClosureModalOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={saveClosure} disabled={!closureForm.dateStart || !closureForm.name.trim()}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
