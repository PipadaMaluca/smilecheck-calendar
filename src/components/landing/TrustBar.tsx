import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

export function TrustBar() {
  const { t } = useTranslation();
  const badges = t('landing.trustBar.badges', { returnObjects: true }) as string[];

  return (
    <section className="py-4 px-4 bg-[#F5F9FF] dark:bg-[#0D2137] border-y border-[#E2E8F0] dark:border-[#1E3A5F]">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs font-medium text-[#4A5568] dark:text-[#94A3B8] mb-2">
          {t('landing.trustBar.subtitle')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-10">
          {badges.map((b) => (
            <div
              key={b}
              className="flex items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity"
            >
              <ShieldCheck className="w-4 h-4 text-[#1565C0] dark:text-[#60A5FA]" />
              <span className="text-xs font-semibold text-[#1A202C] dark:text-white tracking-tight">
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
