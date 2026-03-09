import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SlideWelcome } from './slides/SlideWelcome';
import { SlidePoints } from './slides/SlidePoints';
import { SlideLevels } from './slides/SlideLevels';
import { SlideRewards } from './slides/SlideRewards';
import { SlideRankings } from './slides/SlideRankings';
import { SlideRating } from './slides/SlideRating';
import { SlideStart } from './slides/SlideStart';
import { UserRole } from '@/types/calendar';

// Slide types
type SlideConfig =
  | { type: 'welcome' }
  | { type: 'points' }
  | { type: 'levels' }
  | { type: 'rewards' }
  | { type: 'rankings' }
  | { type: 'rating' }
  | { type: 'start' };

// Patient: 6 slides (no Rankings)
const PATIENT_SLIDES: SlideConfig[] = [
  { type: 'welcome' },
  { type: 'points' },
  { type: 'levels' },
  { type: 'rewards' },
  { type: 'rating' },
  { type: 'start' },
];

// Dentist: 7 slides (all)
const DENTIST_SLIDES: SlideConfig[] = [
  { type: 'welcome' },
  { type: 'points' },
  { type: 'levels' },
  { type: 'rewards' },
  { type: 'rankings' },
  { type: 'rating' },
  { type: 'start' },
];

// Clinic: 7 slides (all)
const CLINIC_SLIDES: SlideConfig[] = [
  { type: 'welcome' },
  { type: 'points' },
  { type: 'levels' },
  { type: 'rewards' },
  { type: 'rankings' },
  { type: 'rating' },
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
      case 'points':
        return <SlidePoints isActive={isActive} userRole={carouselRole} />;
      case 'levels':
        return <SlideLevels isActive={isActive} />;
      case 'rewards':
        return <SlideRewards isActive={isActive} />;
      case 'rankings':
        return <SlideRankings isActive={isActive} userRole={carouselRole} />;
      case 'rating':
        return <SlideRating isActive={isActive} userRole={carouselRole} />;
      case 'start':
        return <SlideStart isActive={isActive} userRole={carouselRole} onComplete={handleComplete} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-background to-background/95">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'hsla(195, 100%, 70%, 0.05)' }} />
        <div className="absolute bottom-40 right-10 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'hsla(195, 100%, 70%, 0.05)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'hsla(162, 100%, 43%, 0.05)' }} />
      </div>

      <div className="relative h-full max-w-lg mx-auto flex flex-col px-4">
        {/* Skip button */}
        {!isLast && (
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 z-20 text-gaming-diamond hover:text-foreground text-sm transition-colors"
          >
            <span className="hidden sm:inline">Saltar tutorial</span>
            <span className="sm:hidden">Saltar</span>
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
                  ? 'bg-gaming-diamond w-8'
                  : 'w-2.5 bg-muted hover:bg-muted-foreground/50'
              }`}
              style={index === currentSlide ? { boxShadow: '0 0 15px hsla(195, 100%, 70%, 0.5)' } : {}}
            />
          ))}
        </div>

        {/* Navigation */}
        {!isLast && (
          <div className="flex flex-col items-center gap-2 px-6 pb-6">
            <button
              onClick={scrollNext}
              className="flex items-center gap-1 px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 bg-gaming-diamond text-background hover:scale-105 active:scale-95"
              style={{ boxShadow: '0 0 30px hsla(195, 100%, 70%, 0.3)' }}
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
