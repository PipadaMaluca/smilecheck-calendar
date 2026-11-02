import { useTranslation } from 'react-i18next';
import { Ticket } from 'lucide-react';
import { CHEQUE_PROTESE_START, type ClinicCheques } from '@/lib/cheques';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/** Discreet badges for clinics in Portugal that accept SNS vouchers. Renders nothing for FR clinics. */
export function ChequeBadges({ cheques, className }: { cheques: ClinicCheques; className?: string }) {
  const { t } = useTranslation();
  if (cheques.country !== 'PT' || (!cheques.dentista && !cheques.protese)) return null;
  const from = formatDate(CHEQUE_PROTESE_START, { month: 'long', year: 'numeric' });
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {cheques.dentista && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-foreground">
          <Ticket className="w-3 h-3 text-muted-foreground" aria-hidden />{t('cheques.dentista')}
        </span>
      )}
      {cheques.protese && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-foreground">
          <Ticket className="w-3 h-3 text-muted-foreground" aria-hidden />{t('cheques.proteseFrom', { date: from })}
        </span>
      )}
    </div>
  );
}
