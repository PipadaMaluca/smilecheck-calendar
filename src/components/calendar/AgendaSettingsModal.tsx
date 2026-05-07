import { useEffect, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CATEGORY_COLORS, ConsultationCategory, LEGEND_ORDER, UserRole, getCategoryLabel } from '@/types/calendar';
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

// 12-color preset palette (4x3 grid) — 10 category colors + white + black
const COLOR_PRESETS = [
  '#FDD835', '#9C27B0', '#212121', '#E91E63',
  '#039BE5', '#8BC34A', '#2E7D32', '#2196F3',
  '#F44336', '#FF9800', '#FFFFFF', '#000000',
];

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

  const startHourOptions = Array.from({ length: 5 }, (_, i) => 6 + i);
  const endHourOptions = Array.from({ length: 6 }, (_, i) => 17 + i);
  const slotOptions = [15, 30, 45, 60];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={handleCancel} />
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[380px] bg-card border-l border-border z-[61] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{t('agendaSettings.title')}</h2>
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
                <Label>{t('agendaSettings.showSundays')}</Label>
                <Switch checked={live.showSundays} onCheckedChange={v => update('showSundays', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('agendaSettings.dayStartHour')}</Label>
                <Select value={String(live.startHour)} onValueChange={v => update('startHour', Number(v))}>
                  <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
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
                  <SelectContent>
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
                  <SelectContent>
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
            </div>
          </section>

          {/* DENSIDADE */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">{t('agendaSettings.density')}</h3>
            <RadioGroup value={live.density} onValueChange={v => update('density', v as AgendaSettings['density'])} className="space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="compact" id="density-compact" />
                <Label htmlFor="density-compact">{t('agendaSettings.compact')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="normal" id="density-normal" />
                <Label htmlFor="density-normal">{t('agendaSettings.normal')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="expanded" id="density-expanded" />
                <Label htmlFor="density-expanded">{t('agendaSettings.expanded')}</Label>
              </div>
            </RadioGroup>
          </section>

          {/* CORES POR TIPO DE CONSULTA */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{t('agendaSettings.colorsByType')}</h3>
            </div>
            <div className="space-y-2 mb-4">
              {LEGEND_ORDER.map(cat => {
                const defaultColor = CATEGORY_COLORS[cat].hex;
                const color = live.categoryColors[cat] || defaultColor;
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{getCategoryLabel(t, cat)}</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-md border border-border shadow-sm cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          aria-label={`Edit color for ${getCategoryLabel(t, cat)}`}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-3" align="end">
                        <div className="grid grid-cols-4 gap-2">
                          {COLOR_PRESETS.map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setCategoryColor(cat, preset)}
                              className={cn(
                                'w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                                color.toLowerCase() === preset.toLowerCase()
                                  ? 'border-primary ring-2 ring-primary/40'
                                  : 'border-border'
                              )}
                              style={{ backgroundColor: preset }}
                              aria-label={preset}
                            />
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground flex-1">{t('agendaSettings.rgbColor', { defaultValue: 'Custom' })}</Label>
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => setCategoryColor(cat, e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border border-border"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              })}
            </div>

            {/* Block color */}
            <p className="text-xs font-medium text-muted-foreground mb-2">{t('agendaSettings.blockColor')}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">{t('agendaSettings.blocks')}</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-md border border-border shadow-sm cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: live.blockColor }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-3" align="end">
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_PRESETS.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => update('blockColor', preset)}
                        className={cn(
                          'w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                          live.blockColor.toLowerCase() === preset.toLowerCase()
                            ? 'border-primary ring-2 ring-primary/40'
                            : 'border-border'
                        )}
                        style={{ backgroundColor: preset }}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
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
