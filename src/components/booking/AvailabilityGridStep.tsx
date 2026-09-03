import { Fragment, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, ChevronDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface SelectedSlot {
  date: Date;
  time: string;
  key: string; // `${yyyy-mm-dd}_${time}`
}

export interface WaitingPreferences {
  enabled: boolean;
  periods: ('morning' | 'afternoon')[];
  days: number[]; // 1..6 (Mon..Sat)
  urgency: 'normal' | 'urgent';
  observation: string;
}

interface Props {
  slotMinutes?: number; // default 30
  consultationType: 'presencial' | 'teleconsulta' | null;
  selectedSlots: SelectedSlot[];
  onSelectedSlotsChange: (s: SelectedSlot[]) => void;
  preferences: WaitingPreferences;
  onPreferencesChange: (p: WaitingPreferences) => void;
  /** Real occupancy (`yyyy-mm-dd_HH:MM` keys) for authenticated users. When
   *  omitted, the deterministic mock occupancy is used (demo mode). */
  occupiedKeys?: Set<string>;
}

const HOURS_START = 8;
const HOURS_END = 20; // exclusive 20:00 not generated, last 19:30
const LUNCH_START = '13:00';
const LUNCH_END = '14:00';

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const day = out.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  out.setDate(out.getDate() + diff);
  out.setHours(0, 0, 0, 0);
  return out;
}

