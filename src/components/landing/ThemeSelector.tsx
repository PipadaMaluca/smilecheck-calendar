import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const logoSrc = '/assets/smilecheck-logo-blue.png';

interface ThemeSelectorProps {
  onSelect: (dark: boolean) => void;
}

export function ThemeSelector({ onSelect }: ThemeSelectorProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (dark: boolean) => {
    setSelected(dark);
    setTimeout(() => onSelect(dark), 600);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300',
        selected !== null ? 'opacity-0 pointer-events-none' : 'opacity-100',
        'bg-gradient-to-br from-[hsl(220,40%,8%)] via-[hsl(220,30%,12%)] to-[hsl(220,40%,8%)]'
      )}
    >
      <div className="flex flex-col items-center gap-8 animate-fade-in px-4">
        <img
          src={logoSrc}
          alt="SmileCheck"
          className="h-[100px] sm:h-[120px] drop-shadow-[0_0_40px_hsla(217,91%,60%,0.3)]"
        />

        <div className="text-center">
          <p className="text-[hsl(220,15%,55%)] text-lg mt-2">
            Como prefere ver o nosso site?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto">
          <button
            onClick={() => handleSelect(false)}
            className="group w-full sm:w-48 h-40 sm:h-56 rounded-2xl border-2 border-[hsl(220,20%,30%)] hover:border-[hsl(45,93%,58%)] bg-gradient-to-b from-white to-[hsl(220,20%,95%)] flex flex-col items-center justify-center gap-3 sm:gap-4 transition-[transform,background-color,border-color,color,box-shadow] duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsla(45,93%,58%,0.2)] active:scale-95 min-h-[120px]"
          >
            <Sun className="w-10 h-10 sm:w-14 sm:h-14 text-[hsl(45,93%,47%)] group-hover:drop-shadow-[0_0_16px_hsla(45,93%,58%,0.6)] transition-[transform,background-color,border-color,color,box-shadow] duration-300" />
            <span className="text-[hsl(220,20%,20%)] font-semibold text-base sm:text-lg">
              Light Mode
            </span>
          </button>

          <button
            onClick={() => handleSelect(true)}
            className="group w-full sm:w-48 h-40 sm:h-56 rounded-2xl border-2 border-[hsl(220,20%,30%)] hover:border-[hsl(217,91%,60%)] bg-gradient-to-b from-[hsl(220,30%,18%)] to-[hsl(220,40%,10%)] flex flex-col items-center justify-center gap-3 sm:gap-4 transition-[transform,background-color,border-color,color,box-shadow] duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsla(217,91%,60%,0.2)] active:scale-95 min-h-[120px]"
          >
            <Moon className="w-10 h-10 sm:w-14 sm:h-14 text-[hsl(217,80%,65%)] group-hover:drop-shadow-[0_0_16px_hsla(217,91%,60%,0.6)] transition-[transform,background-color,border-color,color,box-shadow] duration-300" />
            <span className="text-[hsl(220,15%,80%)] font-semibold text-base sm:text-lg">
              Dark Mode
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
