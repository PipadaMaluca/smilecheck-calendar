import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const logoSrc = '/assets/smilecheck-logo-blue.png';

interface LanguageSelectorProps {
  onSelect: (lang: string) => void;
}

const languages = [
  { code: 'pt', flag: '🇵🇹', label: 'Português' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

export function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const { i18n } = useTranslation();

  const handleSelect = (code: string) => {
    setSelected(code);
    i18n.changeLanguage(code);
    setTimeout(() => onSelect(code), 600);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[210] flex items-center justify-center transition-opacity duration-500',
        selected !== null ? 'opacity-0 pointer-events-none' : 'opacity-100',
        'bg-gradient-to-br from-[hsl(220,40%,8%)] via-[hsl(220,30%,12%)] to-[hsl(220,40%,8%)]'
      )}
    >
      <div className="flex flex-col items-center gap-8 animate-fade-in px-4 w-full max-w-sm">
        <img
          src={logoSrc}
          alt="SmileCheck"
          className="h-[100px] sm:h-[120px] drop-shadow-[0_0_40px_hsla(217,91%,60%,0.3)] animate-[pulse_3s_ease-in-out_infinite]"
        />

        <div className="text-center">
          <p className="text-[hsl(220,15%,80%)] text-base">
            Choose your language
          </p>
          <p className="text-[hsl(220,15%,55%)] text-sm mt-1">
            Escolha o seu idioma · Choisissez votre langue
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                'group w-full h-16 rounded-2xl border-2 border-[hsl(220,20%,30%)] hover:border-[hsl(217,91%,60%)]',
                'bg-gradient-to-r from-[hsl(220,30%,15%)] to-[hsl(220,30%,18%)]',
                'flex items-center gap-4 px-6 transition-all duration-300',
                'hover:scale-[1.02] hover:shadow-[0_0_30px_hsla(217,91%,60%,0.15)] active:scale-[0.98]'
              )}
            >
              <span className="text-3xl">{lang.flag}</span>
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
