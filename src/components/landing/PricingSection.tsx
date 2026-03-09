import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  name: string;
  monthly: number;
  annual: number;
  badge?: string;
  badgeColor?: string;
  features: string[];
  warning?: string;
}

const patientPlans: Plan[] = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    features: [
      'Agendar consultas',
      'Ganhar pontos',
      'Loja de recompensas',
      'Perfil de saúde básico',
      'Com anúncios',
    ],
    warning: 'Reset anual de pontos',
  },
  {
    name: 'Pro',
    monthly: 4.99,
    annual: 4.24,
    badge: 'Popular',
    features: [
      'Tudo do Free',
      'Sem anúncios',
      'Mantém pontos acumulados',
      '13 cores de tema editáveis',
      'Conquistas exclusivas',
      'Histórico completo',
    ],
  },
  {
    name: 'Premium',
    monthly: 9.99,
    annual: 8.49,
    badge: 'Melhor',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    features: [
      'Tudo do Pro',
      'RGB completo (todas as cores)',
      'Bónus +10% em pontos',
      'Badge exclusivo Premium',
      'Suporte prioritário',
      'Teleconsultas com desconto',
    ],
  },
];

const dentistPlans: Plan[] = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    features: [
      'Agenda básica',
      'Até 20 consultas/mês',
      'Confirmações manuais',
      'Perfil público básico',
    ],
    warning: 'Reset anual de pontos',
  },
  {
    name: 'Pro',
    monthly: 19.99,
    annual: 17.0,
    badge: 'Popular',
    features: [
      'Consultas ilimitadas',
      'Confirmações automáticas',
      'Receitas digitais',
      'Cartas de referência',
      'Estatísticas detalhadas',
      'Rankings e conquistas',
    ],
  },
  {
    name: 'Premium',
    monthly: 29.99,
    annual: 25.49,
    badge: 'Melhor',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    features: [
      'Tudo do Pro',
      'Teleconsultas integradas',
      'Exportação avançada',
      'API de integração',
      'Suporte prioritário',
      'Personalização completa',
    ],
  },
];

const clinicPlans: Plan[] = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    features: [
      'Até 2 dentistas',
      'Dashboard básico',
      'Relatórios mensais',
      'Gestão de equipa básica',
    ],
    warning: 'Reset anual de pontos',
  },
  {
    name: 'Pro',
    monthly: 39.99,
    annual: 34.0,
    badge: 'Popular',
    features: [
      'Até 10 dentistas',
      'Dashboard completo',
      'Relatórios semanais',
      'Estatísticas avançadas',
      'Rankings de clínica',
      'Exportação PDF/Excel',
    ],
  },
  {
    name: 'Premium',
    monthly: 49.99,
    annual: 42.49,
    badge: 'Melhor',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    features: [
      'Dentistas ilimitados',
      'Tudo do Pro',
      'Teleconsultas de equipa',
      'API de integração',
      'Suporte dedicado',
      'Multi-localização',
    ],
  },
];

export function PricingSection() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="planos" className="py-20 px-4" ref={ref}>
      <div
        className={cn(
          'max-w-6xl mx-auto transition-all duration-700',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Planos para todos
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Comece grátis, evolua quando quiser
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={cn('text-sm', !annual && 'font-semibold text-foreground')}>
              Mensal
            </span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={cn('text-sm', annual && 'font-semibold text-foreground')}>
              Anual
            </span>
            {annual && (
              <Badge variant="secondary" className="ml-1 text-xs">
                -15%
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full max-w-sm mx-auto grid-cols-3 mb-8 h-auto">
            <TabsTrigger value="patient" className="text-xs sm:text-sm py-2">Paciente</TabsTrigger>
            <TabsTrigger value="dentist" className="text-xs sm:text-sm py-2">Dentista</TabsTrigger>
            <TabsTrigger value="clinic" className="text-xs sm:text-sm py-2">Clínica</TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <PlanGrid plans={patientPlans} annual={annual} onCta={() => navigate('/signup')} />
          </TabsContent>
          <TabsContent value="dentist">
            <PlanGrid plans={dentistPlans} annual={annual} onCta={() => navigate('/signup')} />
          </TabsContent>
          <TabsContent value="clinic">
            <PlanGrid plans={clinicPlans} annual={annual} onCta={() => navigate('/signup')} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function PlanGrid({
  plans,
  annual,
  onCta,
}: {
  plans: Plan[];
  annual: boolean;
  onCta: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {plans.map((plan) => {
        const price = annual ? plan.annual : plan.monthly;
        const isPopular = plan.badge === 'Popular';

        return (
          <div
            key={plan.name}
            className={cn(
              'relative rounded-xl border p-6 flex flex-col transition-all duration-300',
              isPopular
                ? 'border-primary bg-card shadow-lg shadow-primary/10 scale-[1.02]'
                : 'border-border bg-card hover:border-primary/30'
            )}
          >
            {plan.badge && (
              <Badge
                className={cn(
                  'absolute -top-3 left-1/2 -translate-x-1/2 text-xs border-0',
                  plan.badge === 'Melhor'
                    ? 'bg-amber-500 text-white'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                {plan.badge}
              </Badge>
            )}

            <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>

            <div className="mb-4">
              {price === 0 ? (
                <span className="text-3xl font-bold text-foreground">Grátis</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-foreground">
                    €{price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </>
              )}
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            {plan.warning && (
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-4">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {plan.warning}
              </div>
            )}

            <Button
              variant={isPopular ? 'default' : 'outline'}
              className="w-full"
              onClick={onCta}
            >
              Começar
            </Button>
          </div>
        );
      })}
    </div>
  );
}
