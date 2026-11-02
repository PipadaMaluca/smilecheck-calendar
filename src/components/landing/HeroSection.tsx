import { onActivateKey } from '@/lib/a11y';
import { formatDecimal1 } from '@/lib/formatters';
import { formatNumber } from '@/lib/formatters';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { StoreQrCodes } from './StoreQrCodes';
import { AppIconTile } from './AppIconTile';

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
  const location = useLocation();
  const isDemo = new URLSearchParams(location.search).get('demo') === 'true';

  const stats = [
    { end: 5000, prefix: '+', labelKey: 'landing.stats.patients' },
    { end: 500, prefix: '+', labelKey: 'landing.stats.dentists' },
    { end: 50, prefix: '+', labelKey: 'landing.stats.clinics' },
    { end: 48, prefix: '', labelKey: 'landing.stats.avgRating', isDecimal: true },
  ];

  return (
    <section className="relative flex flex-col items-center justify-start px-6 md:px-10 pt-10 pb-10 sm:pb-14 overflow-hidden bg-gradient-to-b from-background to-white dark:to-background">
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <AppIconTile />

        <h1 data-reveal="words" className="text-4xl leading-none sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-foreground mx-auto mt-2 mb-4 text-balance">
          {t('landing.hero.title')}
          <br />
          <span className="sc-grad-wipe bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {t('landing.hero.titleHighlight')}
          </span>
        </h1>

        <p data-reveal="up" data-reveal-delay="200" className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-xl mx-auto text-center mb-8">
          {t('landing.hero.subtitle')}
        </p>

        <div className="mb-10">
          <StoreQrCodes />
        </div>

        <div data-reveal="up" data-reveal-delay="350" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-md sm:max-w-none mx-auto mb-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/signup')}
            className="rounded-full text-sm font-semibold px-6 h-11 w-full sm:w-auto"
          >
            {t('landing.hero.cta')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/app?demo=true&role=patient')}
            className="rounded-full text-sm font-semibold px-6 h-11 w-full sm:w-auto text-primary"
          >
            {t('landing.hero.demo')}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground animate-fade-in text-center" style={{ marginBottom: 32 }}>
          {t('landing.hero.hasAccount')}{' '}
          <a role="button" tabIndex={0} onKeyDown={onActivateKey} onClick={() => navigate('/login')} className="text-primary hover:underline cursor-pointer font-medium">
            {t('auth.login')}
          </a>
        </p>

        {isDemo && (
          <p className="italic text-center text-muted-foreground animate-fade-in" style={{ fontSize: 12, marginBottom: 24 }}>
            {t('demoBanner.disclaimer')}
          </p>
        )}
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
  const display = isDecimal ? formatDecimal1(count / 10) : formatNumber(count);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-foreground">{prefix}{display}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
