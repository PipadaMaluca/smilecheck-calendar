import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthBackground } from './AuthBackground';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/branding/Logo';
import { supabase } from '@/integrations/supabase/client';


export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.forgotPasswordEmailInvalid'));
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };


  if (sent) {
    return (
      <AuthBackground>
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">{t('auth.forgotPasswordSent')}</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">{t('auth.forgotPasswordSentDesc')}</p>
          <Button onClick={() => navigate('/login')} className="w-full h-12 text-base font-semibold">
            {t('auth.forgotPasswordBack')}
          </Button>
        </div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <div className="flex flex-col items-center animate-fade-in">
        <span className="block sm:hidden"><Logo variant="full" size={260} className="mb-4" /></span>
        <span className="hidden sm:block lg:hidden"><Logo variant="full" size={280} className="mb-4" /></span>
        <span className="hidden lg:block"><Logo variant="full" size={300} className="mb-4" /></span>
        <h1 className="text-xl font-bold text-foreground mb-1">{t('auth.forgotPasswordTitle')}</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">{t('auth.forgotPasswordDesc')}</p>

        <div className="w-full space-y-4">
          <div>
            <Input type="email" placeholder={t('auth.email')} value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              className={cn('h-12 bg-secondary border-border', error && 'border-destructive')} />
            {error && <p className="text-destructive text-xs mt-1">{error}</p>}
          </div>

          <Button onClick={handleSend} disabled={loading} className="w-full h-12 text-base font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.send')}
          </Button>
        </div>

        <button onClick={() => navigate('/login')} className="mt-6 text-sm text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> {t('auth.forgotPasswordBack')}
        </button>
      </div>
    </AuthBackground>
  );
}