import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save, Copy, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleRow {
  day: string;
  active: boolean;
  morningStart: string;
  morningEnd: string;
  breakStart: string;
  breakEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
}

const defaultSchedule: ScheduleRow[] = [
  { day: 'Segunda', active: true, morningStart: '09:00', morningEnd: '13:00', breakStart: '13:00', breakEnd: '14:00', afternoonStart: '14:00', afternoonEnd: '19:00' },
  { day: 'Terça', active: true, morningStart: '09:00', morningEnd: '13:00', breakStart: '13:00', breakEnd: '14:00', afternoonStart: '14:00', afternoonEnd: '19:00' },
  { day: 'Quarta', active: true, morningStart: '09:00', morningEnd: '13:00', breakStart: '', breakEnd: '', afternoonStart: '', afternoonEnd: '' },
  { day: 'Quinta', active: true, morningStart: '09:00', morningEnd: '13:00', breakStart: '13:00', breakEnd: '14:00', afternoonStart: '14:00', afternoonEnd: '19:00' },
  { day: 'Sexta', active: true, morningStart: '09:00', morningEnd: '13:00', breakStart: '13:00', breakEnd: '14:00', afternoonStart: '14:00', afternoonEnd: '19:00' },
  { day: 'Sábado', active: false, morningStart: '', morningEnd: '', breakStart: '', breakEnd: '', afternoonStart: '', afternoonEnd: '' },
  { day: 'Domingo', active: false, morningStart: '', morningEnd: '', breakStart: '', breakEnd: '', afternoonStart: '', afternoonEnd: '' },
];

interface AvailabilitySectionProps {
  dentistName?: string;
  showSaveButton?: boolean;
}

export function AvailabilitySection({ dentistName, showSaveButton = true }: AvailabilitySectionProps) {
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
    setSchedule((prev) => prev.map((s) => s.active ? { ...s, ...first, day: s.day } : s));
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Weekly Schedule */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">🕐 Horário Semanal</CardTitle>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={copyToAll}>
              <Copy className="w-3 h-3" />Copiar para todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-8 gap-1 text-[10px] font-medium text-muted-foreground px-1 mb-1">
            <span>Dia</span><span>Ativo</span><span>Manhã início</span><span>Manhã fim</span>
            <span>Pausa início</span><span>Pausa fim</span><span>Tarde início</span><span>Tarde fim</span>
          </div>
          <div className="space-y-2">
            {schedule.map((s, i) => (
              <div key={s.day} className={cn(
                'grid grid-cols-2 lg:grid-cols-8 gap-1 items-center p-2 rounded-md',
                !s.active && 'opacity-40'
              )}>
                <span className="text-sm font-medium">{s.day}</span>
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

      {/* Section 2: Default Durations */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">⏱️ Duração Padrão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Consulta presencial</span>
            <Select value={consultDuration} onValueChange={setConsultDuration}>
              <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['15', '30', '45', '60'].map((v) => <SelectItem key={v} value={v}>{v} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Teleconsulta</span>
            <Select value={teleDuration} onValueChange={setTeleDuration}>
              <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['15', '30', '45'].map((v) => <SelectItem key={v} value={v}>{v} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Intervalo mínimo</span>
            <Select value={minInterval} onValueChange={setMinInterval}>
              <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['0', '5', '10', '15'].map((v) => <SelectItem key={v} value={v}>{v} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Teleconsultas */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📱 Teleconsultas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Disponível para teleconsultas</span>
            <Switch checked={teleEnabled} onCheckedChange={setTeleEnabled} />
          </div>
          {teleEnabled && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm">Fora do horário clínico</span>
                <Switch checked={teleOutsideHours} onCheckedChange={setTeleOutsideHours} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Teleconsultas ao domingo</span>
                <Switch checked={teleSunday} onCheckedChange={setTeleSunday} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Máx. teleconsultas/dia</span>
                <Input
                  type="number" min={1} max={20} value={maxTelePerDay}
                  onChange={(e) => setMaxTelePerDay(+e.target.value)}
                  className="w-20 h-8 text-center px-2"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Exceptions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🚫 Exceções e Bloqueios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>25 Dez 2026 — Feriado — Indisponível</span>
            <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">❌</Badge>
          </div>
          <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
            <Plus className="w-3 h-3" />Adicionar exceção
          </Button>
        </CardContent>
      </Card>

      {/* Section 5: Vacations */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">✈️ Férias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-primary" />
              15 Jul — 31 Jul 2026 (17 dias)
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 text-xs">Editar</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Consultas serão automaticamente reagendadas ou canceladas</p>
          <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
            <Plus className="w-3 h-3" />Adicionar férias
          </Button>
        </CardContent>
      </Card>

      {showSaveButton && (
        <Button className="gap-2 w-full sm:w-auto">
          <Save className="w-4 h-4" />Guardar
        </Button>
      )}
    </div>
  );
}
