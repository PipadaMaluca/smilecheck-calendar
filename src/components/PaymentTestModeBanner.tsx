import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

/** Visible on the plans screen and inside checkout while payments run in test mode. */
export function PaymentTestModeBanner() {
  const { t } = useTranslation();
  if (clientToken && !clientToken.startsWith('pk_test_')) return null;
  return (
    <div role="note" className="w-full rounded-lg border border-warning/40 bg-warning/10 px-4 py-2 text-center text-sm text-foreground flex items-center justify-center gap-2">
      <FlaskConical className="w-4 h-4 text-warning shrink-0" aria-hidden />
      {clientToken ? t('payments.testMode') : t('payments.notConfigured')}
    </div>
  );
}
