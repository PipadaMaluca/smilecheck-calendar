import { useRef, useState, useEffect } from 'react';
import { Glyph } from '@/components/ui/glyph';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function HowItWorksSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const steps = [
    { icon: '📝', titleKey: 'landing.howItWorks.step1Title', descKey: 'landing.howItWorks.step1Desc' },
    { icon: '📅', titleKey: 'landing.howItWorks.step2Title', descKey: 'landing.howItWorks.step2Desc' },
    { icon: '🎁', titleKey: 'landing.howItWorks.step3Title', descKey: 'landing.howItWorks.step3Desc' },
  ];

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
    <section className="py-8 sm:py-12 md:py-[60px] px-4 bg-muted/30" ref={ref}>
      <div className={cn('max-w-4xl mx-auto transition-[transform,background-color,border-color,color,box-shadow] duration-300', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">{t('landing.howItWorks.title')}</h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((s, i) => (
            <div key={s.titleKey} className="relative text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl relative z-10 border border-primary/20">
                <Glyph emoji={s.icon} className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              </div>
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                {t('landing.howItWorks.step', { number: i + 1 })}
              </span>
              <h3 className="font-semibold text-foreground mb-2">{t(s.titleKey)}</h3>
              <p className="text-sm text-muted-foreground max-w-[260px] mx-auto">{t(s.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}