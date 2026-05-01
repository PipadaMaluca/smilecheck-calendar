import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface SectionNavProps {
  isDark: boolean;
}

export function SectionNav({ isDark }: SectionNavProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState<string>('');

  const links = [
    { id: 'funcionalidades', label: t('landing.navbar.features') },
    { id: 'planos', label: t('landing.navbar.plans') },
    { id: 'testemunhos', label: t('landing.navbar.testimonials') },
    { id: 'faq', label: t('landing.navbar.faq') },
    { id: 'contacto', label: t('landing.navbar.contact') },
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
      { rootMargin: '-120px 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className={cn(
        'sticky z-[39] border-b backdrop-blur-md',
        isDark ? 'border-[#1E3A5F]' : 'border-[#D6E4F0]'
      )}
      style={{
        top: 'var(--landing-navbar-h, 64px)',
        background: isDark ? 'rgba(10,25,41,0.85)' : 'rgba(245,249,255,0.85)',
        WebkitBackdropFilter: 'blur(12px)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto h-10 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide">
        <ul className="flex items-center justify-center gap-4 sm:gap-5 lg:gap-8 h-full min-w-max">
          {links.map((l) => {
            const isActive = active === l.id;
            return (
              <li key={l.id} className="h-full flex items-stretch">
                <a
                  href={`#${l.id}`}
                  onClick={(e) => handleClick(e, l.id)}
                  className={cn(
                    'inline-flex items-center text-[13px] whitespace-nowrap transition-all duration-200 border-b-2',
                    isActive
                      ? 'text-[#2196F3] font-bold border-[#2196F3]'
                      : cn(
                          'border-transparent font-medium',
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
  );
}