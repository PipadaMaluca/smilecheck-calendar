import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres');
    if (password !== confirm) return setError('As senhas não coincidem');
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    toast.success('Senha atualizada');
    navigate('/app');
  };

  return (
    <AuthBackground>
      <div className="flex flex-col items-center animate-fade-in w-full">
        <h1 className="text-xl font-bold text-foreground mb-1">Definir nova senha</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">Escolha uma nova senha para a sua conta.</p>
        <div className="w-full space-y-4">
          <Input type="password" placeholder="Nova senha" value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="h-12 bg-secondary border-border" />
          <Input type="password" placeholder="Confirmar nova senha" value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(''); }}
            className="h-12 bg-secondary border-border" />
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-base font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
          </Button>
        </div>
      </div>
    </AuthBackground>
  );
}
