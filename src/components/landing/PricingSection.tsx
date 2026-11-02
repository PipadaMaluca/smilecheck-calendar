import { formatCurrency } from '@/lib/formatters';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { CLINIC_DENTIST_LIMIT, commissionPercent, type PlanTier } from '@/lib/planRules';

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

  const arr = (key: string) => t(key, { returnObjects: true }) as string[];
  const tele = (tier: PlanTier) => [t('plan.features.teleCommission', { pct: commissionPercent(tier) }), ...arr(`landing.pricing.dentist${tier[0].toUpperCase()}${tier.slice(1)}`)];
  const limit = (tier: PlanTier) => {
    const n = CLINIC_DENTIST_LIMIT[tier];
    return [n === null ? t('plan.features.unlimitedDentists') : t('plan.features.dentistLimit', { count: n }), ...arr(`landing.pricing.clinic${tier[0].toUpperCase()}${tier.slice(1)}`)];
  };

  const patientPlans: Plan[] = [
    { name: 'Free', monthly: 0, annual: 0, features: t('landing.pricing.patientFree', { returnObjects: true }) as string[], warning: t('landing.pricing.patientFreeWarning') },
    { name: 'Pro', monthly: 4.99, annual: 4.24, badge: t('landing.pricing.popular'), features: t('landing.pricing.patientPro', { returnObjects: true }) as string[] },
    { name: 'Premium', monthly: 9.99, annual: 8.49, badge: t('landing.pricing.best'), badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', features: t('landing.pricing.patientPremium', { returnObjects: true }) as string[] },
  ];

  const dentistPlans: Plan[] = [
    { name: 'Free', monthly: 0, annual: 0, features: tele('free'), warning: t('landing.pricing.dentistFreeWarning') },
    { name: 'Pro', monthly: 19.99, annual: 17.0, badge: t('landing.pricing.popular'), features: tele('pro') },
    { name: 'Premium', monthly: 29.99, annual: 25.49, badge: t('landing.pricing.best'), badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', features: tele('premium') },
  ];

  const clinicPlans: Plan[] = [
    { name: 'Free', monthly: 0, annual: 0, features: limit('free'), warning: t('landing.pricing.clinicFreeWarning') },
    { name: 'Pro', monthly: 39.99, annual: 34.0, badge: t('landing.pricing.popular'), features: limit('pro') },
    { name: 'Premium', monthly: 49.99, annual: 42.49, badge: t('landing.pricing.best'), badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20', features: limit('premium') },
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    // Fallback: never leave on-screen content hidden if the observer is slow (background tab, slow device) or motion is reduced.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setVisible(true);
    const fallback = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) setVisible(true);
    }, 1500);
    return () => { obs.disconnect(); window.clearTimeout(fallback); };
  }, []);

  return (
    <section id="planos" className="py-8 sm:py-12 md:py-14 px-6 md:px-10 bg-white dark:bg-background" ref={ref}>
      <div className={cn('max-w-6xl mx-auto transition-[transform,background-color,border-color,color,box-shadow] duration-300', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        <div className="text-center mb-8">
          <h2 id="planos-title" style={{ scrollMarginTop: '120px' }} className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5">{t('landing.pricing.title')}</h2>
          <p className="text-base sm:text-xl font-light text-muted-foreground mb-8 max-w-[90%] sm:max-w-xl mx-auto">{t('landing.pricing.subtitle')}</p>

          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <div
              role="tablist"
              aria-label={t('landing.pricing.title')}
              className="inline-flex items-center p-1 rounded-full bg-background dark:bg-card border border-border shadow-[0_2px_8px_rgba(33,150,243,0.06)]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!annual}
                onClick={() => setAnnual(false)}
                className={cn(
                  'px-5 py-1.5 text-sm rounded-full transition-colors',
                  !annual
                    ? 'bg-primary-solid text-white font-semibold shadow-[0_2px_8px_rgba(33,150,243,0.35)]'
                    : 'text-muted-foreground hover:text-foreground dark:hover:text-white'
                )}
              >
                {t('landing.pricing.monthly')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={annual}
                onClick={() => setAnnual(true)}
                className={cn(
                  'px-5 py-1.5 text-sm rounded-full transition-colors',
                  annual
                    ? 'bg-primary-solid text-white font-semibold shadow-[0_2px_8px_rgba(33,150,243,0.35)]'
                    : 'text-muted-foreground hover:text-foreground dark:hover:text-white'
                )}
              >
                {t('landing.pricing.annual')}
              </button>
            </div>
            {annual && <Badge className="text-xs bg-primary-solid text-white border-0">{t('landing.pricing.discount')}</Badge>}
          </div>
        </div>

        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6 h-auto bg-transparent p-0 border-b border-border rounded-none gap-0">
            <TabsTrigger
              value="patient"
              className="text-sm py-3 rounded-none border-b-2 border-transparent text-muted-foreground hover:text-muted-foreground dark:hover:text-white data-[state=active]:bg-accent dark:data-[state=active]:bg-accent/60 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:font-bold transition-colors"
            >{t('landing.pricing.patient')}</TabsTrigger>
            <TabsTrigger
              value="dentist"
              className="text-sm py-3 rounded-none border-b-2 border-transparent text-muted-foreground hover:text-muted-foreground dark:hover:text-white data-[state=active]:bg-accent dark:data-[state=active]:bg-accent/60 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:font-bold transition-colors"
            >{t('landing.pricing.dentist')}</TabsTrigger>
            <TabsTrigger
              value="clinic"
              className="text-sm py-3 rounded-none border-b-2 border-transparent text-muted-foreground hover:text-muted-foreground dark:hover:text-white data-[state=active]:bg-accent dark:data-[state=active]:bg-accent/60 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:font-bold transition-colors"
            >{t('landing.pricing.clinic')}</TabsTrigger>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto sc-perspective">
      {plans.map((plan) => {
        const price = annual ? plan.annual : plan.monthly;
        const isPopular = plan.badge === popularLabel;
        const isBest = plan.badge === t('landing.pricing.best');

        if (isBest) {
          return (
            <div
              key={plan.name}
              data-anim="tilt-card"
              className="sc-float-card relative rounded-2xl border-2 border-[#1565C0] bg-white dark:bg-card hover:shadow-[0_16px_40px_rgba(21,101,192,0.35)] transition-[transform,background-color,border-color,color,box-shadow] duration-150 shadow-[0_4px_20px_rgba(21,101,192,0.18)]"
            >
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-xs border-0 bg-gradient-to-r from-primary to-primary/80 text-white shadow-md">
                {plan.badge}
              </Badge>
              <div className="rounded-2xl p-6 flex flex-col h-full">
                <PlanContent plan={plan} price={price} onCta={onCta} accent />
              </div>
            </div>
          );
        }

        return (
          <div key={plan.name} data-anim="tilt-card" className={cn(
            'sc-float-card relative rounded-2xl p-6 flex flex-col transition-colors duration-150 bg-white dark:bg-card',
            isPopular
              ? 'border-2 border-primary shadow-[0_4px_16px_rgba(33,150,243,0.12)]'
              : 'border border-border hover:shadow-xl hover:shadow-primary/5'
          )}>
            {plan.badge && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs border-0 bg-primary-solid text-white shadow-md">
                {plan.badge}
              </Badge>
            )}
            <PlanContent plan={plan} price={price} onCta={onCta} accent={isPopular} />
          </div>
        );
      })}
    </div>
  );
}

function PlanContent({ plan, price, onCta, accent }: { plan: Plan; price: number; onCta: () => void; accent?: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
      <div className="mb-6">
        {price === 0 ? (
          <span className="text-4xl leading-none font-bold text-foreground">{t('landing.pricing.free')}</span>
        ) : (
          <>
            <span className="text-4xl leading-none font-bold text-foreground">{formatCurrency(price)}</span>
            <span className="text-sm text-muted-foreground ml-1">{t('landing.pricing.perMonth')}</span>
          </>
        )}
      </div>
      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" strokeWidth={3} />
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>
      {plan.warning && (
        <div className="flex items-center gap-2 text-xs text-warning bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-4">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {plan.warning}
        </div>
      )}
      <Button
        onClick={onCta}
        className={cn(
          'w-full rounded-full font-semibold transition-colors',
          accent
            ? 'bg-primary hover:bg-primary/90 text-white shadow-[0_4px_14px_rgba(33,150,243,0.3)] hover:shadow-[0_6px_20px_rgba(33,150,243,0.4)]'
            : 'bg-white dark:bg-transparent border-2 border-primary text-primary hover:bg-primary/10'
        )}
      >
        {t('landing.pricing.start')}
      </Button>
    </>
  );
}