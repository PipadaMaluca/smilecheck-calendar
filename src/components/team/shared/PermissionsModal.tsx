import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface PermissionsModalProps {
  open: boolean;
  onClose: () => void;
  dentistName: string;
}

const defaultPermissions = [
  { key: 'agenda', label: '📅 Gerir própria agenda', default: true },
  { key: 'patients', label: '📋 Ver lista de pacientes', default: true },
  { key: 'prescriptions', label: '💊 Prescrever receitas', default: true },
  { key: 'referrals', label: '📄 Emitir cartas de referência', default: true },
  { key: 'stats', label: '📊 Ver estatísticas da clínica', default: false },
  { key: 'billing', label: '💰 Ver tarifas e faturação', default: false },
  { key: 'invite', label: '👥 Convidar dentistas', default: false },
  { key: 'settings', label: '⚙️ Alterar configurações da clínica', default: false },
  { key: 'teleconsulta', label: '📱 Realizar teleconsultas', default: true },
];

const presets: Record<string, Record<string, boolean>> = {
  'Padrão': { agenda: true, patients: true, prescriptions: true, referrals: true, stats: false, billing: false, invite: false, settings: false, teleconsulta: true },
  'Administrador': { agenda: true, patients: true, prescriptions: true, referrals: true, stats: true, billing: true, invite: true, settings: true, teleconsulta: true },
  'Apenas consultas': { agenda: true, patients: true, prescriptions: false, referrals: false, stats: false, billing: false, invite: false, settings: false, teleconsulta: false },
};

export function PermissionsModal({ open, onClose, dentistName }: PermissionsModalProps) {
  const [perms, setPerms] = useState<Record<string, boolean>>(
    Object.fromEntries(defaultPermissions.map((p) => [p.key, p.default]))
  );

  const applyPreset = (name: string) => {
    setPerms({ ...presets[name] });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Permissões — {dentistName}</DialogTitle>
          <DialogDescription>Configure os acessos deste dentista</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-3">
          {Object.keys(presets).map((name) => (
            <Badge
              key={name}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
              onClick={() => applyPreset(name)}
            >
              {name}
            </Badge>
          ))}
        </div>

        <Separator />

        <div className="space-y-3 py-2">
          {defaultPermissions.map((p) => (
            <div key={p.key} className="flex items-center justify-between">
              <span className="text-sm">{p.label}</span>
              <Switch
                checked={perms[p.key]}
                onCheckedChange={(v) => setPerms((prev) => ({ ...prev, [p.key]: v }))}
              />
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={onClose}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
