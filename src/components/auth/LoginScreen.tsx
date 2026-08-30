import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, QrCode, ChevronDown, ChevronUp, User, Stethoscope, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthBackground } from './AuthBackground';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/branding/Logo';
import { useWatermarkSrc } from '@/hooks/useWatermarkSrc';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/calendar';

export function LoginScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const watermarkSrc = useWatermarkSrc();
  const { enterDemo, exitDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [qrExpanded, setQrExpanded] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = t('auth.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('auth.emailInvalid');
    if (!password) e.password = t('auth.passwordRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    exitDemo();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      setErrors({
        form: /invalid login/i.test(error.message)
          ? t('auth.invalidCredentials', { defaultValue: 'Email ou senha incorretos.' })
          : error.message,
      });
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();
    setLoading(false);
    navigate(`/app?role=${profile?.role ?? 'patient'}`);
  };

  const startDemo = (role: UserRole) => {
    localStorage.removeItem(`smilecheck_video_splash_${role}`);
    enterDemo(role);
    navigate(`/app?role=${role}&demo=true`);
  };

  const demoButtons: { role: UserRole; label: string; Icon: typeof User }[] = [
    { role: 'patient', label: t('demo.patient', { defaultValue: 'Paciente' }), Icon: User },
    { role: 'dentist', label: t('demo.dentist', { defaultValue: 'Dentista' }), Icon: Stethoscope },
    { role: 'clinic', label: t('demo.clinic', { defaultValue: 'Clínica' }), Icon: Building2 },
  ];

  const handleQRAuthorized = () => {
    navigate('/app');
  };


  const loginForm = (
    <div className="flex flex-col items-center animate-fade-in">
      <span className="block sm:hidden"><Logo variant="full" size={260} className="mb-2" /></span>
      <span className="hidden sm:block lg:hidden"><Logo variant="full" size={280} className="mb-2" /></span>
      <span className="hidden lg:block"><Logo variant="full" size={300} className="mb-2" /></span>
      <p className="text-muted-foreground mb-6 text-lg">{t('auth.tagline')}</p>

      <div className="w-full space-y-4">
        <div>
          <Input type="email" placeholder={t('auth.email')} value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            className={cn('h-12 bg-secondary border-border', errors.email && 'border-destructive')} />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.password')} value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              className={cn('h-12 bg-secondary border-border pr-10', errors.password && 'border-destructive')} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
        </div>

        <div className="flex justify-end">
          <button onClick={() => navigate('/forgot-password')} className="text-primary hover:underline text-sm">
            {t('auth.forgotPassword')}
          </button>
        </div>

        {errors.form && <p className="text-destructive text-sm text-center">{errors.form}</p>}

        <Button onClick={handleLogin} disabled={loading} className="w-full h-12 text-base font-semibold">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.login')}
        </Button>
      </div>


      <div className="flex items-center w-full my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="px-4 text-muted-foreground text-sm">{t('common.or')}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="w-full space-y-3">
        <Button variant="outline" className="w-full h-11 bg-white text-gray-800 hover:bg-gray-100 border-0 font-medium">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
          {t('auth.continueWithGoogle')}
        </Button>
        <Button className="w-full h-11 bg-black text-white hover:bg-black/90 border-0 font-medium">
          <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
          {t('auth.continueWithApple')}
        </Button>
        <Button className="w-full h-11 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 border-0 font-medium">
          <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          {t('auth.continueWithFacebook')}
        </Button>
      </div>

      <p className="mt-6 text-muted-foreground text-base">
        {t('auth.noAccount')}{' '}
        <button onClick={() => navigate('/signup')} className="text-primary hover:underline font-medium">{t('auth.createAccount')}</button>
      </p>

      <button onClick={() => navigate('/demo?demo=true')} className="mt-3 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
        {t('auth.demo')}
      </button>
    </div>
  );

  const qrSection = (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-1">
        <QrCode className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">{t('auth.qrLogin')}</h2>
      </div>
      <p className="text-muted-foreground mb-6 text-sm">{t('auth.qrFast')}</p>
      <QRCodeDisplay onAuthorized={handleQRAuthorized} />
    </div>
  );

  if (isMobile) {
    return (
      <AuthBackground>
        <div className="space-y-6">
          {loginForm}
          <div className="border-t border-border pt-4">
            <button onClick={() => setQrExpanded(!qrExpanded)}
              className="flex items-center justify-center gap-2 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <QrCode className="w-4 h-4" />
              <span>{t('auth.qrCodeAlt')}</span>
              {qrExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {qrExpanded && <div className="mt-4 animate-fade-in">{qrSection}</div>}
          </div>
        </div>
      </AuthBackground>
    );
  }

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      <img src={watermarkSrc} alt="" aria-hidden="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-none opacity-[0.05] pointer-events-none z-0 object-contain" />
      <div className="w-1/2 md:w-[55%] lg:w-1/2 flex items-center justify-center p-8 z-10 relative">
        <div className="w-full max-w-md">{loginForm}</div>
      </div>
      <div className="w-px bg-gradient-to-b from-transparent via-border to-transparent z-10" />
      <div className="w-1/2 md:w-[45%] lg:w-1/2 flex items-center justify-center p-8 z-10 relative">
        <div className="w-full max-w-sm bg-card/30 backdrop-blur-sm rounded-2xl p-8 border border-border/50">{qrSection}</div>
      </div>
    </div>
  );
}