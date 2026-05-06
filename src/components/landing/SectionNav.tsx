import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface SectionNavProps {
  isDark: boolean;
}

export function SectionNav({ isDark }: SectionNavProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState<string>('funcionalidades');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const links = [
    { id: 'funcionalidades', label: t('landing.navbar.features') },
    { id: 'planos', label: t('landing.navbar.plans') },
    { id: 'testemunhos', label: t('landing.navbar.testimonials') },
    { id: 'faq', label: t('landing.navbar.faq') },
  ];

  useEffect(() => {
    const ids = links.map((l) => l.id);
    const getSections = () =>
      ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el);

    const computeActive = () => {
      const sections = getSections();
      if (sections.length === 0) return;
      const offset = 160; // navbar + section nav height + a bit
      const scrollY = window.scrollY;

      // At very top → first section
      if (scrollY < (sections[0].offsetTop - offset - 50)) {
        setActive(ids[0]);
        return;
      }

      // At/near bottom → last section
      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 4) {
        setActive(ids[ids.length - 1]);
        return;
      }

      // Otherwise, the section whose top is just above the offset line
      let current = ids[0];
      for (const s of sections) {
        if (s.getBoundingClientRect().top - offset <= 0) {
          current = s.id;
        } else {
          break;
        }
      }
      setActive(current);
    };

    computeActive();
    window.addEventListener('scroll', computeActive, { passive: true });
    window.addEventListener('resize', computeActive);
    return () => {
      window.removeEventListener('scroll', computeActive);
      window.removeEventListener('resize', computeActive);
    };
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
    const heading = document.getElementById(`${id}-title`) || document.getElementById(id);
    if (heading) heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Fixed second header — directly below main navbar */}
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
