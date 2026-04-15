import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { OdontogramState, OdontogramHistory, ToothData, STATUS_COLORS, ToothStatus, UPPER_RIGHT, UPPER_LEFT, LOWER_LEFT, LOWER_RIGHT, getJoaoSilvaMockData } from './odontogramData';
import { ToothSVG } from './ToothSVG';
import { ToothPopover } from './ToothPopover';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface OdontogramChartProps {
  readOnly?: boolean;
}

const LEGEND_ITEMS: { status: ToothStatus; key: string }[] = [
  { status: 'healthy', key: 'healthy' },
  { status: 'cavity', key: 'cavity' },
  { status: 'restoration', key: 'restoration' },
  { status: 'crown', key: 'crown' },
  { status: 'missing', key: 'missing' },
  { status: 'implant', key: 'implant' },
  { status: 'rootCanal', key: 'rootCanal' },
  { status: 'prosthesis', key: 'prosthesis' },
  { status: 'toTreat', key: 'toTreat' },
];

export function OdontogramChart({ readOnly = false }: OdontogramChartProps) {
  const { t } = useTranslation();
  const mock = getJoaoSilvaMockData();
  const [odontogram, setOdontogram] = useState<OdontogramState>(mock.state);
  const [history] = useState<OdontogramHistory[]>(mock.history);
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);

  const handleSave = (toothId: string, data: ToothData) => {
    setOdontogram(prev => ({ ...prev, [toothId]: data }));
    toast.success(t('odontogram.saved'));
    setSelectedTooth(null);
  };

  const renderRow = (teeth: string[], label: string) => (
    <div className="flex items-center gap-0.5 md:gap-1">
      {teeth.map(id => (
        <ToothPopover
          key={id}
          toothId={id}
          data={odontogram[id]}
          readOnly={readOnly}
          open={selectedTooth === id}
          onOpenChange={(open) => setSelectedTooth(open ? id : null)}
          onSave={handleSave}
        >
          <div>
            <ToothSVG
              toothId={id}
              data={odontogram[id]}
              isSelected={selectedTooth === id}
              onClick={() => setSelectedTooth(selectedTooth === id ? null : id)}
              size={36}
            />
          </div>
        </ToothPopover>
      ))}
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase">
        {t('odontogram.title')}
      </h3>

      {/* Dental chart */}
      <div className="overflow-x-auto">
        <div className="min-w-[580px] mx-auto space-y-1">
          {/* Upper jaw */}
          <div className="flex items-end justify-center">
            <span className="text-[9px] text-muted-foreground/50 mr-1 mb-4">R</span>
            <div className="flex items-end">
              {renderRow(UPPER_RIGHT, 'UR')}
              <div className="w-px h-12 bg-border/40 mx-1 mb-4" />
              {renderRow(UPPER_LEFT, 'UL')}
            </div>
            <span className="text-[9px] text-muted-foreground/50 ml-1 mb-4">L</span>
          </div>

          <div className="w-full h-px bg-border/30" />

          {/* Lower jaw */}
          <div className="flex items-start justify-center">
            <span className="text-[9px] text-muted-foreground/50 mr-1 mt-4">R</span>
            <div className="flex items-start">
              {renderRow(LOWER_RIGHT, 'LR')}
              <div className="w-px h-12 bg-border/40 mx-1 mt-4" />
              {renderRow(LOWER_LEFT, 'LL')}
            </div>
            <span className="text-[9px] text-muted-foreground/50 ml-1 mt-4">L</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center pt-2">
        {LEGEND_ITEMS.map(({ status, key }) => {
          const c = STATUS_COLORS[status];
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm border"
                style={{
                  backgroundColor: c.fill === 'transparent' ? 'transparent' : c.fill,
                  borderColor: c.stroke || c.fill,
                  borderStyle: c.dashed ? 'dashed' : 'solid',
                }}
              />
              <span className="text-[10px] text-muted-foreground">{t(`odontogram.status.${key}`)}</span>
            </div>
          );
        })}
      </div>

      {/* History log */}
      {history.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase">
              {t('odontogram.historyTitle')}
            </h4>
            <div className="space-y-1.5">
              {history.map((h, i) => (
                <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-foreground/70 whitespace-nowrap">{h.date}</span>
                  <span>—</span>
                  <span>
                    <span className="text-foreground/80">{h.dentist}</span>
                    {' — '}{t('odontogram.tooth')} {h.tooth}: {t(h.description)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
