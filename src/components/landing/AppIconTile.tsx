import { Logo } from '@/components/branding/Logo';

/** iOS-style app icon tile with diffuse brand halo and a fading grid of empty tiles behind it. */
export function AppIconTile() {
  const cells = Array.from({ length: 35 });
  return (
    <div className="relative flex items-center justify-center w-full h-56 md:h-80">
      {/* Decorative grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          maskImage: 'radial-gradient(circle at center, black 10%, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 10%, transparent 65%)',
        }}
      >
        <div className="grid grid-cols-7 gap-4 md:gap-6">
          {cells.map((_, i) => (
            <div key={i} className="w-20 h-20 md:w-28 md:h-28 rounded-3xl md:rounded-4xl border border-border/60 bg-muted/40 dark:bg-muted/10 dark:border-border/30" />
          ))}
        </div>
      </div>
      {/* Halo */}
      <div
        aria-hidden="true"
        className="sc-halo absolute w-48 h-48 md:w-72 md:h-72 rounded-full bg-primary/40 dark:bg-primary/50 blur-3xl"
      />
      {/* Tile */}
      <div
        className="relative z-raised flex items-center justify-center w-36 h-36 md:w-52 md:h-52 bg-card border border-border/50 dark:border-border shadow-xl"
        style={{ borderRadius: '22%' }}
      >
        <Logo variant="icon" size={96} className="md:!w-32 md:!h-32" />
      </div>
    </div>
  );
}
