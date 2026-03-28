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
    return () => obs.disconnect();
  }, []);

  return (
    <section id="faq" className="py-20 px-4" ref={ref}>
      <div className={cn('max-w-3xl mx-auto transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">{t('landing.faq.title')}</h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-foreground">{t(faq.qKey)}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{t(faq.aKey)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}