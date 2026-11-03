import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { supabase } from '@/integrations/supabase/client';

export function StripeEmbeddedCheckout({ priceId, returnUrl, withdrawalWaiver = false }: { priceId: string; returnUrl: string; withdrawalWaiver?: boolean }) {
  const { i18n } = useTranslation();
  const locale = (['pt', 'fr', 'en'].includes(i18n.language?.slice(0, 2)) ? i18n.language.slice(0, 2) : 'pt');
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId, returnUrl, locale, withdrawalWaiver },
    });
    if (error || !data?.clientSecret) throw new Error(error?.message || 'checkout_failed');
    return data.clientSecret;
  }, [priceId, returnUrl, locale, withdrawalWaiver]);

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
