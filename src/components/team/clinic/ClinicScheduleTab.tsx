import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save } from 'lucide-react';
import { clinicHours, holidays, customClosures } from '../shared/teamMockData';
import { cn } from '@/lib/utils';

export function ClinicScheduleTab() {
  const { t } = useTranslation();
  const [hours, setHours] = useState(clinicHours);
  const [simultaneous, setSimultaneous] = useState(3);
  const [waitingRoom, setWaitingRoom] = useState(8);

  const dayKeys = ['common.weekdays.mon', 'common.weekdays.tue', 'common.weekdays.wed', 'common.weekdays.thu', 'common.weekdays.fri', 'common.weekdays.sat', 'common.weekdays.sun'];

  const toggleDay = (idx: number) => {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, open: !h.open } : h));
  };

  const updateTime = (idx: number, field: 'start' | 'end', value: string) => {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🕐 {t('team.operatingHours')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>{t('team.day')}</span><span>{t('team.open')}</span><span>{t('team.opening')}</span><span>{t('team.closing')}</span>
            </div>
            {hours.map((h, i) => (
              <div key={h.day} className={cn('grid grid-cols-2 sm:grid-cols-4 gap-2 items-center p-2 rounded-md', !h.open && 'opacity-50')}>
                <span className="text-sm font-medium">{t(dayKeys[i])}</span>
                <Switch checked={h.open} onCheckedChange={() => toggleDay(i)} />
                {h.open ? (
                  <>
                    <Input type="time" value={h.start} onChange={(e) => updateTime(i, 'start', e.target.value)} className="h-8 text-xs px-2" />
                    <Input type="time" value={h.end} onChange={(e) => updateTime(i, 'end', e.target.value)} className="h-8 text-xs px-2" />
                  </>
                ) : (
                  <span className="col-span-2 text-xs text-muted-foreground">{t('team.closedFem')}</span>
                )}
              </div>
            ))}
            {!hours[6].open && (
              <p className="text-xs text-muted-foreground pl-2">📱 {t('team.teleOnlyOnSunday')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📅 {t('team.holidays')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('team.nationalHolidays')}</span>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="space-y-2">
            {holidays.map((h) => (
              <div key={h.date} className="flex items-center justify-between text-sm">
                <span>{h.date} — {h.name}</span>
                <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">{t('team.encerrada')}</Badge>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('team.customClosures')}</h4>
            {customClosures.map((c) => (
              <div key={c.date} className="flex items-center justify-between text-sm">
                <span>{c.date} — {c.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">{t('team.encerrada')}</Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
              <Plus className="w-3 h-3" />{t('team.addClosure')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📊 {t('team.capacity')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('team.simultaneousConsults')}</span>
            <Input type="number" min={1} max={10} value={simultaneous} onChange={(e) => setSimultaneous(+e.target.value)} className="w-20 h-8 text-center px-2" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('team.waitingRoomCapacity')}</span>
            <Input type="number" min={1} max={30} value={waitingRoom} onChange={(e) => setWaitingRoom(+e.target.value)} className="w-20 h-8 text-center px-2" />
          </div>
        </CardContent>
      </Card>

      <Button className="gap-2 w-full sm:w-auto">
        <Save className="w-4 h-4" />{t('team.save')}
      </Button>
    </div>
  );
}
