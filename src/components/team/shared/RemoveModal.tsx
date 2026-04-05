import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RemoveModalProps {
  open: boolean;
  onClose: () => void;
  dentistName: string;
  otherDentists: { id: string; name: string }[];
}

export function RemoveModal({ open, onClose, dentistName, otherDentists }: RemoveModalProps) {
  const { t } = useTranslation();
  const [transferTo, setTransferTo] = useState('');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            {t('removeTeam.title')}
          </DialogTitle>
          <DialogDescription>
            {t('removeTeam.confirmRemove', { name: dentistName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('removeTeam.transferTo')}</label>
            <Select value={transferTo} onValueChange={setTransferTo}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('removeTeam.selectDentist')} />
              </SelectTrigger>
              <SelectContent>
                {otherDentists.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="destructive" size="sm" onClick={onClose}>{t('removeTeam.remove')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
