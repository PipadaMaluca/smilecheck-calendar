import { useRef, useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    quote: 'Desde que uso o SmileCheck, nunca mais faltei a uma consulta. Os pontos motivam mesmo!',
    name: 'Maria Silva',
    role: 'Paciente',
    rating: 5,
  },
  {
    quote: 'A teleconsulta salvou-me quando estava de férias e tive uma urgência dentária.',
    name: 'João Costa',
    role: 'Paciente',
    rating: 5,
  },
  {
    quote: 'A agenda inteligente e as confirmações automáticas reduziram as minhas faltas em 40%.',
    name: 'Dr. Alexandre Bernardo',
    role: 'Dentista',
    rating: 5,
  },
  {
    quote: 'Prescrever receitas e enviar cartas de referência nunca foi tão rápido.',
    name: 'Dra. Catarina Fernandes',
    role: 'Dentista',
    rating: 5,
  },
  {
    quote: 'Conseguimos gerir 3 dentistas e 50+ consultas diárias sem stress.',
    name: 'Clínica SmileCheck',
    role: 'Clínica',
    rating: 5,
  },
  {
    quote: 'Os relatórios ajudam-nos a tomar decisões baseadas em dados reais.',
    name: 'Clínica Mitry-Mory',
    role: 'Clínica',
    rating: 5,
  },
];

export function TestimonialsSection() {
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
    <section id="testemunhos" className="py-20 px-4 bg-muted/30" ref={ref}>
      <div
        className={cn(
          'max-w-5xl mx-auto transition-all duration-700',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          O que dizem sobre nós
        </h2>

        <Carousel
          opts={{ align: 'start', loop: true }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((t, i) => (
              <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/2">
                <div className="p-6 rounded-xl border border-border bg-card h-full flex flex-col">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-4 flex-1 italic">
                    "{t.quote}"
                  </p>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 sm:-left-12" />
          <CarouselNext className="-right-4 sm:-right-12" />
        </Carousel>
      </div>
    </section>
  );
}
