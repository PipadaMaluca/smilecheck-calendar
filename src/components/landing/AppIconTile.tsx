import { useEffect, useState } from 'react';

function isDark() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
}

/** iOS-style app icon tile with diffuse brand halo and a fading grid of empty tiles behind it. */
export function AppIconTile({ forceDark = false }: { forceDark?: boolean } = {}) {
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const base = `/logos/app_tile_${dark || forceDark ? 'dark' : 'light'}`;
  const cells = Array.from({ length: 35 });

  return (
    <div className="relative flex items-center justify-center w-full h-56 md:h-80">
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          maskImage: 'radial-gradient(circle at center, black 10%, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 10%, transparent 65%)',
        }}
      >
        <div className="grid grid-cols-7 gap-x-5 gap-y-4 md:gap-x-7 md:gap-y-6">
          {cells.map((_, i) => (
            <div key={i} className={forceDark ? "w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl border border-primary-foreground/10 bg-primary-foreground/[0.03]" : "w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl border border-border/30 bg-muted/20 dark:bg-muted/10 dark:border-border/35"} />
          ))}
        </div>
      </div>
      <div aria-hidden="true" className={`sc-halo absolute w-48 h-48 md:w-72 md:h-72 rounded-full ${forceDark ? "bg-primary/50" : "bg-primary/40 dark:bg-primary/50"} blur-3xl`} />
      <picture>
        <source srcSet={`${base}.webp`} type="image/webp" />
        <img
          src={`${base}.png`}
          alt="SmileCheck"
          width={200}
          height={200}
          decoding="async"
          draggable={false}
          className="relative z-raised w-36 h-36 md:w-52 md:h-52 shadow-xl select-none"
          style={{ borderRadius: '22%' }}
        />
      </picture>
    </div>
  );
}
