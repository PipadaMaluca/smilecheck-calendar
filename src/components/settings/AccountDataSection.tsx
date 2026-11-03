import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/** Word the user must type to confirm, per language (must match the delete-account function). */
export const DELETE_CONFIRM_WORD: Record<string, string> = { pt: 'ELIMINAR', fr: 'SUPPRIMER', en: 'DELETE' };
export const confirmWordFor = (lang: string | undefined) => DELETE_CONFIRM_WORD[(lang ?? 'pt').slice(0, 2)] ?? 'ELIMINAR';

/** GDPR: download my data + delete my account (real flow; demo mode only explains). */
export function AccountDataSection() {
  const { t, i18n } = useTranslation();
  const { user, demoMode, signOut } = useAuth();
  const real = !demoMode && !!user;
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const word = confirmWordFor(i18n.language);

  const download = async () => {
    if (!real) { toast.info(t('account.demoOnly')); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc('export_my_data');
    setBusy(false);
    if (error || !data) { toast.error(t('account.exportError')); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `smilecheck-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(t('account.exportDone'));
  };

  const doDelete = async () => {
    if (!real) { toast.info(t('account.demoOnly')); setStep(0); return; }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('delete-account', { body: { confirm: word } });
    setBusy(false);
    if (error || !data?.ok) { toast.error(t('account.deleteError')); return; }
    toast.success(t('account.deleted'));
    await signOut();
    window.location.href = '/';
  };

  return (
    <>
      <button type="button" onClick={download} disabled={busy} className="flex items-center gap-3 py-3 w-full text-left hover:opacity-80 transition-opacity">
        <Download className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-foreground">{t('account.download')}</span>
      </button>
      <button type="button" onClick={() => { setTyped(''); setStep(1); }} className="flex items-center gap-3 py-3 w-full text-left hover:opacity-80 transition-opacity">
        <Trash2 className="w-4 h-4 text-destructive" />
        <span className="text-sm text-destructive font-medium">{t('settings.deleteAccount')}</span>
      </button>

      <AlertDialog open={step === 1} onOpenChange={(o) => !o && setStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('account.step1Title')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t('account.willDelete')}</p>
                <p>{t('account.dossierKept')}</p>
                <p>{t('account.subscriptionsCanceled')}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <Button variant="destructive" onClick={() => setStep(2)}>{t('account.continue')}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={step === 2} onOpenChange={(o) => !o && setStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('account.step2Title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('account.typeToConfirm', { word })}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">{t('account.typeLabel', { word })}</Label>
            <Input id="delete-confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <Button variant="destructive" disabled={typed.trim() !== word || busy} onClick={doDelete}>
              {t('account.deleteForever')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
