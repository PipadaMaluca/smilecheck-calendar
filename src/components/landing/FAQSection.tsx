import { useRef, useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function FAQSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const faqs = [
    { qKey: 'landing.faq.q1', aKey: 'landing.faq.a1' },
    { qKey: 'landing.faq.q2', aKey: 'landing.faq.a2' },
    { qKey: 'landing.faq.q3', aKey: 'landing.faq.a3' },
    { qKey: 'landing.faq.q4', aKey: 'landing.faq.a4' },
    { qKey: 'landing.faq.q5', aKey: 'landing.faq.a5' },
    { qKey: 'landing.faq.q6', aKey: 'landing.faq.a6' },
    { qKey: 'landing.faq.q7', aKey: 'landing.faq.a7' },
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
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
    <section id="faq" className="py-8 sm:py-10 px-6 md:px-10 bg-background" ref={ref}>
      <div className={cn('max-w-3xl mx-auto transition-[transform,background-color,border-color,color,box-shadow] duration-300', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        <h2 id="faq-title" style={{ scrollMarginTop: '120px' }} className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-center text-foreground mb-6">
          {t('landing.faq.title')}
        </h2>

        <Accordion type="single" collapsible className="w-full space-y-1" data-reveal="cards">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-lg border border-border bg-white dark:bg-card data-[state=open]:bg-[#F0F7FF] dark:data-[state=open]:bg-accent/40 data-[state=open]:border-l-[3px] data-[state=open]:border-l-[#2196F3] px-4 transition-colors shadow-[0_1px_4px_rgba(33,150,243,0.05)]"
            >
              <AccordionTrigger className="text-left text-base text-foreground py-3 font-medium hover:no-underline [&>svg]:text-primary min-h-11">
                {t(faq.qKey)}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-3 leading-[1.5] text-left">
                {t(faq.aKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
