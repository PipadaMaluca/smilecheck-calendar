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
import { useTranslation } from 'react-i18next';

type SlideConfig = { type: 'welcome' } | { type: 'points' } | { type: 'levels' } | { type: 'rewards' } | { type: 'rankings' } | { type: 'rating' } | { type: 'start' };

const PATIENT_SLIDES: SlideConfig[] = [{ type: 'welcome' }, { type: 'points' }, { type: 'levels' }, { type: 'rewards' }, { type: 'rating' }, { type: 'start' }];
const DENTIST_SLIDES: SlideConfig[] = [{ type: 'welcome' }, { type: 'points' }, { type: 'levels' }, { type: 'rewards' }, { type: 'rankings' }, { type: 'rating' }, { type: 'start' }];
const CLINIC_SLIDES: SlideConfig[] = [{ type: 'welcome' }, { type: 'points' }, { type: 'levels' }, { type: 'rewards' }, { type: 'rankings' }, { type: 'rating' }, { type: 'start' }];

const SLIDES_BY_ROLE: Record<UserRole, SlideConfig[]> = { patient: PATIENT_SLIDES, dentist: DENTIST_SLIDES, clinic: CLINIC_SLIDES };

export function OnboardingCarousel() {
  const { t } = useTranslation();
  const { showCarousel, carouselRole, finishCarousel } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });

  const slides = SLIDES_BY_ROLE[carouselRole];
  const totalSlides = slides.length;
  const isLast = currentSlide === totalSlides - 1;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => { if (!emblaApi) return; setCurrentSlide(emblaApi.selectedScrollSnap()); }, [emblaApi]);

  useEffect(() => { if (!emblaApi) return; emblaApi.on('select', onSelect); onSelect(); return () => { emblaApi.off('select', onSelect); }; }, [emblaApi, onSelect]);
  useEffect(() => { if (showCarousel && emblaApi) { emblaApi.scrollTo(0); setCurrentSlide(0); } }, [showCarousel, emblaApi]);

  if (!showCarousel) return null;

  const handleComplete = () => { finishCarousel(); setCurrentSlide(0); };

  const renderSlide = (config: SlideConfig, index: number) => {
    const isActive = currentSlide === index;
    switch (config.type) {
      case 'welcome': return <SlideWelcome isActive={isActive} userRole={carouselRole} />;
      case 'points': return <SlidePoints isActive={isActive} userRole={carouselRole} />;
      case 'levels': return <SlideLevels isActive={isActive} />;
      case 'rewards': return <SlideRewards isActive={isActive} />;
      case 'rankings': return <SlideRankings isActive={isActive} userRole={carouselRole} />;
      case 'rating': return <SlideRating isActive={isActive} userRole={carouselRole} />;
      case 'start': return <SlideStart isActive={isActive} userRole={carouselRole} onComplete={handleComplete} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-background to-background/95">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'hsla(195, 100%, 70%, 0.05)' }} />
        <div className="absolute bottom-40 right-10 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'hsla(195, 100%, 70%, 0.05)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'hsla(162, 100%, 43%, 0.05)' }} />
      </div>

      <div className="relative h-full max-w-lg mx-auto flex flex-col">
        {!isLast && (
          <button onClick={handleComplete} className="absolute top-2 right-4 z-20 text-muted-foreground hover:text-foreground text-[11px] transition-colors">
            <span className="hidden sm:inline">{t('onboarding.skip')}</span>
            <span className="sm:hidden">{t('onboarding.skipShort')}</span>
          </button>
        )}

        <div className="flex-1 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((config, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 h-full">{renderSlide(config, index)}</div>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 py-3">
          {slides.map((_, index) => (
            <button key={index} onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6' : 'w-2 bg-muted hover:bg-muted-foreground/50'}`}
              style={index === currentSlide ? { backgroundColor: '#2196F3', boxShadow: '0 0 12px rgba(33, 150, 243, 0.5)' } : {}} />
          ))}
        </div>

        {!isLast && (
          <div className="flex flex-col items-center gap-2 px-4 pb-4 safe-area-pb">
            <button onClick={scrollNext}
              className="w-full flex items-center justify-center gap-1 px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 text-white hover:scale-[1.02] active:scale-95 min-h-[48px]"
              style={{ backgroundColor: '#2196F3', boxShadow: '0 0 20px rgba(33, 150, 243, 0.3)' }}>
              {t('onboarding.next')}
              <ChevronRight className="w-4 h-4" />
            </button>
            {currentSlide > 0 && (
              <button onClick={scrollPrev}
                className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-3 h-3" />
                {t('onboarding.previous')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}