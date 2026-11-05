import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Stethoscope, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/calendar';

/**
 * First Google sign-in: the account exists but has no role yet. The user picks it once
 * (server RPC `choose_initial_role`); TermsGate runs right after.
 */
export function RoleChoiceGate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, demoMode, patchProfile, signOut } = useAuth();
  const [role, setRole] = useState<UserRole>('patient');
  const [clinicName, setClinicName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [busy, setBusy] = useState(false);
  if (!profile?.role_pending || demoMode) return null;

  const options: { value: UserRole; Icon: typeof User }[] = [
    { value: 'patient', Icon: User },
    { value: 'dentist', Icon: Stethoscope },
    { value: 'clinic', Icon: Building2 },
  ];

  const confirm = async () => {
    setBusy(true);
    const { error } = await supabase.rpc('choose_initial_role', {
      _role: role,
      _clinic_name: role === 'clinic' ? clinicName.trim() : undefined,
      _order_number: role === 'dentist' ? orderNumber.trim() : undefined,
    });
    setBusy(false);
    if (error) { toast.error(t('roleChoice.error')); return; }
    patchProfile({ role, role_pending: false });
    navigate(`/app?role=${role}`, { replace: true });
  };

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('roleChoice.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('roleChoice.body')}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('roleChoice.title')}>
          {options.map(({ value, Icon }) => (
            <Button key={value} type="button" variant="outline" role="radio" aria-checked={role === value}
              onClick={() => setRole(value)}
              className={cn('h-auto min-h-11 py-2 flex-col gap-1', role === value && 'border-primary text-primary')}>
              <Icon className="w-5 h-5" />
              <span className="text-sm">{t(`roleChoice.${value}`)}</span>
            </Button>
          ))}
        </div>
        {role === 'clinic' && (
          <Input value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder={t('roleChoice.clinicName')} aria-label={t('roleChoice.clinicName')} />
        )}
        {role === 'dentist' && (
          <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder={t('roleChoice.orderNumber')} aria-label={t('roleChoice.orderNumber')} />
        )}
        {role !== 'patient' && <p className="text-sm text-muted-foreground">{t('roleChoice.proNote')}</p>}
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => void signOut()}>{t('termsGate.signOut')}</Button>
          <Button onClick={confirm} disabled={busy || (role === 'clinic' && !clinicName.trim())}>{t('roleChoice.confirm')}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
