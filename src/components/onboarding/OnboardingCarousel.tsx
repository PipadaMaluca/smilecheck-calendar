import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ONBOARDING_SLIDES } from '@/data/onboardingData';
import smileLogo from '@/assets/smilecheck-logo-full.png';

export function OnboardingCarousel() {
  const { showCarousel, carouselRole, finishCarousel } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const slides = ONBOARDING_SLIDES[carouselRole];
  const isLast = currentSlide === slides.length - 1;
  const isFirst = currentSlide === 0;

  const goNext = useCallback(() => {
    if (isLast) {
      finishCarousel();
      setCurrentSlide(0);
      return;
    }
    setDirection('right');
    setCurrentSlide((p) => p + 1);
  }, [isLast, finishCarousel]);

  const goPrev = useCallback(() => {
    if (isFirst) return;
    setDirection('left');
    setCurrentSlide((p) => p - 1);
  }, [isFirst]);

  const handleSkip = useCallback(() => {
    finishCarousel();
    setCurrentSlide(0);
  }, [finishCarousel]);

  if (!showCarousel) return null;

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        Saltar
      </button>

      {/* Slide content */}
      <div
        key={currentSlide}
        className={cn(
          'flex flex-col items-center text-center px-8 max-w-md w-full',
          direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
        )}
      >
        {/* Illustration area */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh]">
          {isFirst ? (
            <img src={smileLogo} alt="SmileCheck" className="w-48 mb-6" />
          ) : null}
          <div className="text-8xl mb-8 animate-scale-in">{slide.emoji}</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">{slide.title}</h1>
          <p className="text-muted-foreground leading-relaxed max-w-sm">{slide.description}</p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-12 px-8 flex flex-col items-center gap-6">
        {/* Progress dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentSlide ? 'right' : 'left'); setCurrentSlide(i); }}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                i === currentSlide
                  ? 'bg-primary w-6'
                  : i < currentSlide
                    ? 'bg-primary/50'
                    : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 w-full max-w-xs">
          {!isFirst && (
            <Button variant="outline" onClick={goPrev} className="flex-1">
              Anterior
            </Button>
          )}
          <Button onClick={goNext} className={cn('flex-1', isFirst && 'w-full')}>
            {isLast ? 'Começar' : 'Seguinte'}
          </Button>
        </div>
      </div>
    </div>
  );
}
