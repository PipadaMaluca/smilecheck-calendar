import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const steps = [
{ icon: '📝', title: 'Crie a sua conta', desc: 'Escolha o tipo (Paciente, Dentista ou Clínica) e registe-se em menos de 1 minuto' },
{ icon: '📅', title: 'Agende ou realize consultas', desc: 'Presenciais ou teleconsultas, confirme com um clique' },
{ icon: '🎁', title: 'Ganhe pontos e recompensas', desc: 'Cada ação positiva acumula pontos que valem dinheiro' }];


export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {if (e.isIntersecting) setVisible(true);},
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-20 px-4 bg-muted/30" ref={ref}>
      <div
        className={cn(
          'max-w-4xl mx-auto transition-all duration-700',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
          Simples como sorrir
        </h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Connecting line (desktop) */}
          

          {steps.map((s, i) =>
          <div key={s.title} className="relative text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl relative z-10 border border-primary/20">
                {s.icon}
              </div>
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                Passo {i + 1}
              </span>
              <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground max-w-[260px] mx-auto">
                {s.desc}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>);

}