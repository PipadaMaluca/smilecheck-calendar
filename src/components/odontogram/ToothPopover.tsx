import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Surface, SURFACES, ToothData, ToothStatus } from './odontogramData';
import { useState, useEffect } from 'react';

interface ToothPopoverProps {
  toothId: string;
  data: ToothData;
  readOnly: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (toothId: string, data: ToothData) => void;
  children: React.ReactNode;
}

const STATUS_OPTIONS: ToothStatus[] = ['healthy', 'cavity', 'restoration', 'crown', 'missing', 'implant', 'rootCanal', 'prosthesis', 'toTreat'];

export function ToothPopover({ toothId, data, readOnly, open, onOpenChange, onSave, children }: ToothPopoverProps) {
  const { t } = useTranslation();
  const [localData, setLocalData] = useState<ToothData>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data, open]);

  const handleSurfaceChange = (surface: Surface, status: ToothStatus) => {
    setLocalData(prev => ({
      ...prev,
      surfaces: { ...prev.surfaces, [surface]: { status } },
      isMissing: status === 'missing',
    }));
  };

  const handleSave = () => {
    onSave(toothId, localData);
    onOpenChange(false);
  };

  const surfaceLabels: Record<Surface, string> = {
    M: t('odontogram.surfaces.mesial'),
    D: t('odontogram.surfaces.distal'),
    O: t('odontogram.surfaces.occlusal'),
    V: t('odontogram.surfaces.vestibular'),
    L: t('odontogram.surfaces.lingual'),
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 bg-card border-border" side="top" sideOffset={8}>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">{t('odontogram.tooth')} {toothId}</h4>

          {data.isMissing && readOnly ? (
            <p className="text-xs text-muted-foreground">{t('odontogram.status.missing')}</p>
          ) : (
            <div className="space-y-2">
              {SURFACES.map(s => (
                <div key={s} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground w-20">{surfaceLabels[s]}</span>
                  {readOnly ? (
                    <span className="text-xs font-medium">{t(`odontogram.status.${localData.surfaces[s].status}`)}</span>
                  ) : (
                    <Select
                      value={localData.surfaces[s].status}
                      onValueChange={(v) => handleSurfaceChange(s, v as ToothStatus)}
                    >
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(st => (
                          <SelectItem key={st} value={st} className="text-xs">
                            {t(`odontogram.status.${st}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}

          {readOnly ? (
            data.notes && <p className="text-xs text-muted-foreground border-t border-border pt-2">{data.notes}</p>
          ) : (
            <Textarea
              value={localData.notes}
              onChange={(e) => setLocalData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('odontogram.notesPlaceholder')}
              className="text-xs min-h-[50px] h-[50px]"
            />
          )}

          {!readOnly && (
            <Button size="sm" className="w-full" onClick={handleSave}>
              {t('odontogram.save')}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
