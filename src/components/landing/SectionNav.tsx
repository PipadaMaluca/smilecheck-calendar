import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface SectionNavProps {
  isDark: boolean;
}

export function SectionNav({ isDark }: SectionNavProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState<string>('');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const links = [
    { id: 'funcionalidades', label: t('landing.navbar.features') },
    { id: 'planos', label: t('landing.navbar.plans') },
    { id: 'testemunhos', label: t('landing.navbar.testimonials') },
    { id: 'faq', label: t('landing.navbar.faq') },
  ];

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-140px 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-center active link on mobile horizontal scroller
  useEffect(() => {
    if (!active) return;
    const el = linkRefs.current[active];
    const scroller = scrollerRef.current;
    if (el && scroller) {
      const elCenter = el.offsetLeft + el.offsetWidth / 2;
      scroller.scrollTo({ left: elCenter - scroller.clientWidth / 2, behavior: 'smooth' });
    }
  }, [active]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Fixed second header — always visible below main navbar */}
      <div
        className="fixed left-0 right-0 z-[39] border-b top-[84px] md:top-16 lg:top-20"
        style={{
          background: isDark ? 'rgba(10,25,41,0.92)' : 'rgba(245,249,255,0.92)',
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)',
          borderBottomColor: isDark ? '#1E3A5F' : '#D6E4F0',
        }}
      >
        {/* placeholder removed below — actual style above */}
      </div>
      {/* Real fixed bar */}
      <div
        className="fixed left-0 right-0 z-[39] border-b top-11 md:top-16 lg:top-20"
        style={{
          background: isDark ? 'rgba(10,25,41,0.92)' : 'rgba(245,249,255,0.92)',
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)',
          borderBottomColor: isDark ? '#1E3A5F' : '#D6E4F0',
        }}
      >
        <div className="relative max-w-7xl mx-auto h-10 px-4 sm:px-6 lg:px-8">
          <div ref={scrollerRef} className="h-full overflow-x-auto scrollbar-hide">
            <ul className="flex items-center justify-center gap-4 md:gap-5 lg:gap-8 h-full min-w-max px-1">
              {links.map((l) => {
                const isActive = active === l.id;
                return (
                  <li key={l.id} className="h-full flex items-stretch">
                    <a
                      ref={(el) => (linkRefs.current[l.id] = el)}
                      href={`#${l.id}`}
                      onClick={(e) => handleClick(e, l.id)}
                      className={cn(
                        'inline-flex items-center text-[11px] md:text-[12px] lg:text-[13px] whitespace-nowrap transition-all duration-200 border-b-2',
                        isActive
                          ? 'text-[#2196F3] font-semibold border-[#2196F3]'
                          : cn(
                              'border-transparent font-normal',
                              isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#4A5568] hover:text-[#1A202C]'
                            )
                      )}
                    >
                      {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      {/* Spacer so content starts immediately below fixed navbar + section nav (no extra gap) */}
      <div aria-hidden="true" className="h-[80px] md:h-[104px] lg:h-[120px] mb-0" />
    </>
  );
}
