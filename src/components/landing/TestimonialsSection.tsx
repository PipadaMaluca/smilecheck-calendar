import { useRef, useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function TestimonialsSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const testimonials = [
    { quoteKey: 'landing.testimonials.t1', nameKey: 'landing.testimonials.t1Name', roleKey: 'landing.testimonials.t1Role', rating: 5 },
    { quoteKey: 'landing.testimonials.t2', nameKey: 'landing.testimonials.t2Name', roleKey: 'landing.testimonials.t2Role', rating: 5 },
    { quoteKey: 'landing.testimonials.t3', nameKey: 'landing.testimonials.t3Name', roleKey: 'landing.testimonials.t3Role', rating: 5 },
    { quoteKey: 'landing.testimonials.t4', nameKey: 'landing.testimonials.t4Name', roleKey: 'landing.testimonials.t4Role', rating: 5 },
    { quoteKey: 'landing.testimonials.t5', nameKey: 'landing.testimonials.t5Name', roleKey: 'landing.testimonials.t5Role', rating: 5 },
    { quoteKey: 'landing.testimonials.t6', nameKey: 'landing.testimonials.t6Name', roleKey: 'landing.testimonials.t6Role', rating: 5 },
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const initials = (name: string) => name.split(' ').filter(p => !/^dr\.?$/i.test(p)).slice(0, 2).map(s => s[0]).join('').toUpperCase();

  return (
    <section id="testemunhos" className="py-24 sm:py-32 px-4 bg-[#F5F9FF] dark:bg-[#0D2137]" ref={ref}>
      <div className={cn('max-w-6xl mx-auto transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A202C] dark:text-white mb-5">
            {t('landing.testimonials.title')}
          </h2>
        </div>

        <Carousel opts={{ align: 'start', loop: true }} className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {testimonials.map((item, i) => {
              const name = t(item.nameKey);
              return (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/2">
                  <div className="p-8 rounded-2xl bg-white dark:bg-background border border-[#D6E4F0] dark:border-[#1E3A5F] shadow-[0_2px_8px_rgba(33,150,243,0.08)] hover:shadow-[0_8px_24px_rgba(33,150,243,0.12)] transition-all duration-300 h-full flex flex-col">
                    <div className="text-6xl text-[#2196F3]/30 leading-none font-serif mb-2">"</div>
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: item.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-[#F9A825] text-[#F9A825]" />
                      ))}
                    </div>
                    <p className="text-base text-[#1A202C] dark:text-white/90 mb-6 flex-1 italic leading-relaxed">{t(item.quoteKey)}</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#1E3A5F]">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2196F3] to-[#1565C0] flex items-center justify-center text-white text-sm font-bold">
                        {initials(name)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A202C] dark:text-white text-sm">{name}</p>
                        <p className="text-xs text-[#4A5568] dark:text-[#94A3B8]">{t(item.roleKey)}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 sm:-left-12" />
          <CarouselNext className="hidden sm:flex -right-4 sm:-right-12" />
        </Carousel>
        <p className="text-xs text-[#4A5568] dark:text-[#94A3B8] text-center mt-4 sm:hidden">{t('landing.testimonials.swipe')}</p>
      </div>
    </section>
  );
}
