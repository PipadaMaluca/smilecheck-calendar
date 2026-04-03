import { useState } from 'react';
import { X, RotateCcw, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { CATEGORY_COLORS, CATEGORY_LABELS, ConsultationCategory, LEGEND_ORDER, UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface AgendaSettings {
  showSundays: boolean;
  startHour: number;
  endHour: number;
  slotDuration: number;
  showFreeSlots: boolean;
  showBlocks: boolean;
  density: 'compact' | 'normal' | 'expanded';
  categoryColors: Record<string, string>;
  blockColor: string;
}

export const DEFAULT_SETTINGS: AgendaSettings = {
  showSundays: false,
  startHour: 8,
  endHour: 20,
  slotDuration: 30,
  showFreeSlots: true,
  showBlocks: true,
  density: 'normal',
  categoryColors: Object.fromEntries(
    Object.entries(CATEGORY_COLORS).map(([k, v]) => [k, v.hex])
  ),
  blockColor: '#9E9E9E',
};

// Plan-based color palettes
const PRO_PALETTE = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#9E9E9E', '#000000', '#FFFFFF',
];

interface AgendaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AgendaSettings;
  onSave: (settings: AgendaSettings) => void;
  userRole: UserRole;
  userPlan?: 'free' | 'pro' | 'premium';
}

export function AgendaSettingsModal({ isOpen, onClose, settings, onSave, userRole, userPlan = 'free' }: AgendaSettingsModalProps) {
  const { t } = useTranslation();
  const [local, setLocal] = useState<AgendaSettings>({ ...settings });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });

  if (!isOpen) return null;

  const canEditColors = userPlan === 'pro' || userPlan === 'premium';
  const hasPremiumPicker = userPlan === 'premium';

  const update = <K extends keyof AgendaSettings>(key: K, val: AgendaSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: val }));
  };

  const setCategoryColor = (cat: string, color: string) => {
    setLocal(prev => ({
      ...prev,
      categoryColors: { ...prev.categoryColors, [cat]: color }
    }));
  };

  const openRgbPicker = (cat: string) => {
    const hex = local.categoryColors[cat] || CATEGORY_COLORS[cat as ConsultationCategory]?.hex || '#3B82F6';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    setRgbValues({ r, g, b });
    setEditingCategory(cat);
  };

  const rgbToHex = (r: number, g: number, b: number) =>
    '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

  const applyRgb = () => {
    if (editingCategory) {
      setCategoryColor(editingCategory, rgbToHex(rgbValues.r, rgbValues.g, rgbValues.b));
      setEditingCategory(null);
    }
  };

  const handleSave = () => {
    onSave(local);
    toast.success(t('agendaSettings.settingsSaved'));
    onClose();
  };

  const handleReset = () => {
    setLocal({ ...DEFAULT_SETTINGS });
    toast.info(t('agendaSettings.settingsReset'));
  };

  const startHourOptions = Array.from({ length: 5 }, (_, i) => 6 + i);
  const endHourOptions = Array.from({ length: 6 }, (_, i) => 17 + i);
  const slotOptions = [15, 30, 45, 60];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-[61] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{t('agendaSettings.title')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
                <Switch checked={local.showSundays} onCheckedChange={v => update('showSundays', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('agendaSettings.dayStartHour')}</Label>
                <Select value={String(local.startHour)} onValueChange={v => update('startHour', Number(v))}>
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
                <Select value={String(local.endHour)} onValueChange={v => update('endHour', Number(v))}>
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
                <Select value={String(local.slotDuration)} onValueChange={v => update('slotDuration', Number(v))}>
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
                <Switch checked={local.showFreeSlots} onCheckedChange={v => update('showFreeSlots', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('agendaSettings.showBlocks')}</Label>
                <Switch checked={local.showBlocks} onCheckedChange={v => update('showBlocks', v)} />
              </div>
            </div>
          </section>

          {/* DENSIDADE */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">{t('agendaSettings.density')}</h3>
            <RadioGroup value={local.density} onValueChange={v => update('density', v as AgendaSettings['density'])} className="space-y-2">
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
              {!canEditColors && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>

            {!canEditColors && (
              <div className="bg-secondary/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-muted-foreground">
                  {t('agendaSettings.customizeColors')} <span className="text-primary font-semibold">Pro/Premium</span>.{' '}
                  <button className="text-primary underline text-xs">{t('agendaSettings.upgrade')}</button>
                </p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {LEGEND_ORDER.map(cat => {
                const defaultColor = CATEGORY_COLORS[cat].hex;
                const color = local.categoryColors[cat] || defaultColor;
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{CATEGORY_LABELS[cat]}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: color }} />
                      {canEditColors && (
                        <div className="flex items-center gap-1">
                          {/* Pro palette swatches */}
                          <div className="flex gap-0.5">
                            {PRO_PALETTE.slice(0, 5).map(c => (
                              <button
                                key={c}
                                className={cn('w-4 h-4 rounded-sm border', color === c ? 'border-primary ring-1 ring-primary' : 'border-border/50')}
                                style={{ backgroundColor: c }}
                                onClick={() => setCategoryColor(cat, c)}
                              />
                            ))}
                          </div>
                          {hasPremiumPicker && (
                            <button
                              className="text-[9px] text-primary underline ml-1"
                              onClick={() => openRgbPicker(cat)}
                            >
                              RGB
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Block color */}
            <p className="text-xs font-medium text-muted-foreground mb-2">{t('agendaSettings.blockColor')}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">{t('agendaSettings.blocks')}</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: local.blockColor }} />
                {canEditColors && (
                  <div className="flex gap-0.5">
                    {PRO_PALETTE.slice(0, 5).map(c => (
                      <button
                        key={c}
                        className={cn('w-4 h-4 rounded-sm border', local.blockColor === c ? 'border-primary ring-1 ring-primary' : 'border-border/50')}
                        style={{ backgroundColor: c }}
                        onClick={() => update('blockColor', c)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Premium RGB Picker Modal */}
          {editingCategory && hasPremiumPicker && (
            <section className="bg-secondary/30 rounded-xl p-4 space-y-3 border border-border">
              <h4 className="text-xs font-semibold text-foreground">
                Cor RGB — {CATEGORY_LABELS[editingCategory as ConsultationCategory]}
              </h4>
              <div
                className="w-full h-10 rounded-lg border border-border"
                style={{ backgroundColor: rgbToHex(rgbValues.r, rgbValues.g, rgbValues.b) }}
              />
              {(['r', 'g', 'b'] as const).map(channel => (
                <div key={channel} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase">{channel}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={255}
                      value={rgbValues[channel]}
                      onChange={e => setRgbValues(prev => ({ ...prev, [channel]: Math.min(255, Math.max(0, Number(e.target.value))) }))}
                      className="w-16 h-7 text-xs text-center"
                    />
                  </div>
                  <Slider
                    min={0}
                    max={255}
                    step={1}
                    value={[rgbValues[channel]]}
                    onValueChange={([v]) => setRgbValues(prev => ({ ...prev, [channel]: v }))}
                  />
                </div>
              ))}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setEditingCategory(null)}>Cancelar</Button>
                <Button size="sm" onClick={applyRgb}>Aplicar</Button>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Repor Padrão
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </div>
    </>
  );
}
