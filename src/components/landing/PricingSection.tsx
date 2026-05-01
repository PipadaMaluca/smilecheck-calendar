import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <section id="planos" className="py-24 sm:py-32 px-4 bg-white dark:bg-background" ref={ref}>
      <div className={cn('max-w-6xl mx-auto transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A202C] dark:text-white mb-5">{t('landing.pricing.title')}</h2>
          <p className="text-lg sm:text-xl font-light text-[#4A5568] dark:text-[#94A3B8] mb-8 max-w-xl mx-auto">{t('landing.pricing.subtitle')}</p>

          <div className="inline-flex items-center gap-2">
            <div
              role="tablist"
              aria-label={t('landing.pricing.title')}
              className="inline-flex items-center p-1 rounded-full bg-[#F5F9FF] dark:bg-[#0D2137] border border-[#D6E4F0] dark:border-[#1E3A5F] shadow-[0_2px_8px_rgba(33,150,243,0.06)]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!annual}
                onClick={() => setAnnual(false)}
                className={cn(
                  'px-5 py-1.5 text-sm rounded-full transition-all',
                  !annual
                    ? 'bg-[#2196F3] text-white font-semibold shadow-[0_2px_8px_rgba(33,150,243,0.35)]'
                    : 'text-[#4A5568] dark:text-[#94A3B8] hover:text-[#1A202C] dark:hover:text-white'
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
                  'px-5 py-1.5 text-sm rounded-full transition-all',
                  annual
                    ? 'bg-[#2196F3] text-white font-semibold shadow-[0_2px_8px_rgba(33,150,243,0.35)]'
                    : 'text-[#4A5568] dark:text-[#94A3B8] hover:text-[#1A202C] dark:hover:text-white'
                )}
              >
                {t('landing.pricing.annual')}
              </button>
            </div>
            {annual && <Badge className="text-xs bg-[#2196F3] text-white border-0">{t('landing.pricing.discount')}</Badge>}
          </div>
        </div>

        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-10 h-auto bg-transparent p-0 border-b border-[#E2E8F0] dark:border-[#1E3A5F] rounded-none gap-0">
            <TabsTrigger
              value="patient"
              className="text-sm py-3 rounded-none border-b-2 border-transparent text-[#94A3B8] hover:text-[#4A5568] dark:hover:text-white data-[state=active]:bg-[#EBF4FF] dark:data-[state=active]:bg-[#1E3A5F]/60 data-[state=active]:text-[#2196F3] data-[state=active]:border-[#2196F3] data-[state=active]:font-bold transition-colors"
            >{t('landing.pricing.patient')}</TabsTrigger>
            <TabsTrigger
              value="dentist"
              className="text-sm py-3 rounded-none border-b-2 border-transparent text-[#94A3B8] hover:text-[#4A5568] dark:hover:text-white data-[state=active]:bg-[#EBF4FF] dark:data-[state=active]:bg-[#1E3A5F]/60 data-[state=active]:text-[#2196F3] data-[state=active]:border-[#2196F3] data-[state=active]:font-bold transition-colors"
            >{t('landing.pricing.dentist')}</TabsTrigger>
            <TabsTrigger
              value="clinic"
              className="text-sm py-3 rounded-none border-b-2 border-transparent text-[#94A3B8] hover:text-[#4A5568] dark:hover:text-white data-[state=active]:bg-[#EBF4FF] dark:data-[state=active]:bg-[#1E3A5F]/60 data-[state=active]:text-[#2196F3] data-[state=active]:border-[#2196F3] data-[state=active]:font-bold transition-colors"
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
      {plans.map((plan) => {
        const price = annual ? plan.annual : plan.monthly;
        const isPopular = plan.badge === popularLabel;
        const isBest = plan.badge === t('landing.pricing.best');

        if (isBest) {
          return (
            <div
              key={plan.name}
              className="relative rounded-2xl border-2 border-[#1565C0] bg-white dark:bg-[#0D2137] hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_rgba(21,101,192,0.18)] hover:shadow-[0_8px_32px_rgba(21,101,192,0.28)]"
            >
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-xs border-0 bg-gradient-to-r from-[#2196F3] to-[#1565C0] text-white shadow-md">
                {plan.badge}
              </Badge>
              <div className="rounded-2xl p-8 flex flex-col h-full">
                <PlanContent plan={plan} price={price} onCta={onCta} accent />
              </div>
            </div>
          );
        }

        return (
          <div key={plan.name} className={cn(
            'relative rounded-2xl p-8 flex flex-col transition-all duration-300 bg-white dark:bg-[#0D2137] hover:-translate-y-1',
            isPopular
              ? 'border-2 border-[#2196F3] shadow-[0_4px_16px_rgba(33,150,243,0.12)]'
              : 'border border-[#E2E8F0] dark:border-[#1E3A5F] hover:shadow-xl hover:shadow-[#2196F3]/5'
          )}>
            {plan.badge && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs border-0 bg-[#2196F3] text-white shadow-md">
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
      <h3 className="text-xl font-bold text-[#1A202C] dark:text-white mb-2">{plan.name}</h3>
      <div className="mb-6">
        {price === 0 ? (
          <span className="text-[40px] leading-none font-bold text-[#1A202C] dark:text-white">{t('landing.pricing.free')}</span>
        ) : (
          <>
            <span className="text-[40px] leading-none font-bold text-[#1A202C] dark:text-white">€{price.toFixed(2).replace('.', ',')}</span>
            <span className="text-sm text-[#4A5568] dark:text-[#94A3B8] ml-1">{t('landing.pricing.perMonth')}</span>
          </>
        )}
      </div>
      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="w-4 h-4 text-[#4CAF50] mt-0.5 flex-shrink-0" strokeWidth={3} />
            <span className="text-[#4A5568] dark:text-[#94A3B8]">{f}</span>
          </li>
        ))}
      </ul>
      {plan.warning && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-4">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {plan.warning}
        </div>
      )}
      <Button
        onClick={onCta}
        className={cn(
          'w-full rounded-full font-semibold transition-all',
          accent
            ? 'bg-[#2196F3] hover:bg-[#1E88E5] text-white shadow-[0_4px_14px_rgba(33,150,243,0.3)] hover:shadow-[0_6px_20px_rgba(33,150,243,0.4)]'
            : 'bg-white dark:bg-transparent border-2 border-[#2196F3] text-[#2196F3] hover:bg-[#2196F3]/10'
        )}
      >
        {t('landing.pricing.start')}
      </Button>
    </>
  );
}