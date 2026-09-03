import { useEffect, useState } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  agendaSettingsStore,
  useAgendaSettings,
  DEFAULT_SETTINGS,
  AgendaSettings,
} from '@/stores/agendaSettingsStore';

// Re-export for backwards compatibility with imports across the app.
export { DEFAULT_SETTINGS };
export type { AgendaSettings };

// 12-color preset palette (2 rows × 6) per spec
const COLOR_PRESETS = [
  '#F59E0B', '#A855F7', '#374151', '#EC4899', '#3B82F6', '#84CC16',
  '#10B981', '#6366F1', '#EF4444', '#F97316', '#14B8A6', '#8B5CF6',
];

// Extended category list for the modal — adds Avaliação and Bloqueio/Pausa entries
// (Avaliação is a UI-only category here; Bloqueio is mapped to blockColor.)
type ModalCategoryRow = {
  id: string;
  labelKey?: string;
  fallback: string;
  defaultColor: string;
  isBlock?: boolean;
};
const MODAL_CATEGORIES: ModalCategoryRow[] = [
  { id: 'primeira_consulta', labelKey: 'consultationTypes.firstConsultation', fallback: '1ª Consulta', defaultColor: '#FDD835' },
  { id: 'avaliacao', labelKey: 'consultationTypes.evaluation', fallback: 'Avaliação', defaultColor: '#A855F7' },
  { id: 'destartarizacao', labelKey: 'consultationTypes.scaling', fallback: 'Destartarização', defaultColor: '#9C27B0' },
  { id: 'cirurgia', labelKey: 'consultationTypes.surgery', fallback: 'Cirurgia', defaultColor: '#212121' },
  { id: 'endodontia', labelKey: 'consultationTypes.endodontics', fallback: 'Endodontia', defaultColor: '#E91E63' },
  { id: 'odontopediatria', labelKey: 'consultationTypes.pediatric', fallback: 'Odontopediatria', defaultColor: '#039BE5' },
  { id: 'ortodontia', labelKey: 'consultationTypes.orthodontics', fallback: 'Ortodontia', defaultColor: '#8BC34A' },
  { id: 'protese', labelKey: 'consultationTypes.prosthetics', fallback: 'Prótese', defaultColor: '#2E7D32' },
  { id: 'restauracao', labelKey: 'consultationTypes.restoration', fallback: 'Restauração', defaultColor: '#2196F3' },
  { id: 'urgencia', labelKey: 'consultationTypes.emergency', fallback: 'Urgência', defaultColor: '#F44336' },
  { id: 'teleconsulta', labelKey: 'consultationTypes.teleconsultation', fallback: 'Teleconsulta', defaultColor: '#FF9800' },
  { id: 'bloqueio', fallback: 'Bloqueio/Pausa', defaultColor: '#6B7280', isBlock: true },
];

const tr = (t: (k: string) => string, key: string | undefined, fallback: string) => {
  if (!key) return fallback;
  const v = t(key);
  return v === key ? fallback : v;
};

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90, 120];
const LUNCH_START_OPTIONS = ['12:00', '12:30', '13:00', '13:30'];
const LUNCH_END_OPTIONS = ['13:00', '13:30', '14:00', '14:30'];

interface AgendaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Legacy prop — kept for backwards compatibility but unused. */
  settings?: AgendaSettings;
  /** Legacy prop — kept for backwards compatibility but unused. */
  onSave?: (settings: AgendaSettings) => void;
  userRole: UserRole;
  userPlan?: 'free' | 'pro' | 'premium';
}

