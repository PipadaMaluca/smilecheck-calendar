import { ReactNode, useLayoutEffect, useRef, useState } from 'react';

interface SlideFrameProps {
  title?: ReactNode;
  children: ReactNode;
}

/**
 * Shared onboarding slide layout: the title always sits at the same top position,
 * the body is centred in the remaining fixed-height area and scaled down (never
 * scrolled or clipped) when it would not fit — e.g. at 360px.
 */
export function SlideFrame({ title, children }: SlideFrameProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const area = areaRef.current;
    const content = contentRef.current;
    if (!area || !content) return;
    const update = () => {
      const avail = area.clientHeight;
      const needed = content.scrollHeight;
      setScale(needed > avail && needed > 0 ? Math.max(0.6, avail / needed) : 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(area);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center px-6 pt-10 pb-2 overflow-hidden">
      {title && <div className="w-full flex justify-center text-center shrink-0 mb-4">{title}</div>}
      <div ref={areaRef} className="flex-1 min-h-0 w-full flex items-center justify-center">
        <div
          ref={contentRef}
          className="w-full flex flex-col items-center"
          style={{ transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: 'center' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
