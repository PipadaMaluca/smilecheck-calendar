import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const flags: Record<string, string> = { pt: '🇵🇹', fr: '🇫🇷', en: '🇬🇧' };
const langs = ['pt', 'fr', 'en'] as const;

interface LanguageSwitcherProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function LanguageSwitcher({ className, size = 'sm' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  return (
    <div className={cn('flex items-center gap-0', className)}>
      {langs.map((lang) => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          className={cn(
            'transition-all duration-200 rounded-md',
            size === 'sm' ? 'text-lg p-1 px-[5px] my-0 text-center border mx-[2px] py-0' : 'text-xl p-1.5',
            i18n.language === lang
              ? 'opacity-100 scale-110 bg-primary/10'
              : 'opacity-50 hover:opacity-80 hover:scale-105'
          )}
          aria-label={lang.toUpperCase()}
        >
          {flags[lang]}
        </button>
      ))}
    </div>
  );
}
