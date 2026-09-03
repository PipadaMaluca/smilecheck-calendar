import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { supabase } from '@/integrations/supabase/client';
import { mapAuthError } from '@/lib/authErrors';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (password.length < 6) return setError(t('auth.resetMin'));
    if (password !== confirm) return setError(t('auth.resetNoMatch'));
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(mapAuthError(err, t).message);
      return;
    }
    toast.success(t('auth.resetSuccess'));
    navigate('/app');
  };

  return (
    <AuthBackground>
      <div className="flex flex-col items-center animate-fade-in w-full">
        <h1 className="text-xl font-bold text-foreground mb-1">{t('auth.resetTitle')}</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">{t('auth.resetDesc')}</p>
        <div className="w-full space-y-4">
          <div>
            <Input type="password" placeholder={t('auth.resetNew')} value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className={cn('h-12 bg-secondary border-border', error && 'border-destructive')} />
            {error
              ? <p className="text-destructive text-xs mt-1">{error}</p>
              : <p className="text-muted-foreground text-xs mt-1">{t('auth.passwordHint')}</p>}
          </div>
          <Input type="password" placeholder={t('auth.resetConfirm')} value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(''); }}
            className="h-12 bg-secondary border-border" />
          <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-base font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.resetSave')}
          </Button>
        </div>
      </div>
    </AuthBackground>
  );
}
