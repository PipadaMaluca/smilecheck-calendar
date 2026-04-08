import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const dayShortKeys = ['common.weekdays.mon', 'common.weekdays.tue', 'common.weekdays.wed', 'common.weekdays.thu', 'common.weekdays.fri', 'common.weekdays.sat', 'common.weekdays.sun'];
const dayFullKeys = ['common.weekdays.monFull', 'common.weekdays.tueFull', 'common.weekdays.wedFull', 'common.weekdays.thuFull', 'common.weekdays.friFull', 'common.weekdays.satFull', 'common.weekdays.sunFull'];
const hours = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

const dentistColors = [
  { name: 'Dr. Gonçalo Pipo', color: 'bg-blue-500/60', border: 'border-blue-500' },
  { name: 'Dr. Alexandre Bernardo', color: 'bg-emerald-500/60', border: 'border-emerald-500' },
  { name: 'Dr. Gil Santos', color: 'bg-orange-500/60', border: 'border-orange-500' },
];

const coverageData: { dentists: number[]; status: 'full' | 'partial' | 'minimum' | 'closed'; count: number }[] = [
  { dentists: [0, 1, 2], status: 'full', count: 3 },
  { dentists: [0, 1, 2], status: 'full', count: 3 },
  { dentists: [0, 1], status: 'partial', count: 2 },
  { dentists: [0, 1, 2], status: 'full', count: 3 },
  { dentists: [0, 1, 2], status: 'full', count: 3 },
  { dentists: [0], status: 'minimum', count: 1 },
  { dentists: [], status: 'closed', count: 0 },
];

export function CoverageTab() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const statusTextKeys: Record<string, string> = {
    full: 'team.fullCoverage',
    partial: 'team.partialCoverage',
    minimum: 'team.minimumCoverage',
    closed: 'team.closed',
  };

  const statusClassNames: Record<string, string> = {
    full: 'text-emerald-500',
    partial: 'text-amber-500',
    minimum: 'text-amber-500',
    closed: 'text-destructive',
  };

  const statusIcons: Record<string, string> = { full: '✅', partial: '⚠️', minimum: '⚠️', closed: '❌' };

  const activeDayIndices = coverageData.map((c, i) => ({ ...c, dayIdx: i })).filter(c => c.status !== 'closed');
  const colCount = activeDayIndices.length;

  const allDays = coverageData.map((c, i) => ({ ...c, dayIdx: i }));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-wrap gap-3 px-1">
        {dentistColors.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-sm', d.color)} />
            <span className="text-xs">{d.name}</span>
          </div>
        ))}
      </div>

      <div className="border border-border/50 rounded-lg bg-card p-3 relative">
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-card to-transparent z-10 md:hidden" />
        <div className="md:overflow-visible" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}>
          <div className="md:min-w-0" style={{ minWidth: '700px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `max-content repeat(${colCount}, 1fr)`, gap: '4px' }} className="mb-2">
              <div className="text-xs font-medium text-muted-foreground sticky left-0 z-[5] md:static pr-2" style={{ background: 'hsl(var(--card))' }}>
                {t('team.hour')}
              </div>
              {activeDayIndices.map((d) => (
                <div key={d.dayIdx} className="font-medium text-center text-sm">{t(dayShortKeys[d.dayIdx])}</div>
              ))}
            </div>
            {hours.map((hour) => (
              <div key={hour} style={{ display: 'grid', gridTemplateColumns: `max-content repeat(${colCount}, 1fr)`, gap: '4px' }} className="mb-0.5">
                <div className="text-[10px] text-muted-foreground py-1 sticky left-0 z-[5] md:static pr-2 whitespace-nowrap" style={{ background: 'hsl(var(--card))' }}>
                  {hour}
                </div>
                {activeDayIndices.map((day) => {
                  const hourNum = parseInt(hour);
                  const isSat = day.dayIdx === 5;
                  const isOpen = hourNum >= 9 && (isSat ? hourNum < 13 : hourNum < 19);
                  return (
                    <div key={day.dayIdx} className="flex gap-px h-5">
                      {isOpen ? day.dentists.map((dIdx) => (
                        <div key={dIdx} className={cn('flex-1 rounded-sm', dentistColors[dIdx].color)} />
                      )) : (
                        <div className="flex-1 rounded-sm bg-muted/30" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📋 {t('team.coverageSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold border-r border-border/50" style={{ width: '25%', padding: '12px 16px' }}>{t('team.day')}</TableHead>
                <TableHead className="font-semibold border-r border-border/50" style={{ width: '55%', padding: '12px 16px' }}>{t('team.coverageLabel')}</TableHead>
                <TableHead className="font-semibold" style={{ width: '20%', padding: '12px 16px', textAlign: 'center' }}>{t('team.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDays.map((day) => (
                <TableRow key={day.dayIdx}>
                  <TableCell className="font-medium text-sm border-r border-border/50" style={{ width: '25%', padding: '12px 16px' }}>
                    {isMobile ? t(dayShortKeys[day.dayIdx]) : t(dayFullKeys[day.dayIdx])}
                  </TableCell>
                  <TableCell className="border-r border-border/50" style={{ width: '55%', padding: '12px 16px' }}>
                    <span className={cn('text-sm', statusClassNames[day.status])}>
                      {day.count} {day.count === 1 ? t('team.dentist1') : t('team.dentists')} ({t(statusTextKeys[day.status])})
                    </span>
                  </TableCell>
                  <TableCell className="text-base" style={{ width: '20%', padding: '12px 16px', textAlign: 'center' }}>
                    {statusIcons[day.status]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3 mx-4 p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
            ⚠️ {t('team.considerAddingCoverage')}
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="gap-2 w-full sm:w-auto">
        <FileText className="w-4 h-4" />{t('team.exportSchedules')}
      </Button>
    </div>
  );
}
