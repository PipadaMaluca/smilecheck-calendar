import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

export function TrustBar() {
  const { t } = useTranslation();
  const badges = t('landing.trustBar.badges', { returnObjects: true }) as string[];

  return (
    <section className="py-12 px-4 bg-[#F5F9FF] dark:bg-[#0D2137] border-y border-[#E2E8F0] dark:border-[#1E3A5F]">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm font-medium text-[#4A5568] dark:text-[#94A3B8] mb-6">
          {t('landing.trustBar.subtitle')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
          {badges.map((b) => (
            <div
              key={b}
              className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity grayscale"
            >
              <ShieldCheck className="w-5 h-5 text-[#1A202C] dark:text-white" />
              <span className="text-sm font-semibold text-[#1A202C] dark:text-white tracking-tight">
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
