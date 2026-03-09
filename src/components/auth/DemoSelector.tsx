import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, Building2 } from 'lucide-react';
import { AuthBackground } from './AuthBackground';
import smileLogo from '@/assets/smilecheck-logo-full.png';

const options = [
{ icon: User, label: 'Paciente João Silva', path: '/app?role=patient' },
{ icon: Stethoscope, label: 'Dentista Dr. Gonçalo Pipo', path: '/app?role=dentist' },
{ icon: Building2, label: 'Clínica SmileCheck', path: '/app?role=clinic' }];


export function DemoSelector() {
  const navigate = useNavigate();

  return (
    <AuthBackground>
      <div className="flex flex-col items-center animate-fade-in">
        <img alt="SmileCheck" className="h-[360px] mb-8" src="/lovable-uploads/c41b8483-58c0-4db7-821d-98165cf10c96.png" />
        <h1 className="text-xl font-bold text-foreground mb-1">Modo Demo</h1>
        <p className="text-sm text-muted-foreground mb-6">Escolha o perfil para explorar</p>

        <div className="w-full space-y-3">
          {options.map((o) =>
          <button
            key={o.path}
            onClick={() => {
              // Reset splash flag so video shows on each demo entry
              const role = o.path.split('role=')[1];
              if (role) localStorage.removeItem(`smilecheck_video_splash_${role}`);
              navigate(o.path);
            }}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border hover:border-primary hover:bg-accent transition-all">
            
              <o.icon className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">{o.label}</span>
            </button>
          )}
        </div>

        <button onClick={() => navigate('/login')} className="mt-6 text-sm text-muted-foreground hover:text-foreground">
          Voltar ao login
        </button>
      </div>
    </AuthBackground>);

}