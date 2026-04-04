import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, subDays } from 'date-fns';
import { pt, enUS, fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const dateLocales = { pt, en: enUS, fr } as const;

interface DateNavigatorProps {
  date: Date;
  onDateChange: (date: Date) => void;
  viewMode?: 'day' | 'week' | 'month';
  onViewModeChange?: (mode: 'day' | 'week' | 'month') => void;
  showViewToggle?: boolean;
}

export function DateNavigator({
  date,
  onDateChange,
  viewMode = 'day',
  onViewModeChange,
  showViewToggle = false,
}: DateNavigatorProps) {
  const { t, i18n } = useTranslation();
  const locale = dateLocales[i18n.language] || pt;

  return (
    <div className="px-4 py-3 space-y-3 w-full max-w-full">
      <div className="flex items-center justify-between w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(subDays(date, 1))}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-base font-semibold capitalize text-center flex-1 px-2">
          {format(date, "EEEE, d MMMM", { locale })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(addDays(date, 1))}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {showViewToggle && onViewModeChange && (
        <div className="flex items-center justify-center gap-1 bg-secondary/30 rounded-lg p-1">
          {(['day', 'week', 'month'] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange(mode)}
              className="flex-1 text-xs capitalize"
            >
              {mode === 'day' ? t('agenda.day') : mode === 'week' ? t('agenda.week') : t('agenda.month')}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
