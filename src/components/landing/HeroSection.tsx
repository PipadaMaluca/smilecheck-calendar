import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/branding/Logo';

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
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
      if (t >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(t));
    }, step);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

export function HeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const stats = [
    { end: 5000, prefix: '+', labelKey: 'landing.stats.patients' },
    { end: 500, prefix: '+', labelKey: 'landing.stats.dentists' },
    { end: 50, prefix: '+', labelKey: 'landing.stats.clinics' },
    { end: 48, prefix: '⭐ ', labelKey: 'landing.stats.avgRating', isDecimal: true },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-10 pt-32 pb-20 overflow-hidden bg-gradient-to-b from-[#F5F9FF] to-white dark:from-background dark:to-background">
      {/* Subtle floating tooth shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[15%] left-[8%] text-[140px] opacity-[0.04] dark:opacity-[0.06] select-none animate-pulse" style={{ animationDuration: '8s' }}>🦷</div>
        <div className="absolute top-[60%] right-[10%] text-[180px] opacity-[0.04] dark:opacity-[0.05] select-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}>🦷</div>
        <div className="absolute bottom-[20%] left-[15%] text-[100px] opacity-[0.04] dark:opacity-[0.05] select-none animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}>✨</div>
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#2196F3]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-[#1E88E5]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <div className="flex justify-center mb-8 animate-fade-in">
          <Logo size={140} className="drop-shadow-[0_0_30px_hsla(207,90%,54%,0.35)]" />
        </div>

        {/* Visible pill — clear blue tint per design spec */}
        <div className="inline-flex mb-8 animate-fade-in">
          <div className="rounded-full bg-[#EBF4FF] dark:bg-[#0D2137] border border-[#D6E4F0] dark:border-[#1E3A5F] px-4 py-1.5 flex items-center gap-2 shadow-[0_2px_8px_rgba(33,150,243,0.08)]">
            <Sparkles className="w-3.5 h-3.5 text-[#2196F3]" />
            <span className="text-xs font-semibold text-[#1565C0] dark:text-[#60A5FA]">{t('landing.hero.badge')}</span>
          </div>
        </div>

        <h1 className="text-[32px] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-bold tracking-tight mb-8 animate-fade-in text-[#1A202C] dark:text-white max-w-[90%] mx-auto sm:max-w-none">
          {t('landing.hero.title')}{' '}
          <span className="bg-gradient-to-r from-[#2196F3] to-[#1E88E5] bg-clip-text text-transparent">
            {t('landing.hero.titleHighlight')}
          </span>
        </h1>

        <p className="text-base sm:text-xl font-light leading-relaxed text-[#4A5568] dark:text-[#94A3B8] max-w-[85%] sm:max-w-2xl mx-auto mb-10 animate-fade-in text-center">
          {t('landing.hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-6 animate-fade-in w-full max-w-md sm:max-w-none mx-auto">
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="rounded-full bg-[#2196F3] hover:bg-[#1E88E5] text-white text-base font-semibold px-8 py-4 h-12 sm:h-auto shadow-[0_4px_14px_rgba(33,150,243,0.3)] hover:shadow-[0_8px_24px_rgba(33,150,243,0.45)] hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
          >
            {t('landing.hero.cta')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/app?demo=true&role=patient')}
            className="rounded-full text-base font-semibold px-8 py-4 h-12 sm:h-auto w-full sm:w-auto bg-white dark:bg-transparent border-2 border-[#D6E4F0] text-[#1565C0] hover:border-[#2196F3] hover:bg-[#EBF4FF] dark:border-white/30 dark:text-white dark:hover:border-white dark:hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300"
          >
            {t('landing.hero.demo')}
          </Button>
        </div>

        <p className="text-sm text-[#4A5568] dark:text-[#94A3B8] mb-16 animate-fade-in text-center">
          {t('landing.hero.hasAccount')}{' '}
          <a onClick={() => navigate('/login')} className="text-[#2196F3] hover:underline cursor-pointer font-medium">
            {t('auth.login')}
          </a>
        </p>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 w-full max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((s) => (
          <StatItem key={s.labelKey} end={s.end} prefix={s.prefix} label={t(s.labelKey)} isDecimal={s.isDecimal} />
        ))}
      </div>
    </section>
  );
}

function StatItem({ end, prefix, label, isDecimal }: { end: number; prefix: string; label: string; isDecimal?: boolean }) {
  const { count, ref } = useCountUp(end);
  const display = isDecimal ? (count / 10).toFixed(1) : count.toLocaleString('pt-PT');

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-[#1A202C] dark:text-white">{prefix}{display}</p>
      <p className="text-sm text-[#4A5568] dark:text-[#94A3B8] mt-1">{label}</p>
    </div>
  );
}