export function AgendaSettingsModal({ isOpen, onClose }: AgendaSettingsModalProps) {
  const { t } = useTranslation();
  const live = useAgendaSettings();

  // Snapshot taken when opening so Cancel can revert.
  const [snapshot, setSnapshot] = useState<AgendaSettings | null>(null);

  useEffect(() => {
    if (isOpen && !snapshot) {
      setSnapshot({ ...live, categoryColors: { ...live.categoryColors } });
    }
    if (!isOpen && snapshot) {
      setSnapshot(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const update = <K extends keyof AgendaSettings>(key: K, val: AgendaSettings[K]) => {
    agendaSettingsStore.patch(key, val);
  };
  const setCategoryColor = (cat: string, color: string) => {
    agendaSettingsStore.setCategoryColor(cat, color);
  };

  const handleSave = () => {
    setSnapshot(null);
    toast.success(t('agendaSettings.settingsSaved'));
    onClose();
  };
  const handleCancel = () => {
    if (snapshot) agendaSettingsStore.set(snapshot);
    setSnapshot(null);
    onClose();
  };
  const handleReset = () => {
    agendaSettingsStore.reset();
    toast.info(t('agendaSettings.settingsReset'));
  };

  // Integer-hour options matching the requested ranges (half-hour starts/ends
  // are not supported by the underlying grid which iterates per whole hour).
  const startHourOptions = [7, 8, 9, 10];
  const endHourOptions = [18, 19, 20, 21, 22];
  const slotOptions = [15, 20, 30, 45, 60];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={handleCancel} />
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-card border-l border-border z-[61] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {tr(t, 'agendaSettings.titleV2', 'Configurações da Agenda')}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleCancel} aria-label={t('common.cancel')}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* VISUALIZAÇÃO */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">{t('agendaSettings.visualization')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('agendaSettings.dayStartHour')}</Label>
                <Select value={String(live.startHour)} onValueChange={v => update('startHour', Number(v))}>
                  <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[120]">
                    {startHourOptions.map(h => (
                      <SelectItem key={h} value={String(h)}>{`${h.toString().padStart(2, '0')}:00`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('agendaSettings.dayEndHour')}</Label>
                <Select value={String(live.endHour)} onValueChange={v => update('endHour', Number(v))}>
                  <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[120]">
                    {endHourOptions.map(h => (
                      <SelectItem key={h} value={String(h)}>{`${h.toString().padStart(2, '0')}:00`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('agendaSettings.defaultSlotDuration')}</Label>
                <Select value={String(live.slotDuration)} onValueChange={v => update('slotDuration', Number(v))}>
                  <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[120]">
                    {slotOptions.map(m => (
                      <SelectItem key={m} value={String(m)}>{m === 60 ? '1h' : `${m}min`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('agendaSettings.showFreeSlots')}</Label>
                <Switch checked={live.showFreeSlots} onCheckedChange={v => update('showFreeSlots', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('agendaSettings.showBlocks')}</Label>
                <Switch checked={live.showBlocks} onCheckedChange={v => update('showBlocks', v)} />
              </div>

              {/* Lunch hours */}
              <div className="flex items-center justify-between">
                <Label>{tr(t, 'agendaSettings.lunchStart', 'Início do almoço')}</Label>
                <Select value={live.lunchStart} onValueChange={v => update('lunchStart', v)}>
                  <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[120]">
                    {LUNCH_START_OPTIONS.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>{tr(t, 'agendaSettings.lunchEnd', 'Fim do almoço')}</Label>
                <Select value={live.lunchEnd} onValueChange={v => update('lunchEnd', v)}>
                  <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[120]">
                    {LUNCH_END_OPTIONS.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Visible days of week */}
              <div>
                <Label className="block mb-2">{tr(t, 'agendaSettings.weekDaysVisible', 'Dias visíveis na semana')}</Label>
                <RadioGroup
                  value={live.weekDaysVisible}
                  onValueChange={v => {
                    const val = v as AgendaSettings['weekDaysVisible'];
                    update('weekDaysVisible', val);
                    // Keep showSundays in sync for legacy consumers
                    update('showSundays', val === 'mon-sun');
                  }}
                  className="flex gap-3"
                >
                  <div className="flex items-center gap-1.5"><RadioGroupItem value="mon-fri" id="wd-mf" /><Label htmlFor="wd-mf" className="text-xs">Seg - Sex</Label></div>
                  <div className="flex items-center gap-1.5"><RadioGroupItem value="mon-sat" id="wd-ms" /><Label htmlFor="wd-ms" className="text-xs">Seg - Sáb</Label></div>
                  <div className="flex items-center gap-1.5"><RadioGroupItem value="mon-sun" id="wd-md" /><Label htmlFor="wd-md" className="text-xs">Seg - Dom</Label></div>
                </RadioGroup>
              </div>
            </div>
          </section>

          {/* DENSIDADE */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">{t('agendaSettings.density')}</h3>
            <RadioGroup value={live.density} onValueChange={v => update('density', v as AgendaSettings['density'])} className="space-y-2">
              <div className="flex items-start gap-2">
                <RadioGroupItem value="compact" id="density-compact" className="mt-0.5" />
                <Label htmlFor="density-compact" className="leading-snug">
                  <span className="font-medium">Compacto</span>
                  <span className="block text-[11px] text-muted-foreground font-normal">Dia completo visível sem scroll</span>
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="normal" id="density-normal" className="mt-0.5" />
                <Label htmlFor="density-normal" className="leading-snug">
                  <span className="font-medium">Normal</span>
                  <span className="block text-[11px] text-muted-foreground font-normal">Padrão — scroll para ver o dia inteiro</span>
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="expanded" id="density-expanded" className="mt-0.5" />
                <Label htmlFor="density-expanded" className="leading-snug">
                  <span className="font-medium">Expandido</span>
                  <span className="block text-[11px] text-muted-foreground font-normal">Manhã ou tarde — mais detalhe por consulta</span>
                </Label>
              </div>
            </RadioGroup>
          </section>

          {/* DURAÇÃO PADRÃO POR TIPO */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-1 uppercase tracking-wide">
              {tr(t, 'agendaSettings.defaultDurationByType', 'Duração padrão por tipo')}
            </h3>
            <p className="text-[11px] text-muted-foreground mb-3">
              {tr(t, 'agendaSettings.defaultDurationByTypeHint', 'Duração predefinida ao criar uma nova consulta deste tipo')}
            </p>
            <div className="space-y-2">
              {MODAL_CATEGORIES.filter(c => !c.isBlock).map(cat => {
                const value = live.defaultDurations[cat.id] ?? DEFAULT_SETTINGS.defaultDurations[cat.id] ?? 30;
                return (
                  <div key={cat.id} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{tr(t, cat.labelKey, cat.fallback)}</span>
                    <Select value={String(value)} onValueChange={v => agendaSettingsStore.setDefaultDuration(cat.id, Number(v))}>
                      <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className="z-[120]">
                        {DURATION_OPTIONS.map(m => (
                          <SelectItem key={m} value={String(m)}>{m >= 60 && m % 60 === 0 ? `${m / 60}h` : `${m}min`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CORES POR TIPO DE CONSULTA */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{t('agendaSettings.colorsByType')}</h3>
            </div>
            <div className="space-y-2 mb-4">
              {MODAL_CATEGORIES.map(cat => {
                const isBlock = !!cat.isBlock;
                const color = isBlock
                  ? live.blockColor
                  : (live.categoryColors[cat.id] || cat.defaultColor);
                const setColor = (c: string) =>
                  isBlock ? update('blockColor', c) : setCategoryColor(cat.id, c);
                return (
                  <div key={cat.id} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{tr(t, cat.labelKey, cat.fallback)}</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-md border border-border shadow-sm cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          aria-label={`Edit color for ${tr(t, cat.labelKey, cat.fallback)}`}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-[240px] p-3 z-[120]" align="end">
                        <div className="grid grid-cols-6 gap-2">
                          {COLOR_PRESETS.map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setColor(preset)}
                              className={cn(
                                'relative w-7 h-7 rounded-full border-2 transition-[transform,background-color,border-color,color,box-shadow] hover:scale-110 flex items-center justify-center',
                                color.toLowerCase() === preset.toLowerCase()
                                  ? 'border-primary ring-2 ring-primary/40'
                                  : 'border-border'
                              )}
                              style={{ backgroundColor: preset }}
                              aria-label={preset}
                            >
                              {color.toLowerCase() === preset.toLowerCase() && (
                                <Check className="w-3.5 h-3.5 text-white drop-shadow" strokeWidth={3} />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground flex-1">{t('agendaSettings.rgbColor', { defaultValue: 'Custom' })}</Label>
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border border-border"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> {t('agendaSettings.resetDefault')}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>{t('common.cancel')}</Button>
            <Button size="sm" onClick={handleSave}>{t('common.save')}</Button>
          </div>
        </div>
      </div>
    </>
  );
}
