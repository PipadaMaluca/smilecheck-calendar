import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Plan {
  name: string;
  monthly: number;
  annual: number;
  badge?: string;
  badgeColor?: string;
  features: string[];
  warning?: string;
}

export function PricingSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [annual, setAnnual] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const patientPlans: Plan[] = [
    { name: 'Free', monthly: 0, annual: 0, features: t('landing.pricing.patientFree', { returnObjects: true }) as string[], warning: t('landing.pricing.patientFreeWarning') },
    { name: 'Pro', monthly: 4.99, annual: 4.24, badge: t('landing.pricing.popular'), features: t('landing.pricing.patientPro', { returnObjects: true }) as string[] },
    { name: 'Premium', monthly: 9.99, annual: 8.49, badge: t('landing.pricing.best'), badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', features: t('landing.pricing.patientPremium', { returnObjects: true }) as string[] },
  ];

  const dentistPlans: Plan[] = [
    { name: 'Free', monthly: 0, annual: 0, features: t('landing.pricing.dentistFree', { returnObjects: true }) as string[], warning: t('landing.pricing.dentistFreeWarning') },
    { name: 'Pro', monthly: 19.99, annual: 17.0, badge: t('landing.pricing.popular'), features: t('landing.pricing.dentistPro', { returnObjects: true }) as string[] },
    { name: 'Premium', monthly: 29.99, annual: 25.49, badge: t('landing.pricing.best'), badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', features: t('landing.pricing.dentistPremium', { returnObjects: true }) as string[] },
  ];

  const clinicPlans: Plan[] = [
    { name: 'Free', monthly: 0, annual: 0, features: t('landing.pricing.clinicFree', { returnObjects: true }) as string[], warning: t('landing.pricing.clinicFreeWarning') },
    { name: 'Pro', monthly: 39.99, annual: 34.0, badge: t('landing.pricing.popular'), features: t('landing.pricing.clinicPro', { returnObjects: true }) as string[] },
    { name: 'Premium', monthly: 49.99, annual: 42.49, badge: t('landing.pricing.best'), badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', features: t('landing.pricing.clinicPremium', { returnObjects: true }) as string[] },
  ];

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
      <div className={cn('max-w-6xl mx-auto transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('landing.pricing.title')}</h2>
          <p className="text-muted-foreground text-lg mb-6">{t('landing.pricing.subtitle')}</p>

          <div className="flex items-center justify-center gap-3">
            <span className={cn('text-sm', !annual && 'font-semibold text-foreground')}>{t('landing.pricing.monthly')}</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={cn('text-sm', annual && 'font-semibold text-foreground')}>{t('landing.pricing.annual')}</span>
            {annual && <Badge variant="secondary" className="ml-1 text-xs">{t('landing.pricing.discount')}</Badge>}
          </div>
        </div>

        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full max-w-sm mx-auto grid-cols-3 mb-8 h-auto">
            <TabsTrigger value="patient" className="text-xs sm:text-sm py-2">{t('landing.pricing.patient')}</TabsTrigger>
            <TabsTrigger value="dentist" className="text-xs sm:text-sm py-2">{t('landing.pricing.dentist')}</TabsTrigger>
            <TabsTrigger value="clinic" className="text-xs sm:text-sm py-2">{t('landing.pricing.clinic')}</TabsTrigger>
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

function PlanGrid({ plans, annual, onCta }: { plans: Plan[]; annual: boolean; onCta: () => void }) {
  const { t } = useTranslation();
  const popularLabel = t('landing.pricing.popular');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
      {plans.map((plan) => {
        const price = annual ? plan.annual : plan.monthly;
        const isPopular = plan.badge === popularLabel;

        return (
          <div key={plan.name} className={cn(
            'relative rounded-xl border p-6 flex flex-col transition-all duration-300',
            isPopular ? 'border-primary bg-card shadow-lg shadow-primary/10 scale-[1.02]' : 'border-border bg-card hover:border-primary/30'
          )}>
            {plan.badge && (
              <Badge className={cn(
                'absolute -top-3 left-1/2 -translate-x-1/2 text-xs border-0',
                plan.badge === t('landing.pricing.best') ? 'bg-amber-500 text-white' : 'bg-primary text-primary-foreground'
              )}>
                {plan.badge}
              </Badge>
            )}

            <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>

            <div className="mb-4">
              {price === 0 ? (
                <span className="text-3xl font-bold text-foreground">{t('landing.pricing.free')}</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-foreground">€{price.toFixed(2).replace('.', ',')}</span>
                  <span className="text-sm text-muted-foreground">{t('landing.pricing.perMonth')}</span>
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

            <Button variant={isPopular ? 'default' : 'outline'} className="w-full" onClick={onCta}>
              {t('landing.pricing.start')}
            </Button>
          </div>
        );
      })}
    </div>
  );
}