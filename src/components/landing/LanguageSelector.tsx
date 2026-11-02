import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Languages } from 'lucide-react';
import { LANGUAGE_CHOSEN_KEY } from '@/i18n';

import { AppIconTile } from './AppIconTile';

interface LanguageSelectorProps {
  onSelect: (lang: string) => void;
}

// Language names in their own language; flags are local SVGs (flag emojis render as "PT"/"GB" on Windows).
const languages = [
  { code: 'pt', label: 'Português', flag: '/flags/pt.svg' },
  { code: 'fr', label: 'Français', flag: '/flags/fr.svg' },
  { code: 'en', label: 'English', flag: '/flags/gb.svg' },
];

export function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const { i18n, t } = useTranslation();

  const handleSelect = (code: string) => {
    setSelected(code);
    i18n.changeLanguage(code);
    localStorage.setItem(LANGUAGE_CHOSEN_KEY, '1');
    setTimeout(() => onSelect(code), 600);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-celebration flex items-center justify-center overflow-hidden transition-opacity duration-300',
        selected !== null ? 'opacity-0 pointer-events-none' : 'opacity-100',
        'bg-gradient-to-br from-[hsl(220,40%,8%)] via-[hsl(220,30%,12%)] to-[hsl(220,40%,8%)]'
      )}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in px-4 w-full max-w-3xl max-h-full overflow-y-auto overflow-x-hidden py-6">
        <div className="w-full -my-6 md:-my-10 pointer-events-none">
          <AppIconTile forceDark />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[hsl(220,15%,95%)]">SmileCheck</h1>

        <div className="text-center">
          <p className="text-[hsl(220,15%,80%)] text-base inline-flex items-center gap-2">
            <Languages className="w-4 h-4" aria-hidden />
            {t('language.title')}
          </p>
          <p className="text-[hsl(220,15%,55%)] text-sm mt-1">
            {t('language.subtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {languages.map((lang) => (
            <button
              key={lang.code}
              lang={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                'group w-full h-16 rounded-2xl border-2 border-[hsl(220,20%,30%)] hover:border-[hsl(217,91%,60%)]',
                'bg-gradient-to-r from-[hsl(220,30%,15%)] to-[hsl(220,30%,18%)]',
                'flex items-center justify-start gap-4 px-6 transition-[transform,background-color,border-color,color,box-shadow] duration-300',
                'hover:scale-[1.02] hover:shadow-[0_0_30px_hsla(217,91%,60%,0.15)] active:scale-[0.98]'
              )}
            >
              <img src={lang.flag} alt="" width={24} height={16} className="w-6 h-4 rounded-xs object-cover shrink-0 shadow-sm" />
              <span className="text-[hsl(220,15%,85%)] font-semibold text-lg group-hover:text-white transition-colors">
                {lang.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
