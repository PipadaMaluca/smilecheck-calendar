import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface CurrentPlanBarProps {
  planName: string;
  price: string;
  nextBilling?: string;
  method?: string;
  onChangePlan: () => void;
}

export function CurrentPlanBar({ planName, price, nextBilling, method, onChangePlan }: CurrentPlanBarProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-[#D6E4F0] dark:border-[#1E3A5F] bg-[#EBF4FF] dark:bg-[#0A1929] px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 flex-wrap">
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[11px] self-start sm:self-auto">{planName}</Badge>
      <span className="text-sm font-semibold text-foreground">{price}</span>
      {nextBilling && (
        <span className="text-xs text-muted-foreground">
          {t('billing.nextBillingDate')}: <span className="text-foreground">{nextBilling}</span>
        </span>
      )}
      {method && (
        <span className="text-xs text-muted-foreground">
          {t('billing.method')}: <span className="text-foreground">{method}</span>
        </span>
      )}
      <div className="flex items-center gap-3 sm:ml-auto">
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onChangePlan}>
          {t('billing.changePlan')}
        </Button>
        <button
          className="text-xs text-[#EF5350] hover:underline"
          onClick={() => toast.success(t('plan.cancelled'))}
        >
          {t('plan.cancelSubscription')}
        </button>
      </div>
    </div>
  );
}