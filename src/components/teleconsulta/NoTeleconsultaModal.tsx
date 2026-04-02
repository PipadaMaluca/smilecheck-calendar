import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

interface NoTeleconsultaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  patientName: string;
}

export function NoTeleconsultaModal({ isOpen, onClose, onCreate, patientName }: NoTeleconsultaModalProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('teleconsult.noScheduled')}</DialogTitle>
          <DialogDescription>
            {t('teleconsult.noScheduledDesc', { name: patientName })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>{t('common.cancel')}</Button>
          <Button className="flex-1 gap-2 bg-[hsl(var(--teleconsulta))] hover:bg-[hsl(var(--teleconsulta))]/90 text-white" onClick={onCreate}>
            <Video className="w-4 h-4" /> {t('teleconsult.createQuick')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