function fmtKey(date: Date, time: string) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}_${time}`;
}

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Deterministic mock occupancy per (dayIndex, time)
function isOccupied(dayIdx: number, time: string): boolean {
  // Day-specific load: Mon busier, Fri lighter
  const loads = [0.75, 0.65, 0.6, 0.55, 0.4, 0.5]; // Mon-Sat
  // Hash time into a 0..1 pseudo
  const [h, m] = time.split(':').map(Number);
  const seed = (h * 7 + m / 5 + dayIdx * 13) % 11;
  const norm = seed / 11;
  return norm < loads[dayIdx];
}

function generateTimes(slotMin: number): string[] {
  const out: string[] = [];
  for (let h = HOURS_START; h < HOURS_END; h++) {
    for (let m = 0; m < 60; m += slotMin) {
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return out;
}

export function AvailabilityGridStep({
  slotMinutes = 30,
  consultationType,
  selectedSlots,
  onSelectedSlotsChange,
  preferences,
  onPreferencesChange,
  occupiedKeys,
}: Props) {
  const isMobile = useIsMobile();
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(today));
  const [mobileDayIdx, setMobileDayIdx] = useState(0);

  const times = useMemo(() => generateTimes(slotMinutes), [slotMinutes]);
  const days = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const weekLabel = `${days[0].getDate()} - ${days[5].getDate()} ${MONTH_SHORT[days[5].getMonth()]} ${days[5].getFullYear()}`;

  const selectedKeys = useMemo(() => new Set(selectedSlots.map(s => s.key)), [selectedSlots]);

  const toggleSlot = (date: Date, time: string) => {
    const key = fmtKey(date, time);
    if (selectedKeys.has(key)) {
      onSelectedSlotsChange(selectedSlots.filter(s => s.key !== key));
    } else {
      onSelectedSlotsChange([...selectedSlots, { date: new Date(date), time, key }]);
    }
  };

  const isLunch = (time: string) => time >= LUNCH_START && time < LUNCH_END;

  const renderSlotCell = (dayIdx: number, date: Date, time: string) => {
    if (isLunch(time)) {
      return (
        <div className="h-9 rounded-md bg-muted/40 border border-border/30 flex items-center justify-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          {time === LUNCH_START ? 'Almoço' : ''}
        </div>
      );
    }
    // Past slots
    const slotDate = new Date(date);
    const [hh, mm] = time.split(':').map(Number);
    slotDate.setHours(hh, mm, 0, 0);
    const past = slotDate.getTime() < Date.now();
    if (past) {
      return <div className="h-9 rounded-md bg-muted/30 border border-border/20" />;
    }
    const key = fmtKey(date, time);
    const occupied = occupiedKeys ? occupiedKeys.has(key) : isOccupied(dayIdx, time);
    const selected = selectedKeys.has(key);

    if (occupied) {
      return (
        <div
          title="Horário indisponível"
          className="h-9 rounded-md bg-red-500/10 border border-red-500/20 cursor-not-allowed"
        />
      );
    }
    if (selected) {
      return (
        <button
          onClick={() => toggleSlot(date, time)}
          className="h-9 w-full rounded-md bg-[#2196F3] border border-[#2196F3] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-transform hover:scale-[1.02]"
        >
          <Check className="w-3 h-3" />
          {time}
        </button>
      );
    }
    return (
      <button
        onClick={() => toggleSlot(date, time)}
        className="h-9 w-full rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-success text-[11px] font-semibold transition-[transform,background-color,border-color,color,box-shadow] hover:bg-emerald-500/25 hover:brightness-110"
      >
        {time}
      </button>
    );
  };

  const periodToggle = (p: 'morning' | 'afternoon') => {
    const has = preferences.periods.includes(p);
    onPreferencesChange({
      ...preferences,
      periods: has ? preferences.periods.filter(x => x !== p) : [...preferences.periods, p],
    });
  };

  const dayToggle = (d: number) => {
    const has = preferences.days.includes(d);
    onPreferencesChange({
      ...preferences,
      days: has ? preferences.days.filter(x => x !== d) : [...preferences.days, d],
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Week navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() - 7);
            setWeekStart(d);
          }}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Semana anterior</span>
        </Button>
        <div className="text-sm font-semibold text-foreground">{weekLabel}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + 7);
            setWeekStart(d);
          }}
        >
          <span className="hidden sm:inline">Semana seguinte</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" /> Disponível</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/15 border border-red-500/30" /> Ocupado</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#2196F3]" /> Selecionado</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted/60 border border-border" /> Indisponível</span>
      </div>

      {/* Grid */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Day tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => setMobileDayIdx(i)}
                className={cn(
                  'flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors',
                  mobileDayIdx === i
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-foreground border-border'
                )}
              >
                {DAY_LABELS[i]} {d.getDate()}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {times.map(time => (
              <div key={time} className="flex flex-col gap-0.5">
                {renderSlotCell(mobileDayIdx, days[mobileDayIdx], time)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="grid" style={{ gridTemplateColumns: '56px repeat(6, 1fr)' }}>
            <div className="bg-secondary/50 border-b border-border" />
            {days.map((d, i) => (
              <div key={i} className="bg-secondary/50 border-b border-l border-border px-2 py-2 text-center">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase">{DAY_LABELS[i]}</div>
                <div className="text-sm font-bold text-foreground">{d.getDate()}</div>
              </div>
            ))}
            {times.map(time => (
              <Fragment key={time}>
                <div className="text-[11px] text-muted-foreground text-right pr-1.5 py-1 border-b border-border/40 flex items-start justify-end">
                  {time.endsWith(':00') ? time : ''}
                </div>
                {days.map((date, dIdx) => (
                  <div key={`${time}-${dIdx}`} className="border-l border-b border-border/40 p-0.5">
                    {renderSlotCell(dIdx, date, time)}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <span className="font-bold text-primary">{selectedSlots.length}</span> horário{selectedSlots.length === 1 ? '' : 's'} selecionado{selectedSlots.length === 1 ? '' : 's'}
        </span>
        {selectedSlots.length > 0 && (
          <button
            onClick={() => onSelectedSlotsChange([])}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Limpar seleção
          </button>
        )}
      </div>

      {/* Waiting list preferences */}
      <div className="border border-border rounded-xl bg-secondary/30 overflow-hidden">
        <button
          onClick={() => onPreferencesChange({ ...preferences, enabled: !preferences.enabled })}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Preferências adicionais (Lista de Espera)</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Caso nenhum horário lhe convenha, indique preferências gerais e será contactado quando houver disponibilidade
            </p>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-2', preferences.enabled && 'rotate-180')} />
        </button>

        {preferences.enabled && (
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-fade-in">
            {/* Period */}
            <div>
              <Label className="text-xs font-semibold text-foreground mb-2 block">Preferência de período</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer press">
                  <Checkbox checked={preferences.periods.includes('morning')} onCheckedChange={() => periodToggle('morning')} />
                  <span className="text-xs text-foreground">Manhã (08:00-13:00)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer press">
                  <Checkbox checked={preferences.periods.includes('afternoon')} onCheckedChange={() => periodToggle('afternoon')} />
                  <span className="text-xs text-foreground">Tarde (14:00-20:00)</span>
                </label>
              </div>
            </div>

            {/* Days */}
            <div>
              <Label className="text-xs font-semibold text-foreground mb-2 block">Preferência de dia da semana</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, idx) => {
                  const dayNum = idx + 1;
                  const selected = preferences.days.includes(dayNum);
                  return (
                    <button
                      key={label}
                      onClick={() => dayToggle(dayNum)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
                        selected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/50'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <Label className="text-xs font-semibold text-foreground mb-2 block">Urgência</Label>
              <RadioGroup
                value={preferences.urgency}
                onValueChange={(v) => onPreferencesChange({ ...preferences, urgency: v as 'normal' | 'urgent' })}
                className="space-y-1.5"
              >
                <label className="flex items-center gap-2 cursor-pointer press">
                  <RadioGroupItem value="normal" id="urg-normal" />
                  <span className="text-xs text-foreground">Normal (contactar quando disponível)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer press">
                  <RadioGroupItem value="urgent" id="urg-urgent" />
                  <span className="text-xs text-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                    Urgente (primeira vaga possível)
                  </span>
                </label>
              </RadioGroup>
            </div>

            {/* Observation */}
            <div>
              <Label className="text-xs font-semibold text-foreground mb-2 block">Observações</Label>
              <Textarea
                value={preferences.observation}
                onChange={(e) => onPreferencesChange({ ...preferences, observation: e.target.value.slice(0, 500) })}
                placeholder="Ex: Dor no dente 46 há 3 dias, prefiro início da manhã, tenho disponibilidade imediata..."
                rows={3}
                className="resize-none text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1 text-right">
                {preferences.observation.length}/500
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
