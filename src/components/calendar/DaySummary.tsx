import { BarChart3, Video, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DaySummary as DaySummaryType } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DaySummaryProps {
  summary: DaySummaryType;
  showRevenue?: boolean;
  className?: string;
}

export function DaySummary({ summary, showRevenue = true, className }: DaySummaryProps) {
  const { t } = useTranslation();
  return (
    <div className={cn('bg-card rounded-xl p-4 mx-4 animate-fade-in', className)}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">{t('daySummary.title')}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-presencial" />
            <span className="text-xs text-muted-foreground">{t('daySummary.inPerson')}</span>
          </div>
          <p className="text-xl font-bold text-presencial">{summary.presenciais}</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-3.5 h-3.5 text-teleconsulta" />
            <span className="text-xs text-muted-foreground">{t('daySummary.teleconsultations')}</span>
          </div>
          <p className="text-xl font-bold text-teleconsulta">{summary.teleconsultas}</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t('daySummary.freeSlots')}</span>
          </div>
          <p className="text-xl font-bold">{summary.vagasLivres}</p>
        </div>
        {showRevenue && (
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">💰</span>
              <span className="text-xs text-muted-foreground">{t('daySummary.teleconsultations')}</span>
            </div>
            <p className="text-xl font-bold text-primary">€{summary.totalRevenue}</p>
          </div>
        )}
      </div>
    </div>
  );
}
