import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Blocking prompt shown after sign-in while the account has not accepted the current terms version
 * (new version or older account). The server refuses booking, reviews, invites and checkout until then.
 */
export function TermsGate() {
  const { t } = useTranslation();
  const { needsTermsAcceptance, acceptTerms, signOut, role } = useAuth();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!needsTermsAcceptance) return null;

  const accept = async () => {
    setBusy(true);
    const ok = await acceptTerms();
    setBusy(false);
    if (!ok) toast.error(t('termsGate.error'));
  };

  const link = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">{label}</a>
  );

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('termsGate.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('termsGate.body')}</AlertDialogDescription>
        </AlertDialogHeader>
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {link('/termos', t('legal.termsTitle'))}
          {link('/privacidade', t('legal.privacyTitle'))}
          {role !== 'patient' && link('/termos-profissionais', t('legal.proTermsTitle'))}
        </p>
        <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
          <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} className="mt-0.5" />
          <span>{t('termsGate.checkbox')}</span>
        </label>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => void signOut()}>{t('termsGate.signOut')}</Button>
          <Button onClick={accept} disabled={!checked || busy}>{t('termsGate.accept')}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
