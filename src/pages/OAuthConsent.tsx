import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/branding/Logo';
import { supabase } from '@/integrations/supabase/client';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface AuthDetails {
  client?: { name?: string; client_name?: string } | null;
  redirect_uri?: string;
  redirect_url?: string;
  redirect_to?: string;
}
interface OAuthApi {
  getAuthorizationDetails(id: string): Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
  approveAuthorization(id: string): Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
  denyAuthorization(id: string): Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
}
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const { t } = useTranslation();
  useDocumentTitle(t('oauthConsent.approve'));
  const [params] = useSearchParams();
  const authorizationId = params.get('authorization_id') ?? '';
  const [details, setDetails] = useState<AuthDetails | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError(t('oauthConsent.missing'));
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = '/login?next=' + encodeURIComponent(next);
        return;
      }
      setEmail(sess.session.user.email ?? '');
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(t('oauthConsent.error'));
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) { window.location.href = immediate; return; }
      setDetails(data);
    })();
    return () => { active = false; };
  }, [authorizationId, t]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    const target = data?.redirect_url ?? data?.redirect_to;
    if (error || !target) { setBusy(false); return setError(t('oauthConsent.error')); }
    window.location.href = target;
  }

  const client = details?.client?.name ?? details?.client?.client_name ?? t('oauthConsent.anApp');

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
        <Logo />
        {error ? (
          <p className="text-destructive" role="alert">{error}</p>
        ) : !details ? (
          <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{t('oauthConsent.loading')}</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground">{t('oauthConsent.title', { client })}</h1>
            <p className="text-muted-foreground">{t('oauthConsent.body', { client })}</p>
            {email && <p className="text-sm text-foreground">{t('oauthConsent.account', { email })}</p>}
            {details.redirect_uri && <p className="text-xs text-muted-foreground break-all">{t('oauthConsent.redirect', { uri: details.redirect_uri })}</p>}
            <p className="text-xs text-muted-foreground">{t('oauthConsent.boundary')}</p>
            <div className="flex w-full flex-col gap-3">
              <Button disabled={busy} onClick={() => decide(true)}>{t('oauthConsent.approve')}</Button>
              <Button variant="outline" disabled={busy} onClick={() => decide(false)}>{t('oauthConsent.deny')}</Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
