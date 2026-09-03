import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

export function PermissionsModal({ open, onClose, dentistName }: PermissionsModalProps) {
  const { t } = useTranslation();

  const permissionsList = [
    { key: 'agenda', labelKey: 'permissions.manageAgenda', default: true },
    { key: 'patients', labelKey: 'permissions.viewPatients', default: true },
    { key: 'prescriptions', labelKey: 'permissions.prescribe', default: true },
    { key: 'referrals', labelKey: 'permissions.referralLetters', default: true },
    { key: 'stats', labelKey: 'permissions.viewStats', default: false },
    { key: 'billing', labelKey: 'permissions.viewBilling', default: false },
    { key: 'invite', labelKey: 'permissions.inviteDentists', default: false },
    { key: 'settings', labelKey: 'permissions.changeSettings', default: false },
    { key: 'teleconsulta', labelKey: 'permissions.doTeleconsults', default: true },
  ];

  const presetKeys = ['presetDefault', 'presetAdmin', 'presetConsultOnly'] as const;
  const presetValues: Record<string, Record<string, boolean>> = {
    presetDefault: { agenda: true, patients: true, prescriptions: true, referrals: true, stats: false, billing: false, invite: false, settings: false, teleconsulta: true },
    presetAdmin: { agenda: true, patients: true, prescriptions: true, referrals: true, stats: true, billing: true, invite: true, settings: true, teleconsulta: true },
    presetConsultOnly: { agenda: true, patients: true, prescriptions: false, referrals: false, stats: false, billing: false, invite: false, settings: false, teleconsulta: false },
  };

  const [perms, setPerms] = useState<Record<string, boolean>>(
    Object.fromEntries(permissionsList.map((p) => [p.key, p.default]))
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('permissions.title')} — {dentistName}</DialogTitle>
          <DialogDescription>{t('permissions.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-3">
          {presetKeys.map((key) => (
            <Badge
              key={key}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 transition-colors text-xs press"
              onClick={() => setPerms({ ...presetValues[key] })}
            >
              {t(`permissions.${key}`)}
            </Badge>
          ))}
        </div>

        <Separator />

        <div className="space-y-3 py-2">
          {permissionsList.map((p) => (
            <div key={p.key} className="flex items-center justify-between">
              <span className="text-sm">{t(p.labelKey)}</span>
              <Switch
                checked={perms[p.key]}
                onCheckedChange={(v) => setPerms((prev) => ({ ...prev, [p.key]: v }))}
              />
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button size="sm" onClick={onClose}>{t('common.save')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
