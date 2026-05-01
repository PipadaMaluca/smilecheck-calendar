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
    <section id="faq" className="py-24 sm:py-32 px-4 bg-[#F5F9FF] dark:bg-background" ref={ref}>
      <div className={cn('max-w-3xl mx-auto transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-center text-[#1A202C] dark:text-white mb-16">
          {t('landing.faq.title')}
        </h2>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border border-[#D6E4F0] dark:border-[#1E3A5F] bg-white dark:bg-[#0D2137] data-[state=open]:bg-[#F0F7FF] dark:data-[state=open]:bg-[#1E3A5F]/40 data-[state=open]:border-l-[3px] data-[state=open]:border-l-[#2196F3] px-5 transition-colors shadow-[0_2px_8px_rgba(33,150,243,0.06)]"
            >
              <AccordionTrigger className="text-left text-[#1A202C] dark:text-white py-5 font-medium hover:no-underline [&>svg]:text-[#2196F3]">
                {t(faq.qKey)}
              </AccordionTrigger>
              <AccordionContent className="text-[#4A5568] dark:text-[#94A3B8] pb-5 leading-relaxed">
                {t(faq.aKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
