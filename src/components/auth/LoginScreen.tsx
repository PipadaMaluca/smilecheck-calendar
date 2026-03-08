import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthBackground } from './AuthBackground';
import { cn } from '@/lib/utils';

const logoSrc = '/assets/smilecheck-logo-horizontal.png';

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    if (!password) e.password = 'Password é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    // Simulate login
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    navigate('/');
  };

  return (
    <AuthBackground>
      <div className="flex flex-col items-center animate-fade-in">
        {/* Logo */}
        <img src="/assets/smilecheck-logo-vertical.png" alt="SmileCheck" className="h-[280px] sm:h-[340px] mb-2" />
        <p className="text-muted-foreground text-sm mb-8">O seu sorriso, a nossa prioridade</p>

        {/* Form */}
        <div className="w-full space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
              className={cn('h-12 bg-secondary border-border', errors.email && 'border-destructive')}
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                className={cn('h-12 bg-secondary border-border pr-10', errors.password && 'border-destructive')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-primary hover:underline"
            >
              Esqueceu a password?
            </button>
          </div>

          <Button onClick={handleLogin} disabled={loading} className="w-full h-12 text-base font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center w-full my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="px-4 text-xs text-muted-foreground">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social buttons */}
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

        {/* Bottom link */}
        <p className="mt-8 text-sm text-muted-foreground">
          Não tem conta?{' '}
          <button onClick={() => navigate('/signup')} className="text-primary hover:underline font-medium">
            Criar conta
          </button>
        </p>

        {/* Demo mode */}
        <button
          onClick={() => navigate('/demo')}
          className="mt-4 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          Demo
        </button>
      </div>
    </AuthBackground>
  );
}
