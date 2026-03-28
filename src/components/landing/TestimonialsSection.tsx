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

  return (
    <section id="testemunhos" className="py-20 px-4 bg-muted/30" ref={ref}>
      <div className={cn('max-w-5xl mx-auto transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">{t('landing.testimonials.title')}</h2>

        <Carousel opts={{ align: 'start', loop: true }} className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {testimonials.map((item, i) => (
              <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/2">
                <div className="p-6 rounded-xl border border-border bg-card h-full flex flex-col">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: item.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-4 flex-1 italic">"{t(item.quoteKey)}"</p>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t(item.nameKey)}</p>
                    <p className="text-xs text-muted-foreground">{t(item.roleKey)}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 sm:-left-12" />
          <CarouselNext className="hidden sm:flex -right-4 sm:-right-12" />
        </Carousel>
        <p className="text-xs text-muted-foreground text-center mt-4 sm:hidden">{t('landing.testimonials.swipe')}</p>
      </div>
    </section>
  );
}