import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Stethoscope, Building2, Eye, EyeOff, Loader2, Mail, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { AuthBackground } from './AuthBackground';
import { PhoneInput } from './PhoneInput';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/branding/Logo';
import { supabase } from '@/integrations/supabase/client';


type AccountType = 'paciente' | 'dentista' | 'clinica' | null;

function getPasswordStrength(p: string, t: (key: string) => string): { label: string; color: string; width: string } {
  if (p.length < 6) return { label: t('auth.passwordStrengthWeak'), color: 'bg-destructive', width: 'w-1/3' };
  if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: t('auth.passwordStrengthMedium'), color: 'bg-yellow-500', width: 'w-2/3' };
  return { label: t('auth.passwordStrengthStrong'), color: 'bg-green-500', width: 'w-full' };
}

function maskPhone(countryCode: string, phone: string) {
  const digits = phone.replace(/\s/g, '');
  if (digits.length <= 3) return `${countryCode} ${digits}`;
  return `${countryCode} ${digits.slice(0, 1)}XX XXX ${digits.slice(-3)}`;
}

export function SignUpScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);

  const [accountType, setAccountType] = useState<AccountType>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [smsOtpValue, setSmsOtpValue] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [smsResendCountdown, setSmsResendCountdown] = useState(0);
  const [verificationPhase, setVerificationPhase] = useState<'email' | 'sms'>('email');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+351');
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [nif, setNif] = useState('');
  const [address, setAddress] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralStatus, setReferralStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [socialProvider, setSocialProvider] = useState<string | null>(null);

  const accountTypes = [
    { value: 'paciente' as const, icon: User, title: t('auth.accountTypes.paciente'), desc: t('auth.accountDescs.paciente') },
    { value: 'dentista' as const, icon: Stethoscope, title: t('auth.accountTypes.dentista'), desc: t('auth.accountDescs.dentista') },
    { value: 'clinica' as const, icon: Building2, title: t('auth.accountTypes.clinica'), desc: t('auth.accountDescs.clinica') },
  ];

  const validateReferralCode = (code: string) => {
    if (!code.trim()) { setReferralStatus('idle'); return; }
    if (code.toUpperCase().startsWith('SMILE-')) { setReferralStatus('valid'); } else { setReferralStatus('invalid'); }
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t('auth.nameRequired');
    if (!email.trim()) e.email = t('auth.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('auth.emailInvalid');
    const phoneDigits = phone.replace(/\s/g, '');
    if (!phoneDigits) e.phone = t('auth.phoneRequired');
    else if (phoneDigits.length < 9) e.phone = t('auth.phoneMin');
    if (!password) e.password = t('auth.passwordRequired');
    else if (password.length < 6) e.password = t('auth.passwordMin');
    if (password !== confirmPassword) e.confirmPassword = t('auth.passwordsNoMatch');
    if (!acceptedTerms) e.terms = t('auth.termsRequired');
    if (accountType === 'dentista' && !orderNumber.trim()) e.orderNumber = t('auth.orderNumberRequired');
    if (accountType === 'clinica') {
      if (!clinicName.trim()) e.clinicName = t('auth.clinicNameRequired');
      if (!nif.trim()) e.nif = t('auth.nifRequired');
      if (!address.trim()) e.address = t('auth.addressRequired');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    const role = accountType === 'dentista' ? 'dentist' : accountType === 'clinica' ? 'clinic' : 'patient';
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          role,
          full_name: name.trim(),
          language: i18n.language?.slice(0, 2) || 'pt',
          phone: `${countryCode} ${phone}`.trim(),
          rpps_number: orderNumber.trim() || null,
          clinic_name: clinicName.trim() || null,
          address: address.trim() || null,
        },
      },
    });
    setLoading(false);
    if (error) {
      setErrors({ email: /already registered/i.test(error.message) ? t('auth.emailInUse', { defaultValue: 'Este email já está registado.' }) : error.message });
      return;
    }
    navigate(`/app?role=${role}`);
  };


  const startResendTimer = () => {
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown(prev => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
    }, 1000);
  };

  const startSmsResendTimer = () => {
    setSmsResendCountdown(60);
    const interval = setInterval(() => {
      setSmsResendCountdown(prev => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleVerifyEmail = async () => {
    if (otpValue.length < 6) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setVerificationPhase('sms');
    startSmsResendTimer();
  };

  const handleVerifySms = async () => {
    if (smsOtpValue.length < 6) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    navigate('/app');
  };

  const handleSocialLogin = (provider: string) => {
    setSocialProvider(provider);
    setName(provider === 'Google' ? 'Maria Silva' : provider === 'Apple' ? 'João Santos' : 'Ana Costa');
    setEmail(provider === 'Google' ? 'maria.silva@gmail.com' : provider === 'Apple' ? 'joao.santos@icloud.com' : 'ana.costa@facebook.com');
    setStep(4);
  };

  const validateSocialProfile = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t('auth.nameRequired');
    if (!email.trim()) e.email = t('auth.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('auth.emailInvalid');
    const phoneDigits = phone.replace(/\s/g, '');
    if (!phoneDigits) e.phone = t('auth.phoneRequired');
    else if (phoneDigits.length < 9) e.phone = t('auth.phoneMin');
    if (!password) e.password = t('auth.passwordRequired');
    else if (password.length < 6) e.password = t('auth.passwordMin');
    if (password !== confirmPassword) e.confirmPassword = t('auth.passwordsNoMatch');
    if (!acceptedTerms) e.terms = t('auth.termsRequired');
    if (accountType === 'dentista' && !orderNumber.trim()) e.orderNumber = t('auth.orderNumberRequired');
    if (accountType === 'clinica') {
      if (!clinicName.trim()) e.clinicName = t('auth.clinicNameRequired');
      if (!nif.trim()) e.nif = t('auth.nifRequired');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCompleteSocialProfile = async () => {
    if (!validateSocialProfile()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setVerificationPhase('sms');
    setSmsOtpValue('');
    setStep(3);
    startSmsResendTimer();
  };

  const strength = getPasswordStrength(password, t);

  // STEP 1
  if (step === 1) {
    return (
      <AuthBackground>
        <div className="flex flex-col items-center animate-fade-in">
          <span className="block sm:hidden"><Logo variant="full" size={260} className="mb-6" /></span>
          <span className="hidden sm:block lg:hidden"><Logo variant="full" size={280} className="mb-6" /></span>
          <span className="hidden lg:block"><Logo variant="full" size={300} className="mb-6" /></span>
          <h1 className="text-xl font-bold text-foreground mb-1">{t('auth.createAccount')}</h1>
          <p className="text-sm text-muted-foreground mb-6">{t('auth.chooseAccountType')}</p>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {accountTypes.map(at => (
              <button key={at.value} onClick={() => setAccountType(at.value)}
                className={cn('flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 bg-secondary hover:bg-accent',
                  accountType === at.value ? 'border-primary shadow-[0_0_15px_hsl(207_90%_54%/0.3)]' : 'border-border')}>
                <at.icon className={cn('w-8 h-8 mb-2', accountType === at.value ? 'text-primary' : 'text-muted-foreground')} />
                <span className="font-semibold text-sm text-foreground">{at.title}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">{at.desc}</span>
              </button>
            ))}
          </div>

          <Button onClick={() => setStep(2)} disabled={!accountType} className="w-full h-12 text-base font-semibold">
            {t('common.continue')}
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <button onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">{t('auth.login')}</button>
          </p>
          <button onClick={() => navigate('/login')} className="mt-2 text-xs text-muted-foreground hover:text-primary transition-colors">
            {t('auth.otherDevice')}
          </button>
        </div>
      </AuthBackground>
    );
  }

  // STEP 3 — Email + SMS verification
  if (step === 3) {
    if (verificationPhase === 'email') {
      return (
        <AuthBackground>
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-1">{t('auth.verifyEmail')}</h1>
            <p className="text-sm text-muted-foreground text-center mb-1">
              {t('auth.verificationSentTo')} <span className="text-foreground font-medium">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground mb-6">{t('auth.step1of2')}</p>

            <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue} className="mb-6">
              <InputOTPGroup className="gap-1 sm:gap-2">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <InputOTPSlot key={i} index={i} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg bg-secondary border-border" />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <Button onClick={handleVerifyEmail} disabled={otpValue.length < 6 || loading} className="w-full h-12 text-base font-semibold mb-4">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.verifyEmailBtn')}
            </Button>

            <div className="flex gap-4 text-sm">
              <button onClick={() => { if (resendCountdown === 0) startResendTimer(); }}
                className={cn('text-primary hover:underline', resendCountdown > 0 && 'text-muted-foreground pointer-events-none')}>
                {resendCountdown > 0 ? t('auth.resendCodeCountdown', { seconds: resendCountdown }) : t('auth.resendCode')}
              </button>
              <button onClick={() => setStep(2)} className="text-muted-foreground hover:underline">{t('auth.changeEmail')}</button>
            </div>
          </div>
        </AuthBackground>
      );
    }

    return (
      <AuthBackground>
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">{t('auth.verifySms')}</h1>
          <p className="text-sm text-muted-foreground text-center mb-1">
            {t('auth.smsSentTo')} <span className="text-foreground font-medium">{maskPhone(countryCode, phone)}</span>
          </p>
          <p className="text-xs text-muted-foreground mb-6">{t('auth.step2of2')}</p>

          <InputOTP maxLength={6} value={smsOtpValue} onChange={setSmsOtpValue} className="mb-6">
            <InputOTPGroup className="gap-1 sm:gap-2">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <InputOTPSlot key={i} index={i} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg bg-secondary border-border" />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <Button onClick={handleVerifySms} disabled={smsOtpValue.length < 6 || loading} className="w-full h-12 text-base font-semibold mb-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.verifyPhoneBtn')}
          </Button>

          <div className="flex gap-4 text-sm">
            <button onClick={() => { if (smsResendCountdown === 0) startSmsResendTimer(); }}
              className={cn('text-primary hover:underline', smsResendCountdown > 0 && 'text-muted-foreground pointer-events-none')}>
              {smsResendCountdown > 0 ? t('auth.resendSmsCountdown', { seconds: smsResendCountdown }) : t('auth.resendSms')}
            </button>
          </div>
        </div>
      </AuthBackground>
    );
  }

  // STEP 4 — Complete Profile (Social Login)
  if (step === 4) {
    return (
      <AuthBackground>
        <div className="flex flex-col animate-fade-in">
          <span className="block sm:hidden"><Logo variant="full" size={260} className="mb-4 self-center" /></span>
          <span className="hidden sm:block lg:hidden"><Logo variant="full" size={280} className="mb-4 self-center" /></span>
          <span className="hidden lg:block"><Logo variant="full" size={300} className="mb-4 self-center" /></span>
          <h1 className="text-xl font-bold text-foreground mb-1 text-center">{t('auth.completeRegistration')}</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">{t('auth.completeRegistrationDesc')}</p>

          <div className="w-full space-y-3">
            <div className="relative">
              <Input placeholder={t('auth.fullName')} value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                className={cn('h-12 bg-secondary border-border pr-10', errors.name && 'border-destructive')} />
              {name && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✅</span>}
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="relative">
              <Input type="email" placeholder={t('auth.email')} value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                className={cn('h-12 bg-secondary border-border pr-10', errors.email && 'border-destructive')} />
              {email && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✅</span>}
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="border-l-2 border-primary pl-3">
              <PhoneInput countryCode={countryCode} onCountryCodeChange={setCountryCode} phone={phone}
                onPhoneChange={v => { setPhone(v); setErrors(p => ({ ...p, phone: '' })); }} error={errors.phone} />
            </div>

            <div className="border-l-2 border-primary pl-3">
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.backupPassword')} value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  className={cn('h-12 bg-secondary border-border pr-10', errors.password && 'border-destructive')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', strength.color, strength.width)} />
                  </div>
                  <span className="text-xs text-muted-foreground">{strength.label}</span>
                </div>
              )}
              {errors.password
                ? <p className="text-destructive text-xs mt-1">{errors.password}</p>
                : <p className="text-muted-foreground text-xs mt-1">{t('auth.passwordHint')}</p>}

            </div>

            <div className="border-l-2 border-primary pl-3">
              <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.confirmBackupPassword')} value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }}
                className={cn('h-12 bg-secondary border-border', errors.confirmPassword && 'border-destructive')} />
              {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <p className="text-xs text-muted-foreground px-3">
              {t('auth.backupPasswordNote', { provider: socialProvider })}
            </p>

            {accountType === 'dentista' && (
              <div className="border-l-2 border-primary pl-3">
                <Input placeholder={t('auth.orderNumber')} value={orderNumber}
                  onChange={e => { setOrderNumber(e.target.value); setErrors(p => ({ ...p, orderNumber: '' })); }}
                  className={cn('h-12 bg-secondary border-border', errors.orderNumber && 'border-destructive')} />
                {errors.orderNumber && <p className="text-destructive text-xs mt-1">{errors.orderNumber}</p>}
              </div>
            )}

            {accountType === 'clinica' && (
              <>
                <div className="border-l-2 border-primary pl-3">
                  <Input placeholder={t('auth.clinicName')} value={clinicName}
                    onChange={e => { setClinicName(e.target.value); setErrors(p => ({ ...p, clinicName: '' })); }}
                    className={cn('h-12 bg-secondary border-border', errors.clinicName && 'border-destructive')} />
                  {errors.clinicName && <p className="text-destructive text-xs mt-1">{errors.clinicName}</p>}
                </div>
                <div className="border-l-2 border-primary pl-3">
                  <Input placeholder={t('auth.nifNipc')} value={nif}
                    onChange={e => { setNif(e.target.value); setErrors(p => ({ ...p, nif: '' })); }}
                    className={cn('h-12 bg-secondary border-border', errors.nif && 'border-destructive')} />
                  {errors.nif && <p className="text-destructive text-xs mt-1">{errors.nif}</p>}
                </div>
              </>
            )}

            <div className="flex items-start gap-2 pt-1">
              <Checkbox checked={acceptedTerms} onCheckedChange={(v) => { setAcceptedTerms(!!v); setErrors(p => ({ ...p, terms: '' })); }} className="mt-0.5" />
              <label className="text-xs text-muted-foreground leading-relaxed">
                {t('auth.termsAccept')}{' '}
                <Link to="/termos" target="_blank" className="text-primary hover:underline">{t('auth.termsOfService')}</Link> {t('common.and')}{' '}
                <Link to="/privacidade" target="_blank" className="text-primary hover:underline">{t('auth.privacyPolicy')}</Link>
              </label>
            </div>
            {errors.terms && <p className="text-destructive text-xs">{errors.terms}</p>}

            <Button onClick={handleCompleteSocialProfile} disabled={loading} className="w-full h-12 text-base font-semibold mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.finishRegistration')}
            </Button>
          </div>
        </div>
      </AuthBackground>
    );
  }

  // STEP 2 — Registration form
  return (
    <AuthBackground>
      <div className="flex flex-col animate-fade-in">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 self-start">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </button>

        <h1 className="text-xl font-bold text-foreground mb-6 text-center">
          {t('auth.createAccountOf', { type: accountType ? t(`auth.accountTypes.${accountType}`) : '' })}
        </h1>

        <div className="w-full space-y-3">
          <div>
            <Input placeholder={t('auth.fullName')} value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              className={cn('h-12 bg-secondary border-border', errors.name && 'border-destructive')} />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>

          {accountType === 'dentista' && (
            <div>
              <Input placeholder={t('auth.orderNumberFull')} value={orderNumber}
                onChange={e => { setOrderNumber(e.target.value); setErrors(p => ({ ...p, orderNumber: '' })); }}
                className={cn('h-12 bg-secondary border-border', errors.orderNumber && 'border-destructive')} />
              {errors.orderNumber && <p className="text-destructive text-xs mt-1">{errors.orderNumber}</p>}
            </div>
          )}

          {accountType === 'clinica' && (
            <>
              <div>
                <Input placeholder={t('auth.clinicName')} value={clinicName}
                  onChange={e => { setClinicName(e.target.value); setErrors(p => ({ ...p, clinicName: '' })); }}
                  className={cn('h-12 bg-secondary border-border', errors.clinicName && 'border-destructive')} />
                {errors.clinicName && <p className="text-destructive text-xs mt-1">{errors.clinicName}</p>}
              </div>
              <div>
                <Input placeholder={t('auth.nifNipc')} value={nif}
                  onChange={e => { setNif(e.target.value); setErrors(p => ({ ...p, nif: '' })); }}
                  className={cn('h-12 bg-secondary border-border', errors.nif && 'border-destructive')} />
                {errors.nif && <p className="text-destructive text-xs mt-1">{errors.nif}</p>}
              </div>
              <div>
                <Input placeholder={t('auth.address')} value={address}
                  onChange={e => { setAddress(e.target.value); setErrors(p => ({ ...p, address: '' })); }}
                  className={cn('h-12 bg-secondary border-border', errors.address && 'border-destructive')} />
                {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
              </div>
            </>
          )}

          <div>
            <Input type="email" placeholder={t('auth.email')} value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              className={cn('h-12 bg-secondary border-border', errors.email && 'border-destructive')} />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>

          <PhoneInput countryCode={countryCode} onCountryCodeChange={setCountryCode} phone={phone}
            onPhoneChange={v => { setPhone(v); setErrors(p => ({ ...p, phone: '' })); }} error={errors.phone} />

          <div>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.password')} value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                className={cn('h-12 bg-secondary border-border pr-10', errors.password && 'border-destructive')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', strength.color, strength.width)} />
                </div>
                <span className="text-xs text-muted-foreground">{strength.label}</span>
              </div>
            )}
            {errors.password
              ? <p className="text-destructive text-xs mt-1">{errors.password}</p>
              : <p className="text-muted-foreground text-xs mt-1">{t('auth.passwordHint')}</p>}

          </div>

          <div>
            <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.confirmPassword')} value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }}
              className={cn('h-12 bg-secondary border-border', errors.confirmPassword && 'border-destructive')} />
            {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <Input placeholder={t('auth.referralCode')} value={referralCode}
              onChange={e => { setReferralCode(e.target.value); validateReferralCode(e.target.value); }}
              className={cn('h-12 bg-secondary border-border', referralStatus === 'valid' && 'border-green-500', referralStatus === 'invalid' && 'border-destructive')} />
            {referralStatus === 'valid' && (
              <p className="text-green-500 text-xs mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t('auth.referralValid')}</p>
            )}
            {referralStatus === 'invalid' && (
              <p className="text-destructive text-xs mt-1 flex items-center gap-1"><XCircle className="w-3 h-3" /> {t('auth.referralInvalid')}</p>
            )}
          </div>

          <div className="flex items-start gap-2 pt-1">
            <Checkbox checked={acceptedTerms} onCheckedChange={(v) => { setAcceptedTerms(!!v); setErrors(p => ({ ...p, terms: '' })); }} className="mt-0.5" />
            <label className="text-xs text-muted-foreground leading-relaxed">
              {t('auth.termsAccept')}{' '}
              <Link to="/termos" target="_blank" className="text-primary hover:underline">{t('auth.termsOfService')}</Link> {t('common.and')}{' '}
              <Link to="/privacidade" target="_blank" className="text-primary hover:underline">{t('auth.privacyPolicy')}</Link>
            </label>
          </div>
          {errors.terms && <p className="text-destructive text-xs">{errors.terms}</p>}

          <Button onClick={handleCreateAccount} disabled={loading} className="w-full h-12 text-base font-semibold mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('auth.createAccount')}
          </Button>
        </div>

        <div className="flex items-center w-full my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="px-4 text-xs text-muted-foreground">{t('common.or')}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="w-full space-y-3">
          <Button variant="outline" onClick={() => handleSocialLogin('Google')} className="w-full h-11 bg-white text-gray-800 hover:bg-gray-100 border-0 font-medium">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t('auth.continueWithGoogle')}
          </Button>
          <Button onClick={() => handleSocialLogin('Apple')} className="w-full h-11 bg-black text-white hover:bg-black/90 border-0 font-medium">
            <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            {t('auth.continueWithApple')}
          </Button>
          <Button onClick={() => handleSocialLogin('Facebook')} className="w-full h-11 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 border-0 font-medium">
            <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            {t('auth.continueWithFacebook')}
          </Button>
        </div>
      </div>
    </AuthBackground>
  );
}