import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket } from 'lucide-react';

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setStarted(true);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let t = 0;
    const step = 16;
    const inc = end / (duration / step);
    const timer = setInterval(() => {
      t += inc;
      if (t >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(t));
      }
    }, step);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

const stats = [
{ end: 5000, prefix: '+', label: 'Pacientes' },
{ end: 500, prefix: '+', label: 'Dentistas' },
{ end: 50, prefix: '+', label: 'Clínicas' },
{ end: 48, prefix: '⭐ ', label: 'Rating médio', isDecimal: true }];


export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center py-0 pt-[5px]">
        <img
          alt="SmileCheck"
          className="h-[280px] sm:h-[340px] mx-auto mb-6 animate-fade-in drop-shadow-[0_0_30px_hsla(207,90%,54%,0.4)] rounded-xl" src="/lovable-uploads/1c9d7b03-a8ca-4808-a83e-ffa366ea351d.png" />
        
        <Badge
          variant="secondary"
          className="mb-6 px-4 py-2 text-sm animate-fade-in cursor-default">
          
          <Rocket className="w-4 h-4 mr-2" />
          Novo — Teleconsultas disponíveis!
        </Badge>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
          O seu sorriso merece{' '}
          <span className="text-primary">o melhor</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
          Gestão de consultas, teleconsultas, pontos e recompensas numa só
          plataforma. Para pacientes, dentistas e clínicas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 animate-fade-in">
          <Button
            size="lg"
            className="text-base px-8 h-12 w-full sm:w-auto"
            onClick={() => navigate('/signup')}>
            
            Criar Conta Grátis
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 h-12 w-full sm:w-auto"
            onClick={() => navigate('/demo')}>
            
            Ver Demonstração
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-16 animate-fade-in">
          Já tem conta?{' '}
          <a
            onClick={() => navigate('/login')}
            className="text-primary hover:underline cursor-pointer">
            
            Entrar
          </a>
        </p>

        {/* Dashboard mockup */}
        <div className="relative mx-auto max-w-3xl animate-fade-in">
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-[hsl(45,93%,47%)]/60" />
              <div className="w-3 h-3 rounded-full bg-[hsl(142,71%,45%)]/60" />
              <span className="ml-2 text-xs text-muted-foreground">
                SmileCheck Dashboard
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
              { label: 'Consultas Hoje', value: '8' },
              { label: '🥇 Nível', value: 'Ouro (1.250 XP)' },
              { label: '⭐ Pontos', value: '850 pts' },
              { label: '🔥 Streak', value: '14 dias' }].
              map((c) =>
              <div
                key={c.label}
                className="rounded-lg bg-muted/50 p-3 text-center">
                
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="text-lg font-bold text-foreground">{c.value}</p>
                </div>
              )}
            </div>
            {/* Mini agenda mockup */}
            <div className="mt-3 rounded-lg bg-muted/30 p-3 sm:p-4 my-[15px]">
              <p className="text-xs text-muted-foreground mb-2">📅 Agenda Semanal</p>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {[
                  { day: 'Seg', blocks: [{ h: 'h-6', color: 'hsl(207,90%,54%)' }, { h: 'h-4', color: 'hsl(36,100%,50%)' }] },
                  { day: 'Ter', blocks: [{ h: 'h-5', color: 'hsl(207,90%,54%)' }, { h: 'h-3', color: 'hsl(122,39%,49%)' }, { h: 'h-4', color: 'hsl(207,90%,54%)' }] },
                  { day: 'Qua', blocks: [{ h: 'h-7', color: 'hsl(207,90%,54%)' }] },
                  { day: 'Qui', blocks: [{ h: 'h-4', color: 'hsl(36,100%,50%)' }, { h: 'h-5', color: 'hsl(207,90%,54%)' }] },
                  { day: 'Sex', blocks: [{ h: 'h-3', color: 'hsl(4,90%,58%)' }, { h: 'h-6', color: 'hsl(207,90%,54%)' }, { h: 'h-3', color: 'hsl(36,100%,50%)' }] },
                ].map((col) => (
                  <div key={col.day} className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground text-center font-medium">{col.day}</span>
                    {col.blocks.map((b, i) => (
                      <div key={i} className={`${b.h} rounded-sm`} style={{ backgroundColor: b.color, opacity: 0.8 }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 w-full max-w-4xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((s) =>
        <StatItem key={s.label} {...s} />
        )}
      </div>
    </section>);

}

function StatItem({
  end,
  prefix,
  label,
  isDecimal





}: {end: number;prefix: string;label: string;isDecimal?: boolean;}) {
  const { count, ref } = useCountUp(end);
  const display = isDecimal ?
  (count / 10).toFixed(1) :
  count.toLocaleString('pt-PT');

  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl sm:text-3xl font-bold text-foreground">
        {prefix}
        {display}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>);

}