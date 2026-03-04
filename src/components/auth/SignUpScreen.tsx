import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Stethoscope, Building2, Eye, EyeOff, Loader2, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { AuthBackground } from './AuthBackground';
import smileLogo from '@/assets/smilecheck-logo-full.png';
import { cn } from '@/lib/utils';

type AccountType = 'paciente' | 'dentista' | 'clinica' | null;

const accountTypes = [
  { value: 'paciente' as const, icon: User, title: 'Paciente', desc: 'Gerir consultas, pontos e saúde oral' },
  { value: 'dentista' as const, icon: Stethoscope, title: 'Dentista', desc: 'Gerir agenda, pacientes e teleconsultas' },
  { value: 'clinica' as const, icon: Building2, title: 'Clínica', desc: 'Gerir equipa, estatísticas e operações' },
];

function getPasswordStrength(p: string): { label: string; color: string; width: string } {
  if (p.length < 6) return { label: 'Fraca', color: 'bg-destructive', width: 'w-1/3' };
  if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Média', color: 'bg-yellow-500', width: 'w-2/3' };
  return { label: 'Forte', color: 'bg-green-500', width: 'w-full' };
}

export function SignUpScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [nif, setNif] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const titleMap = { paciente: 'Paciente', dentista: 'Dentista', clinica: 'Clínica' };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nome é obrigatório';
    if (!email.trim()) e.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    if (!password) e.password = 'Password é obrigatória';
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords não coincidem';
    if (!acceptedTerms) e.terms = 'Deve aceitar os termos';
    if (accountType === 'dentista' && !orderNumber.trim()) e.orderNumber = 'Número da Ordem é obrigatório';
    if (accountType === 'clinica') {
      if (!clinicName.trim()) e.clinicName = 'Nome da clínica é obrigatório';
      if (!nif.trim()) e.nif = 'NIF é obrigatório';
      if (!address.trim()) e.address = 'Morada é obrigatória';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep(3);
    startResendTimer();
  };

  const startResendTimer = () => {
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (otpValue.length < 6) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    navigate('/');
  };

  const strength = getPasswordStrength(password);

  // STEP 1 — Account type selection
  if (step === 1) {
    return (
      <AuthBackground>
        <div className="flex flex-col items-center animate-fade-in">
          <img src={smileLogo} alt="SmileCheck" className="w-full max-w-[280px] mb-6" />
          <h1 className="text-xl font-bold text-foreground mb-1">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mb-6">Escolha o tipo de conta</p>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {accountTypes.map(t => (
              <button
                key={t.value}
                onClick={() => setAccountType(t.value)}
                className={cn(
                  'flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 bg-secondary hover:bg-accent',
                  accountType === t.value ? 'border-primary shadow-[0_0_15px_hsl(207_90%_54%/0.3)]' : 'border-border'
                )}
              >
                <t.icon className={cn('w-8 h-8 mb-2', accountType === t.value ? 'text-primary' : 'text-muted-foreground')} />
                <span className="font-semibold text-sm text-foreground">{t.title}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">{t.desc}</span>
              </button>
            ))}
          </div>

          <Button onClick={() => setStep(2)} disabled={!accountType} className="w-full h-12 text-base font-semibold">
            Continuar
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            Já tem conta?{' '}
            <button onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">Entrar</button>
          </p>
        </div>
      </AuthBackground>
    );
  }

  // STEP 3 — Email verification
  if (step === 3) {
    return (
      <AuthBackground>
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">Verifique o seu email</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enviámos um código de verificação para <span className="text-foreground font-medium">{email}</span>
          </p>

          <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue} className="mb-6">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <InputOTPSlot key={i} index={i} className="w-12 h-14 text-lg bg-secondary border-border" />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <Button onClick={handleVerify} disabled={otpValue.length < 6 || loading} className="w-full h-12 text-base font-semibold mb-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar'}
          </Button>

          <div className="flex gap-4 text-sm">
            <button
              onClick={() => { if (resendCountdown === 0) startResendTimer(); }}
              className={cn('text-primary hover:underline', resendCountdown > 0 && 'text-muted-foreground pointer-events-none')}
            >
              {resendCountdown > 0 ? `Reenviar código (${resendCountdown}s)` : 'Reenviar código'}
            </button>
            <button onClick={() => setStep(2)} className="text-muted-foreground hover:underline">
              Alterar email
            </button>
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
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <h1 className="text-xl font-bold text-foreground mb-6 text-center">
          Criar Conta de {titleMap[accountType!]}
        </h1>

        <div className="w-full space-y-3">
          {/* Common fields */}
          <div>
            <Input placeholder="Nome completo" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              className={cn('h-12 bg-secondary border-border', errors.name && 'border-destructive')} />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Dentista extra fields */}
          {accountType === 'dentista' && (
            <div>
              <Input placeholder="Número da Ordem dos Médicos Dentistas" value={orderNumber}
                onChange={e => { setOrderNumber(e.target.value); setErrors(p => ({ ...p, orderNumber: '' })); }}
                className={cn('h-12 bg-secondary border-border', errors.orderNumber && 'border-destructive')} />
              {errors.orderNumber && <p className="text-destructive text-xs mt-1">{errors.orderNumber}</p>}
            </div>
          )}

          {/* Clinica extra fields */}
          {accountType === 'clinica' && (
            <>
              <div>
                <Input placeholder="Nome da Clínica" value={clinicName}
                  onChange={e => { setClinicName(e.target.value); setErrors(p => ({ ...p, clinicName: '' })); }}
                  className={cn('h-12 bg-secondary border-border', errors.clinicName && 'border-destructive')} />
                {errors.clinicName && <p className="text-destructive text-xs mt-1">{errors.clinicName}</p>}
              </div>
              <div>
                <Input placeholder="NIF / NIPC" value={nif}
                  onChange={e => { setNif(e.target.value); setErrors(p => ({ ...p, nif: '' })); }}
                  className={cn('h-12 bg-secondary border-border', errors.nif && 'border-destructive')} />
                {errors.nif && <p className="text-destructive text-xs mt-1">{errors.nif}</p>}
              </div>
              <div>
                <Input placeholder="Morada" value={address}
                  onChange={e => { setAddress(e.target.value); setErrors(p => ({ ...p, address: '' })); }}
                  className={cn('h-12 bg-secondary border-border', errors.address && 'border-destructive')} />
                {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
              </div>
            </>
          )}

          <div>
            <Input type="email" placeholder="Email" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              className={cn('h-12 bg-secondary border-border', errors.email && 'border-destructive')} />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password}
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
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <Input type={showPassword ? 'text' : 'password'} placeholder="Confirmar password" value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }}
              className={cn('h-12 bg-secondary border-border', errors.confirmPassword && 'border-destructive')} />
            {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-start gap-2 pt-1">
            <Checkbox
              checked={acceptedTerms}
              onCheckedChange={(v) => { setAcceptedTerms(!!v); setErrors(p => ({ ...p, terms: '' })); }}
              className="mt-0.5"
            />
            <label className="text-xs text-muted-foreground leading-relaxed">
              Li e aceito os{' '}
              <span className="text-primary hover:underline cursor-pointer">Termos de Serviço</span> e{' '}
              <span className="text-primary hover:underline cursor-pointer">Política de Privacidade</span>
            </label>
          </div>
          {errors.terms && <p className="text-destructive text-xs">{errors.terms}</p>}

          <Button onClick={handleCreateAccount} disabled={loading} className="w-full h-12 text-base font-semibold mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Conta'}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center w-full my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="px-4 text-xs text-muted-foreground">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social */}
        <div className="w-full space-y-3">
          <Button variant="outline" className="w-full h-11 bg-white text-gray-800 hover:bg-gray-100 border-0 font-medium">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuar com Google
          </Button>
          <Button className="w-full h-11 bg-black text-white hover:bg-black/90 border-0 font-medium">
            <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Continuar com Apple
          </Button>
          <Button className="w-full h-11 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 border-0 font-medium">
            <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continuar com Facebook
          </Button>
        </div>
      </div>
    </AuthBackground>
  );
}
