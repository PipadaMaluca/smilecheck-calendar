import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SlideWelcome } from './slides/SlideWelcome';
import { SlideFeature } from './slides/SlideFeature';
import { SlidePoints } from './slides/SlidePoints';
import { SlideLevels } from './slides/SlideLevels';
import { SlideRankings } from './slides/SlideRankings';
import { SlideStart } from './slides/SlideStart';
import { UserRole } from '@/types/calendar';

// Define slide configs per role
type SlideConfig =
  | { type: 'welcome' }
  | { type: 'feature'; emoji: string; title: string; description: string; items?: { icon: string; label: string; detail: string }[] }
  | { type: 'points' }
  | { type: 'levels' }
  | { type: 'rankings' }
  | { type: 'start' };

const PATIENT_SLIDES: SlideConfig[] = [
  { type: 'welcome' },
  { type: 'feature', emoji: '📅', title: 'As suas consultas', description: 'Marque, confirme e acompanhe todas as suas consultas presenciais e teleconsultas num só lugar.', items: [
    { icon: '🏥', label: 'Presenciais', detail: 'Na clínica, com confirmação automática' },
    { icon: '📱', label: 'Teleconsultas', detail: 'Por videochamada, a apenas €20' },
  ]},
  { type: 'points' },
  { type: 'levels' },
  { type: 'feature', emoji: '❤️', title: 'A sua saúde oral', description: 'Mantenha o seu perfil de saúde atualizado: alergias, medicação, vacinas e documentos médicos sempre acessíveis.' },
  { type: 'rankings' },
  { type: 'feature', emoji: '🎁', title: 'Loja de recompensas', description: 'Troque os seus pontos por descontos em consultas, produtos de higiene oral e muito mais.', items: [
    { icon: '🪥', label: 'Produtos', detail: 'Escovas, pastas e fio dentário' },
    { icon: '💰', label: 'Descontos', detail: '100 pts = €10 em recompensas' },
  ]},
  { type: 'start' },
];

const DENTIST_SLIDES: SlideConfig[] = [
  { type: 'welcome' },
  { type: 'feature', emoji: '📅', title: 'A sua agenda inteligente', description: 'Visualize o dia, semana ou mês. Arraste consultas, filtre por clínica e nunca perca um compromisso.', items: [
    { icon: '📋', label: 'Vista Diária', detail: 'Timeline por dentista com drag & drop' },
    { icon: '📅', label: 'Vista Semanal/Mensal', detail: 'Planeamento a longo prazo' },
  ]},
  { type: 'feature', emoji: '✅', title: 'Confirmações automáticas', description: 'Acompanhe as confirmações dos pacientes a 24h e 1h em tempo real. Menos faltas, mais eficiência.' },
  { type: 'feature', emoji: '👤', title: 'Gestão de pacientes', description: 'Aceda ao dossier completo: saúde, alergias, histórico, receitas e cartas de referência.' },
  { type: 'points' },
  { type: 'levels' },
  { type: 'rankings' },
  { type: 'start' },
];

const CLINIC_SLIDES: SlideConfig[] = [
  { type: 'welcome' },
  { type: 'feature', emoji: '📋', title: 'Visão geral da clínica', description: 'Acompanhe consultas de hoje, confirmações e lista de espera de toda a equipa num só ecrã.' },
  { type: 'feature', emoji: '👥', title: 'Gestão de equipa', description: 'Visualize a agenda de cada dentista, acompanhe desempenho e gerir disponibilidades.', items: [
    { icon: '🩺', label: 'Por Dentista', detail: 'Consultas, confirmações e estatísticas' },
    { icon: '📊', label: 'Relatórios', detail: 'Exporte em PDF ou Excel' },
  ]},
  { type: 'feature', emoji: '✅', title: 'Confirmações por dentista', description: 'Monitorize as confirmações de cada profissional. Identifique padrões e reduza faltas.' },
  { type: 'points' },
  { type: 'levels' },
  { type: 'rankings' },
  { type: 'start' },
];

const SLIDES_BY_ROLE: Record<UserRole, SlideConfig[]> = {
  patient: PATIENT_SLIDES,
  dentist: DENTIST_SLIDES,
  clinic: CLINIC_SLIDES,
};

export function OnboardingCarousel() {
  const { showCarousel, carouselRole, finishCarousel } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });

  const slides = SLIDES_BY_ROLE[carouselRole];
  const totalSlides = slides.length;
  const isLast = currentSlide === totalSlides - 1;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  // Reset when carousel opens
  useEffect(() => {
    if (showCarousel && emblaApi) {
      emblaApi.scrollTo(0);
      setCurrentSlide(0);
    }
  }, [showCarousel, emblaApi]);

  if (!showCarousel) return null;

  const handleComplete = () => {
    finishCarousel();
    setCurrentSlide(0);
  };

  const renderSlide = (config: SlideConfig, index: number) => {
    const isActive = currentSlide === index;
    switch (config.type) {
      case 'welcome':
        return <SlideWelcome isActive={isActive} userRole={carouselRole} />;
      case 'feature':
        return <SlideFeature isActive={isActive} emoji={config.emoji} title={config.title} description={config.description} items={config.items} />;
      case 'points':
        return <SlidePoints isActive={isActive} userRole={carouselRole} />;
      case 'levels':
        return <SlideLevels isActive={isActive} />;
      case 'rankings':
        return <SlideRankings isActive={isActive} />;
      case 'start':
        return <SlideStart isActive={isActive} userRole={carouselRole} onComplete={handleComplete} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-background to-background/95">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative h-full max-w-lg mx-auto flex flex-col">
        {/* Skip button */}
        {!isLast && (
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 z-20 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Saltar tutorial
          </button>
        )}

        {/* Carousel */}
        <div className="flex-1 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((config, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
                {renderSlide(config, index)}
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 py-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-primary w-8 shadow-[0_0_15px_hsl(207_90%_54%/0.5)]'
                  : 'w-2.5 bg-muted hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        {!isLast && (
          <div className="flex flex-col items-center gap-2 px-6 pb-6">
            <button
              onClick={scrollNext}
              className="flex items-center gap-1 px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 bg-primary text-primary-foreground hover:scale-105 hover:shadow-[0_0_30px_hsl(207_90%_54%/0.4)] active:scale-95"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>

            {currentSlide > 0 && (
              <button
                onClick={scrollPrev}
                className="flex items-center gap-1 px-4 py-2 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
