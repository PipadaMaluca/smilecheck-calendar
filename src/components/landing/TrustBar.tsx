import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

export function TrustBar() {
  const { t } = useTranslation();
  const badges = t('landing.trustBar.badges', { returnObjects: true }) as string[];

  return (
    <section className="py-4 px-4 bg-background dark:bg-card border-y border-border">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {t('landing.trustBar.subtitle')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-10">
          {badges.map((b) => (
            <div
              key={b}
              className="flex items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity"
            >
              <ShieldCheck className="w-4 h-4 text-primary dark:text-primary" />
              <span className="text-xs font-semibold text-foreground tracking-tight">
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
