import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { TOOLTIP_STEPS } from '@/data/onboardingData';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TooltipPosition {
  top: number;
  left: number;
  arrowSide: 'top' | 'bottom' | 'left' | 'right';
  spotlightRect: DOMRect | null;
}

export function OnboardingTooltips() {
  const { t } = useTranslation();
  const { showTooltips, tooltipRole, finishTooltips } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps = TOOLTIP_STEPS[tooltipRole];
  const total = steps.length;

  const computePosition = useCallback(() => {
    if (!showTooltips || currentStep >= total) return;
    const step = steps[currentStep];
    const el = document.getElementById(step.targetId);
    if (!el) {
      // Element not found, skip
      setPosition(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const tooltipW = 300;
    const tooltipH = 160;
    const padding = 12;

    let top = rect.bottom + padding;
    let left = rect.left + rect.width / 2 - tooltipW / 2;
    let arrowSide: 'top' | 'bottom' | 'left' | 'right' = 'top';

    // If tooltip goes below viewport, show above
    if (top + tooltipH > window.innerHeight - 20) {
      top = rect.top - tooltipH - padding;
      arrowSide = 'bottom';
    }
    // Clamp horizontal
    if (left < 10) left = 10;
    if (left + tooltipW > window.innerWidth - 10) left = window.innerWidth - tooltipW - 10;

    setPosition({ top, left, arrowSide, spotlightRect: rect });
  }, [showTooltips, currentStep, steps, total]);

  useEffect(() => {
    computePosition();
    window.addEventListener('resize', computePosition);
    window.addEventListener('scroll', computePosition, true);
    return () => {
      window.removeEventListener('resize', computePosition);
      window.removeEventListener('scroll', computePosition, true);
    };
  }, [computePosition]);

  const goNext = useCallback(() => {
    if (currentStep >= total - 1) {
      finishTooltips();
      setCurrentStep(0);
      return;
    }
    setCurrentStep((p) => p + 1);
  }, [currentStep, total, finishTooltips]);

  const handleSkip = useCallback(() => {
    finishTooltips();
    setCurrentStep(0);
  }, [finishTooltips]);

  if (!showTooltips) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[90] pointer-events-auto" onClick={handleSkip}>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {position?.spotlightRect && (
                <rect
                  x={position.spotlightRect.left - 6}
                  y={position.spotlightRect.top - 6}
                  width={position.spotlightRect.width + 12}
                  height={position.spotlightRect.height + 12}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0" y="0" width="100%" height="100%"
            fill="hsl(214 50% 5% / 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Spotlight ring */}
      {position?.spotlightRect && (
        <div
          className="fixed z-[91] pointer-events-none rounded-lg ring-2 ring-primary/60 transition-all duration-300"
          style={{
            top: position.spotlightRect.top - 6,
            left: position.spotlightRect.left - 6,
            width: position.spotlightRect.width + 12,
            height: position.spotlightRect.height + 12,
          }}
        />
      )}

      {/* Tooltip bubble */}
      {position && (
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-[92] w-[300px] rounded-xl p-4 animate-fade-in',
            'bg-card border border-primary/30 shadow-lg'
          )}
          style={{ top: position.top, left: position.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-3 h-3 bg-card border-primary/30 rotate-45',
              position.arrowSide === 'top' && '-top-1.5 left-1/2 -translate-x-1/2 border-l border-t',
              position.arrowSide === 'bottom' && '-bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b',
            )}
          />

          <h3 className="text-sm font-bold text-foreground mb-1">{step.title}</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{step.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t('onboardingTooltips.stepOf', { current: currentStep + 1, total })}
            </span>
            <div className="flex gap-2">
              <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t('onboardingTooltips.skip')}
              </button>
              <Button size="sm" onClick={goNext} className="text-xs h-7 px-3">
                {currentStep >= total - 1 ? t('onboardingTooltips.finish') : t('onboardingTooltips.next')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
