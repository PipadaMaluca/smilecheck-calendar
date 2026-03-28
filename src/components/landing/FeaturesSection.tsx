import { useRef, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

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
    <div ref={ref} className={cn('transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8', className)}>
      {children}
    </div>
  );
}

export function FeaturesSection() {
  const { t } = useTranslation();

  const patientFeatures = [
    { icon: '📅', titleKey: 'landing.features.patient1Title', descKey: 'landing.features.patient1Desc' },
    { icon: '⭐', titleKey: 'landing.features.patient2Title', descKey: 'landing.features.patient2Desc' },
    { icon: '🏆', titleKey: 'landing.features.patient3Title', descKey: 'landing.features.patient3Desc' },
    { icon: '🎁', titleKey: 'landing.features.patient4Title', descKey: 'landing.features.patient4Desc' },
    { icon: '❤️', titleKey: 'landing.features.patient5Title', descKey: 'landing.features.patient5Desc' },
    { icon: '📱', titleKey: 'landing.features.patient6Title', descKey: 'landing.features.patient6Desc' },
  ];

  const dentistFeatures = [
    { icon: '📋', titleKey: 'landing.features.dentist1Title', descKey: 'landing.features.dentist1Desc' },
    { icon: '✅', titleKey: 'landing.features.dentist2Title', descKey: 'landing.features.dentist2Desc' },
    { icon: '💊', titleKey: 'landing.features.dentist3Title', descKey: 'landing.features.dentist3Desc' },
    { icon: '📄', titleKey: 'landing.features.dentist4Title', descKey: 'landing.features.dentist4Desc' },
    { icon: '📊', titleKey: 'landing.features.dentist5Title', descKey: 'landing.features.dentist5Desc' },
    { icon: '🏅', titleKey: 'landing.features.dentist6Title', descKey: 'landing.features.dentist6Desc' },
  ];

  const clinicFeatures = [
    { icon: '👥', titleKey: 'landing.features.clinic1Title', descKey: 'landing.features.clinic1Desc' },
    { icon: '📈', titleKey: 'landing.features.clinic2Title', descKey: 'landing.features.clinic2Desc' },
    { icon: '📊', titleKey: 'landing.features.clinic3Title', descKey: 'landing.features.clinic3Desc' },
    { icon: '🏆', titleKey: 'landing.features.clinic4Title', descKey: 'landing.features.clinic4Desc' },
    { icon: '⭐', titleKey: 'landing.features.clinic5Title', descKey: 'landing.features.clinic5Desc' },
    { icon: '📱', titleKey: 'landing.features.clinic6Title', descKey: 'landing.features.clinic6Desc' },
  ];

  return (
    <section id="funcionalidades" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('landing.features.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('landing.features.subtitle')}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 h-auto">
              <TabsTrigger value="patient" className="text-xs sm:text-sm py-2">{t('landing.features.forPatients')}</TabsTrigger>
              <TabsTrigger value="dentist" className="text-xs sm:text-sm py-2">{t('landing.features.forDentists')}</TabsTrigger>
              <TabsTrigger value="clinic" className="text-xs sm:text-sm py-2">{t('landing.features.forClinics')}</TabsTrigger>
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

function FeatureGrid({ features }: { features: { icon: string; titleKey: string; descKey: string }[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {features.map((f) => (
        <div key={f.titleKey} className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <span className="text-3xl mb-3 block">{f.icon}</span>
          <h3 className="font-semibold text-foreground mb-2">{t(f.titleKey)}</h3>
          <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
        </div>
      ))}
    </div>
  );
}