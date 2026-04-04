import { X, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Consultation } from '@/types/calendar';
import { useTranslation } from 'react-i18next';

interface CopyPasteBannerProps {
  consultation: Consultation;
  onCancel: () => void;
}

export function CopyPasteBanner({ consultation, onCancel }: CopyPasteBannerProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-primary/10 border-b border-primary/30 px-4 py-2.5 flex items-center justify-between gap-3 animate-slide-up z-30">
      <div className="flex items-center gap-2 min-w-0">
        <Clipboard className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-sm font-medium text-primary truncate">
          {t('agenda.copyPasteBanner')} {consultation.patient.name}
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={onCancel} className="gap-1.5 flex-shrink-0">
        <X className="w-3.5 h-3.5" />
        {t('common.cancel')}
      </Button>
    </div>
  );
}
