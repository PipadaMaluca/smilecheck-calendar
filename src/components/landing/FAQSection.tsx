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
    <section id="faq" className="py-8 sm:py-10 px-6 md:px-10 bg-[#F5F9FF] dark:bg-background" ref={ref}>
      <div className={cn('max-w-3xl mx-auto transition-[transform,background-color,border-color,color,box-shadow] duration-300', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        <h2 id="faq-title" style={{ scrollMarginTop: '120px' }} className="text-[28px] sm:text-4xl lg:text-5xl font-bold tracking-tight text-center text-[#1A202C] dark:text-white mb-6">
          {t('landing.faq.title')}
        </h2>

        <Accordion type="single" collapsible className="w-full space-y-1" data-reveal="cards">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-lg border border-[#D6E4F0] dark:border-[#1E3A5F] bg-white dark:bg-[#0D2137] data-[state=open]:bg-[#F0F7FF] dark:data-[state=open]:bg-[#1E3A5F]/40 data-[state=open]:border-l-[3px] data-[state=open]:border-l-[#2196F3] px-4 transition-colors shadow-[0_1px_4px_rgba(33,150,243,0.05)]"
            >
              <AccordionTrigger className="text-left text-[15px] text-[#1A202C] dark:text-white py-3 font-medium hover:no-underline [&>svg]:text-[#2196F3] min-h-[44px]">
                {t(faq.qKey)}
              </AccordionTrigger>
              <AccordionContent className="text-[14px] text-[#4A5568] dark:text-[#94A3B8] pb-3 leading-[1.5] text-left">
                {t(faq.aKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
