import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Copy, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleRow {
  day: string;
  dayKey: string;
  active: boolean;
  morningStart: string;
  morningEnd: string;
  breakStart: string;
  breakEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
}

const defaultSchedule: ScheduleRow[] = [
  { day: 'Segunda', dayKey: 'common.weekdays.mon', active: true, morningStart: '09:00', morningEnd: '13:00', breakStart: '13:00', breakEnd: '14:00', afternoonStart: '14:00', afternoonEnd: '19:00' },
  { day: 'Terça', dayKey: 'common.weekdays.tue', active: true, morningStart: '09:00', morningEnd: '13:00', breakStart: '13:00', breakEnd: '14:00', afternoonStart: '14:00', afternoonEnd: '19:00' },
  { day: 'Quarta', dayKey: 'common.weekdays.wed', active: true, morningStart: '09:00', morningEnd: '13:00', breakStart: '', breakEnd: '', afternoonStart: '', afternoonEnd: '' },
  { day: 'Quinta', dayKey: 'common.weekdays.thu', active: true, morningStart: '09:00', morningEnd: '13:00', breakStart: '13:00', breakEnd: '14:00', afternoonStart: '14:00', afternoonEnd: '19:00' },
  { day: 'Sexta', dayKey: 'common.weekdays.fri', active: true, morningStart: '09:00', morningEnd: '13:00', breakStart: '13:00', breakEnd: '14:00', afternoonStart: '14:00', afternoonEnd: '19:00' },
  { day: 'Sábado', dayKey: 'common.weekdays.sat', active: false, morningStart: '', morningEnd: '', breakStart: '', breakEnd: '', afternoonStart: '', afternoonEnd: '' },
  { day: 'Domingo', dayKey: 'common.weekdays.sun', active: false, morningStart: '', morningEnd: '', breakStart: '', breakEnd: '', afternoonStart: '', afternoonEnd: '' },
];

interface AvailabilitySectionProps {
  dentistName?: string;
  showSaveButton?: boolean;
}

export function AvailabilitySection({ dentistName, showSaveButton = true }: AvailabilitySectionProps) {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [consultDuration, setConsultDuration] = useState('30');
  const [teleDuration, setTeleDuration] = useState('30');
  const [minInterval, setMinInterval] = useState('5');
  const [teleEnabled, setTeleEnabled] = useState(true);
  const [teleOutsideHours, setTeleOutsideHours] = useState(false);
  const [teleSunday, setTeleSunday] = useState(false);
  const [maxTelePerDay, setMaxTelePerDay] = useState(5);

  const toggleDay = (idx: number) => {
    setSchedule((prev) => prev.map((s, i) => i === idx ? { ...s, active: !s.active } : s));
  };

  const copyToAll = () => {
    const first = schedule.find((s) => s.active);
    if (!first) return;
    setSchedule((prev) => prev.map((s) => s.active ? { ...s, ...first, day: s.day, dayKey: s.dayKey } : s));
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">🕐 {t('team.weeklySchedule')}</CardTitle>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={copyToAll}>
              <Copy className="w-3 h-3" />{t('team.copyToAll')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden lg:grid grid-cols-8 gap-1 text-[11px] font-medium text-muted-foreground px-1 mb-1">
            <span>{t('team.day')}</span><span>{t('team.active') || 'Active'}</span><span>{t('team.morningStart')}</span><span>{t('team.morningEnd')}</span>
            <span>{t('team.breakStart')}</span><span>{t('team.breakEnd')}</span><span>{t('team.afternoonStart')}</span><span>{t('team.afternoonEnd')}</span>
          </div>
          <div className="space-y-2">
            {schedule.map((s, i) => (
              <div key={s.day} className={cn('grid grid-cols-2 lg:grid-cols-8 gap-1 items-center p-2 rounded-md', !s.active && 'opacity-40')}>
                <span className="text-sm font-medium">{t(s.dayKey)}</span>
                <Switch checked={s.active} onCheckedChange={() => toggleDay(i)} />
                {s.active ? (
                  <>
                    <Input type="time" value={s.morningStart} className="h-7 text-xs px-1 col-span-1" readOnly />
                    <Input type="time" value={s.morningEnd} className="h-7 text-xs px-1" readOnly />
                    <Input type="time" value={s.breakStart} className="h-7 text-xs px-1" readOnly placeholder="—" />
                    <Input type="time" value={s.breakEnd} className="h-7 text-xs px-1" readOnly placeholder="—" />
                    <Input type="time" value={s.afternoonStart} className="h-7 text-xs px-1" readOnly placeholder="—" />
                    <Input type="time" value={s.afternoonEnd} className="h-7 text-xs px-1" readOnly placeholder="—" />
                  </>
                ) : (
                  <span className="col-span-6 text-xs text-muted-foreground">—</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">⏱️ {t('team.defaultDuration')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('team.inPersonConsult')}</span>
            <Select value={consultDuration} onValueChange={setConsultDuration}>
              <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{['15', '30', '45', '60'].map((v) => <SelectItem key={v} value={v}>{v} min</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('team.teleconsult')}</span>
            <Select value={teleDuration} onValueChange={setTeleDuration}>
              <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{['15', '30', '45'].map((v) => <SelectItem key={v} value={v}>{v} min</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('team.minInterval')}</span>
            <Select value={minInterval} onValueChange={setMinInterval}>
              <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{['0', '5', '10', '15'].map((v) => <SelectItem key={v} value={v}>{v} min</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📱 {t('agenda.teleconsultation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('team.availableForTeleconsult')}</span>
            <Switch checked={teleEnabled} onCheckedChange={setTeleEnabled} />
          </div>
          {teleEnabled && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('team.outsideClinicHours')}</span>
                <Switch checked={teleOutsideHours} onCheckedChange={setTeleOutsideHours} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('team.teleconsultOnSunday')}</span>
                <Switch checked={teleSunday} onCheckedChange={setTeleSunday} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('team.maxTeleconsultPerDay')}</span>
                <Input type="number" min={1} max={20} value={maxTelePerDay} onChange={(e) => setMaxTelePerDay(+e.target.value)} className="w-20 h-8 text-center px-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🚫 {t('team.exceptions')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>25 Dez 2026 — {t('team.unavailable')}</span>
            <Badge variant="outline" className="text-[11px] bg-destructive/10 text-destructive border-destructive/30">❌</Badge>
          </div>
          <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
            <Plus className="w-3 h-3" />{t('team.addException')}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">✈️ {t('team.vacation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-primary" />
              15 Jul — 31 Jul 2026 (17 {t('points.days')})
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 text-xs">{t('common.edit')}</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t('team.autoReschedule')}</p>
          <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
            <Plus className="w-3 h-3" />{t('team.addVacation')}
          </Button>
        </CardContent>
      </Card>

      {showSaveButton && (
        <Button className="gap-2 w-full sm:w-auto">
          <Save className="w-4 h-4" />{t('team.save')}
        </Button>
      )}
    </div>
  );
}
