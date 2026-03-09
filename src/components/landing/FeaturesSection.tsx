import { useRef, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const patientFeatures = [
  { icon: '📅', title: 'Agendar Consultas', desc: 'Marque presenciais e teleconsultas em segundos' },
  { icon: '⭐', title: 'Ganhar Pontos', desc: 'Cada consulta e bom comportamento ganha pontos. 100 pts = €10' },
  { icon: '🏆', title: 'Conquistas', desc: '35 conquistas para desbloquear e subir de nível' },
  { icon: '🎁', title: 'Recompensas', desc: 'Troque pontos por descontos e produtos' },
  { icon: '❤️', title: 'Saúde Oral', desc: 'Alergias, medicação, vacinas e documentos num só lugar' },
  { icon: '📱', title: 'Teleconsultas', desc: 'Consulte o seu dentista sem sair de casa por €20' },
];

const dentistFeatures = [
  { icon: '📋', title: 'Agenda Inteligente', desc: 'Dia, semana, mês com drag-and-drop e filtros' },
  { icon: '✅', title: 'Confirmações', desc: 'Acompanhe confirmações a 24h e 1h em tempo real' },
  { icon: '💊', title: 'Receitas Digitais', desc: 'Prescreva com verificação automática de alergias' },
  { icon: '📄', title: 'Cartas de Referência', desc: 'Gere cartas com QR code em segundos' },
  { icon: '📊', title: 'Estatísticas', desc: 'Desempenho detalhado com exportação de relatórios' },
  { icon: '🏅', title: 'Rankings', desc: 'Compita no ranking nacional e ganhe prémios' },
];

const clinicFeatures = [
  { icon: '👥', title: 'Gestão de Equipa', desc: 'Acompanhe cada dentista da sua clínica' },
  { icon: '📈', title: 'Dashboard Central', desc: 'Visão geral de toda a operação num ecrã' },
  { icon: '📊', title: 'Relatórios', desc: 'Estatísticas avançadas com exportação PDF/Excel' },
  { icon: '🏆', title: 'Rankings de Clínica', desc: 'Destaque-se no ranking nacional de clínicas' },
  { icon: '⭐', title: 'Reputação', desc: 'Avaliações e classificação pública da clínica' },
  { icon: '📱', title: 'Teleconsultas', desc: 'Monitorize teleconsultas de toda a equipa' },
];

function ScrollReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
    >
      {children}
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tudo o que precisa para a sua saúde oral
            </h2>
            <p className="text-muted-foreground text-lg">
              Uma plataforma, três experiências personalizadas
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 h-auto">
              <TabsTrigger value="patient" className="text-xs sm:text-sm py-2">🦷 Pacientes</TabsTrigger>
              <TabsTrigger value="dentist" className="text-xs sm:text-sm py-2">🦷 Dentistas</TabsTrigger>
              <TabsTrigger value="clinic" className="text-xs sm:text-sm py-2">🏥 Clínicas</TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <FeatureGrid features={patientFeatures} />
            </TabsContent>
            <TabsContent value="dentist">
              <FeatureGrid features={dentistFeatures} />
            </TabsContent>
            <TabsContent value="clinic">
              <FeatureGrid features={clinicFeatures} />
            </TabsContent>
          </Tabs>
        </ScrollReveal>
      </div>
    </section>
  );
}

function FeatureGrid({ features }: { features: typeof patientFeatures }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((f) => (
        <div
          key={f.title}
          className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        >
          <span className="text-3xl mb-3 block">{f.icon}</span>
          <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
          <p className="text-sm text-muted-foreground">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
