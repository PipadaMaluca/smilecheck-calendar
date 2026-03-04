import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthBackground } from './AuthBackground';
import { cn } from '@/lib/utils';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Introduza um email válido');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthBackground>
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">Email Enviado</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Verifique o seu email para instruções de recuperação
          </p>
          <Button onClick={() => navigate('/login')} className="w-full h-12 text-base font-semibold">
            Voltar ao login
          </Button>
        </div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <div className="flex flex-col items-center animate-fade-in">
        <h1 className="text-xl font-bold text-foreground mb-1">Recuperar Password</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Introduza o seu email para receber instruções
        </p>

        <div className="w-full space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              className={cn('h-12 bg-secondary border-border', error && 'border-destructive')}
            />
            {error && <p className="text-destructive text-xs mt-1">{error}</p>}
          </div>

          <Button onClick={handleSend} disabled={loading} className="w-full h-12 text-base font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
          </Button>
        </div>

        <button onClick={() => navigate('/login')} className="mt-6 text-sm text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Voltar ao login
        </button>
      </div>
    </AuthBackground>
  );
}
