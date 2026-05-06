import { useRef, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Trophy, Video, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
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
      style={{ transitionDelay: `${delay}ms` }}
      className={cn('transition-all duration-700 ease-out motion-reduce:transition-none', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5', className)}
    >
      {children}
    </div>
  );
}

/* ───────── Visual mockups ───────── */
function AgendaMockup() {
  return (
    <div className="rounded-2xl border border-[#D6E4F0] dark:border-[#1E3A5F] bg-white dark:bg-[#0D2137] shadow-2xl shadow-[#2196F3]/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
        <span className="ml-2 text-xs text-[#4A5568] dark:text-[#94A3B8]">Agenda • Janeiro</span>
      </div>
      <div className="p-5 grid grid-cols-5 gap-2">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map((d, i) => (
          <div key={d} className="text-center">
            <div className="text-[10px] font-medium text-[#4A5568] dark:text-[#94A3B8] mb-2">{d}</div>
            <div className="space-y-1.5">
              {[
                ['#2196F3', 28], ['#FB923C', 16], ['#2196F3', 22],
              ].slice(0, [3,2,3,2,3][i]).map((b, j) => (
                <div key={j} className="rounded-md" style={{ background: b[0] as string, height: b[1] as number, opacity: 0.85 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5">
        <div className="rounded-lg bg-[#F5F9FF] dark:bg-[#1E3A5F]/30 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#2196F3]/15 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#2196F3]" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-[#1A202C] dark:text-white">10:30 — Limpeza</div>
            <div className="text-[10px] text-[#4A5568] dark:text-[#94A3B8]">Dr. Gonçalo Pipo</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">Confirmada</span>
        </div>
      </div>
    </div>
  );
}

function BadgesMockup() {
  const items = [
    { e: '🏆', l: 'Top 100' },
    { e: '🔥', l: 'Streak 30' },
    { e: '⭐', l: 'VIP' },
    { e: '💎', l: 'Premium' },
    { e: '🎯', l: 'Preciso' },
    { e: '🚀', l: 'Rápido' },
  ];
  return (
    <div className="rounded-2xl border border-[#D6E4F0] dark:border-[#1E3A5F] bg-white dark:bg-[#0D2137] shadow-2xl shadow-[#2196F3]/10 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-sm font-bold text-[#1A202C] dark:text-white">Conquistas</div>
          <div className="text-xs text-[#4A5568] dark:text-[#94A3B8]">22 de 40 desbloqueadas</div>
        </div>
        <div className="text-2xl">🏅</div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {items.map((it) => (
          <div key={it.l} className="aspect-square rounded-xl bg-gradient-to-br from-[#F5F9FF] to-[#E8F2FF] dark:from-[#1E3A5F]/40 dark:to-[#0D2137] border border-[#D6E4F0] dark:border-[#1E3A5F] flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">{it.e}</span>
            <span className="text-[9px] font-medium text-[#4A5568] dark:text-[#94A3B8]">{it.l}</span>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-[#F5F9FF] dark:bg-[#1E3A5F]/30 p-3 flex items-center gap-2">
        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        <div className="text-xs text-[#1A202C] dark:text-white"><span className="font-semibold">450 XP</span> — Nível Prata</div>
      </div>
    </div>
  );
}

function TeleconsultaMockup() {
  return (
    <div className="rounded-2xl border border-[#D6E4F0] dark:border-[#1E3A5F] bg-[#0D2137] shadow-2xl shadow-[#2196F3]/20 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-[#1E3A5F] via-[#0D2137] to-[#0A1929] relative flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2196F3] to-[#1565C0] flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
          GP
        </div>
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-red-500/90 text-white text-[10px] font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> AO VIVO
        </div>
        <div className="absolute bottom-3 right-3 w-20 h-14 rounded-lg bg-[#0A1929] border border-white/10 flex items-center justify-center text-[10px] text-white/50">Você</div>
      </div>
      <div className="px-5 py-4 flex items-center justify-between bg-[#0A1929]">
        <div>
          <div className="text-sm font-semibold text-white">Dr. Gonçalo Pipo</div>
          <div className="text-[10px] text-[#94A3B8]">12:34 • €20 fixo</div>
        </div>
        <div className="flex gap-2">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><Video className="w-4 h-4 text-white" /></div>
          <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">✕</div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Hero feature row ───────── */
function FeatureRow({
  reverse, eyebrow, title, desc, bullets, visual,
}: {
  reverse?: boolean; eyebrow: string; title: string; desc: string; bullets: string[]; visual: React.ReactNode;
}) {
  return (
    <div className={cn('grid lg:grid-cols-2 gap-10 lg:gap-20 items-center sc-perspective', reverse && 'lg:[&>*:first-child]:order-2')}>
      <ScrollReveal className="text-center lg:text-left">
        <div data-reveal="left" className="inline-block px-3 py-1 rounded-full bg-[#EBF4FF] dark:bg-[#1E3A5F]/60 text-[#1565C0] dark:text-[#60A5FA] border border-[#D6E4F0] dark:border-[#1E3A5F] text-xs font-semibold mb-4 uppercase tracking-wide">
          {eyebrow}
        </div>
        <h3 data-reveal="words" className="text-[28px] sm:text-4xl lg:text-[40px] font-bold tracking-tight text-[#1A202C] dark:text-white leading-[1.1] mb-5">
          {title}
        </h3>
        <p data-reveal="up" className="text-base sm:text-lg text-[#4A5568] dark:text-[#94A3B8] leading-relaxed mb-6 max-w-[90%] mx-auto lg:max-w-[480px] lg:mx-0">
          {desc}
        </p>
        <ul data-reveal="stagger" className="space-y-2.5 max-w-[85%] mx-auto lg:max-w-[480px] lg:mx-0 text-left">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-[#1A202C] dark:text-white/90">
              <Check className="w-5 h-5 text-[#2196F3] flex-shrink-0 mt-0.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </ScrollReveal>
      <ScrollReveal delay={150}>
        <div data-reveal="image" data-parallax className="max-w-[90%] sm:max-w-[420px] lg:max-h-[300px] mx-auto mt-6 lg:mt-0 [&>*]:lg:max-h-[300px] [&>*]:lg:overflow-hidden">{visual}</div>
      </ScrollReveal>
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
    <section id="funcionalidades" className="px-6 md:px-10 py-8 sm:py-12 md:py-[60px] space-y-12 md:space-y-12 lg:space-y-[60px] bg-white dark:bg-background">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10 sm:mb-12">
            <h2 id="funcionalidades-title" style={{ scrollMarginTop: '120px' }} className="text-[32px] sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A202C] dark:text-white mb-5">
              {t('landing.features.title')}
            </h2>
            <p className="text-base sm:text-xl font-light text-[#4A5568] dark:text-[#94A3B8] max-w-[90%] sm:max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-10 md:space-y-12 lg:space-y-[60px]">
          <FeatureRow
            eyebrow={t('landing.features.forPatients')}
            title={t('landing.features.patient1Title')}
            desc={t('landing.features.patient1Desc')}
            bullets={[t('landing.features.patient2Title'), t('landing.features.patient5Title'), t('landing.features.patient6Title')]}
            visual={<AgendaMockup />}
          />

          <FeatureRow
            reverse
            eyebrow={t('landing.features.forDentists')}
            title={t('landing.features.dentist6Title')}
            desc={t('landing.features.dentist6Desc')}
            bullets={[t('landing.features.dentist1Title'), t('landing.features.dentist5Title'), t('landing.features.patient3Title')]}
            visual={<BadgesMockup />}
          />

          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-block px-3 py-1 rounded-full bg-[#EBF4FF] dark:bg-[#1E3A5F]/60 text-[#1565C0] dark:text-[#60A5FA] border border-[#D6E4F0] dark:border-[#1E3A5F] text-xs font-semibold mb-4 uppercase tracking-wide">
                📹 {t('landing.features.teleEyebrow')}
              </div>
              <h3 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#1A202C] dark:text-white leading-[1.1] mb-5">
                {t('landing.features.teleTitle')}
              </h3>
              <p className="text-base sm:text-lg text-[#4A5568] dark:text-[#94A3B8] leading-relaxed mb-10 max-w-[560px] mx-auto">
                {t('landing.features.teleDesc')}
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <div className="max-w-2xl mx-auto"><TeleconsultaMockup /></div>
          </ScrollReveal>
        </div>
      </div>

      {/* Detailed feature grid (tabs) */}
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-10 h-auto bg-transparent p-0 border-b border-[#E2E8F0] dark:border-[#1E3A5F] rounded-none gap-0">
              <TabsTrigger
                value="patient"
                className="text-sm py-3 rounded-none border-b-2 border-transparent text-[#94A3B8] hover:text-[#4A5568] dark:hover:text-white data-[state=active]:bg-[#EBF4FF] dark:data-[state=active]:bg-[#1E3A5F]/60 data-[state=active]:text-[#2196F3] data-[state=active]:border-[#2196F3] data-[state=active]:font-bold transition-colors"
              >{t('landing.features.forPatients')}</TabsTrigger>
              <TabsTrigger
                value="dentist"
                className="text-sm py-3 rounded-none border-b-2 border-transparent text-[#94A3B8] hover:text-[#4A5568] dark:hover:text-white data-[state=active]:bg-[#EBF4FF] dark:data-[state=active]:bg-[#1E3A5F]/60 data-[state=active]:text-[#2196F3] data-[state=active]:border-[#2196F3] data-[state=active]:font-bold transition-colors"
              >{t('landing.features.forDentists')}</TabsTrigger>
              <TabsTrigger
                value="clinic"
                className="text-sm py-3 rounded-none border-b-2 border-transparent text-[#94A3B8] hover:text-[#4A5568] dark:hover:text-white data-[state=active]:bg-[#EBF4FF] dark:data-[state=active]:bg-[#1E3A5F]/60 data-[state=active]:text-[#2196F3] data-[state=active]:border-[#2196F3] data-[state=active]:font-bold transition-colors"
              >{t('landing.features.forClinics')}</TabsTrigger>
            </TabsList>

            <TabsContent value="patient"><FeatureGrid features={patientFeatures} /></TabsContent>
            <TabsContent value="dentist"><FeatureGrid features={dentistFeatures} /></TabsContent>
            <TabsContent value="clinic"><FeatureGrid features={clinicFeatures} /></TabsContent>
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
        <div
          key={f.titleKey}
          className="group p-7 rounded-2xl border border-[#D6E4F0] dark:border-[#1E3A5F] bg-white dark:bg-[#0D2137] hover:border-[#2196F3]/50 hover:shadow-xl hover:shadow-[#2196F3]/10 hover:-translate-y-1 transition-all duration-300"
        >
          <span className="text-3xl mb-4 block">{f.icon}</span>
          <h3 className="font-semibold text-[#1A202C] dark:text-white mb-2">{t(f.titleKey)}</h3>
          <p className="text-sm text-[#4A5568] dark:text-[#94A3B8] leading-relaxed">{t(f.descKey)}</p>
        </div>
      ))}
    </div>
  );
}
