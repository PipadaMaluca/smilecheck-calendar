import { useState } from 'react';
import { X, RotateCcw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CATEGORY_COLORS, CATEGORY_LABELS, ConsultationCategory, LEGEND_ORDER, UserRole } from '@/types/calendar';
import { mockDentists } from '@/data/mockData';
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
  dentistColors: Record<string, string>;
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
  dentistColors: {},
  blockColor: '#9E9E9E',
};

interface AgendaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AgendaSettings;
  onSave: (settings: AgendaSettings) => void;
  userRole: UserRole;
  isPro?: boolean;
}

export function AgendaSettingsModal({ isOpen, onClose, settings, onSave, userRole, isPro = false }: AgendaSettingsModalProps) {
  const [local, setLocal] = useState<AgendaSettings>({ ...settings });

  if (!isOpen) return null;

  const update = <K extends keyof AgendaSettings>(key: K, val: AgendaSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    onSave(local);
    toast.success('Configurações da agenda guardadas');
    onClose();
  };

  const handleReset = () => {
    setLocal({ ...DEFAULT_SETTINGS });
    toast.info('Configurações repostas ao padrão');
  };

  const startHourOptions = Array.from({ length: 5 }, (_, i) => 6 + i);
  const endHourOptions = Array.from({ length: 6 }, (_, i) => 17 + i);
  const slotOptions = [15, 30, 45, 60];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      {/* Slide-in Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-[61] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Modificar Horários</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* VISUALIZAÇÃO */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Visualização</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Mostrar Domingos</Label>
                <Switch checked={local.showSundays} onCheckedChange={v => update('showSundays', v)} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Hora de início do dia</Label>
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
                <Label>Hora de fim do dia</Label>
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
                <Label>Duração padrão dos slots</Label>
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
                <Label>Mostrar slots livres</Label>
                <Switch checked={local.showFreeSlots} onCheckedChange={v => update('showFreeSlots', v)} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Mostrar pausas/bloqueios</Label>
                <Switch checked={local.showBlocks} onCheckedChange={v => update('showBlocks', v)} />
              </div>
            </div>
          </section>

          {/* DENSIDADE */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Densidade</h3>
            <RadioGroup value={local.density} onValueChange={v => update('density', v as AgendaSettings['density'])} className="space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="compact" id="density-compact" />
                <Label htmlFor="density-compact">Compacto (mais consultas visíveis)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="normal" id="density-normal" />
                <Label htmlFor="density-normal">Normal (padrão)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="expanded" id="density-expanded" />
                <Label htmlFor="density-expanded">Expandido (mais detalhes)</Label>
              </div>
            </RadioGroup>
          </section>

          {/* CORES */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Personalizar Cores</h3>
              {!isPro && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>

            {!isPro && (
              <div className="bg-secondary/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-muted-foreground">
                  Personalizar cores disponível em <span className="text-primary font-semibold">Pro/Premium</span>.{' '}
                  <button className="text-primary underline text-xs">Fazer upgrade</button>
                </p>
              </div>
            )}

            {/* Category colors */}
            <p className="text-xs font-medium text-muted-foreground mb-2">Cores por tipo de consulta</p>
            <div className="space-y-2 mb-4">
              {LEGEND_ORDER.map(cat => {
                const color = local.categoryColors[cat] || CATEGORY_COLORS[cat].hex;
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{CATEGORY_LABELS[cat]}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: color }} />
                      {isPro && (
                        <input
                          type="color"
                          value={color}
                          onChange={e => setLocal(prev => ({
                            ...prev,
                            categoryColors: { ...prev.categoryColors, [cat]: e.target.value }
                          }))}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dentist colors (clinic only) */}
            {userRole === 'clinic' && (
              <>
                <p className="text-xs font-medium text-muted-foreground mb-2">Cores por dentista</p>
                <div className="space-y-2 mb-4">
                  {mockDentists.map(d => {
                    const color = local.dentistColors[d.id] || '#4A90D9';
                    return (
                      <div key={d.id} className="flex items-center justify-between">
                        <span className="text-xs text-foreground">{d.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: color }} />
                          {isPro && (
                            <input
                              type="color"
                              value={color}
                              onChange={e => setLocal(prev => ({
                                ...prev,
                                dentistColors: { ...prev.dentistColors, [d.id]: e.target.value }
                              }))}
                              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Block color */}
            <p className="text-xs font-medium text-muted-foreground mb-2">Cor dos bloqueios</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Bloqueios</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: local.blockColor }} />
                {isPro && (
                  <input
                    type="color"
                    value={local.blockColor}
                    onChange={e => update('blockColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                )}
              </div>
            </div>
          </section>
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
