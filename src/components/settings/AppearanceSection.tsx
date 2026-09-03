import { useState } from 'react';
import { Sun, Moon, Palette, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

interface AppearanceSectionProps {
  isPremium?: boolean;
  onViewPlans?: () => void;
}

const DEFAULT_COLORS = {
  primary: '#3B82F6',
  accent: '#10B981',
  background: '#0A1929',
};

export function AppearanceSection({ isPremium = true, onViewPlans }: AppearanceSectionProps) {
  const [theme, setTheme] = useTheme();
  const darkMode = theme === 'dark';
  const setDarkMode = (v: boolean) => setTheme(v ? 'dark' : 'light');
  const [showCustomize, setShowCustomize] = useState(false);
  const [colors, setColors] = useState({ ...DEFAULT_COLORS });
  const [savedColors, setSavedColors] = useState({ ...DEFAULT_COLORS });

  const handleSave = () => {
    setSavedColors({ ...colors });
    setShowCustomize(false);
    toast.success('Tema personalizado guardado!');
  };

  const handleReset = () => {
    setColors({ ...DEFAULT_COLORS });
  };

  return (
    <>
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Aparência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm text-foreground">
                {darkMode ? <><Moon className="w-4 h-4 inline mr-1.5" />Modo Escuro</> : <><Sun className="w-4 h-4 inline mr-1.5" />Modo Claro</>}
              </span>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          {/* Customize button */}
          {isPremium ? (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowCustomize(true)}
            >
              <Palette className="w-4 h-4" />
              Personalizar
            </Button>
          ) : (
            <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Personalização disponível no plano Premium</span>
              </div>
              <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={onViewPlans}>
                Ver planos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customize Theme Dialog */}
      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personalizar Tema
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Color pickers */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Cor primária</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.primary}
                    onChange={e => setColors(c => ({ ...c, primary: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent press"
                  />
                  <Input
                    value={colors.primary}
                    onChange={e => setColors(c => ({ ...c, primary: e.target.value }))}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Cor de destaque</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.accent}
                    onChange={e => setColors(c => ({ ...c, accent: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent press"
                  />
                  <Input
                    value={colors.accent}
                    onChange={e => setColors(c => ({ ...c, accent: e.target.value }))}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Cor de fundo</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.background}
                    onChange={e => setColors(c => ({ ...c, background: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent press"
                  />
                  <Input
                    value={colors.background}
                    onChange={e => setColors(c => ({ ...c, background: e.target.value }))}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">PREVIEW</Label>
              <div
                className="rounded-xl p-4 border border-border space-y-3"
                style={{ backgroundColor: colors.background }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <div className="space-y-1">
                    <div className="h-2 w-24 rounded" style={{ backgroundColor: colors.primary, opacity: 0.8 }} />
                    <div className="h-2 w-16 rounded bg-white/20" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div
                    className="h-8 px-4 rounded-lg flex items-center text-xs font-medium text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Botão
                  </div>
                  <div
                    className="h-8 px-4 rounded-lg flex items-center text-xs font-medium text-white"
                    style={{ backgroundColor: colors.accent }}
                  >
                    Destaque
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-12 flex-1 rounded-lg border border-white/10" style={{ backgroundColor: `${colors.background}dd` }} />
                  <div className="h-12 flex-1 rounded-lg border border-white/10" style={{ backgroundColor: `${colors.background}dd` }} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleReset}>Repor Padrão</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
