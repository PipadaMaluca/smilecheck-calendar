import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const allDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const hours = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

const dentistColors = [
  { name: 'Dr. Gonçalo Pipo', color: 'bg-blue-500/60', border: 'border-blue-500' },
  { name: 'Dr. Alexandre Bernardo', color: 'bg-emerald-500/60', border: 'border-emerald-500' },
  { name: 'Dr. Gil Santos', color: 'bg-orange-500/60', border: 'border-orange-500' },
];

const coverage: Record<string, { dentists: number[]; label: string; status: 'full' | 'partial' | 'minimum' | 'closed' }> = {
  'Segunda': { dentists: [0, 1, 2], label: '3 dentistas', status: 'full' },
  'Terça': { dentists: [0, 1, 2], label: '3 dentistas', status: 'full' },
  'Quarta': { dentists: [0, 1], label: '2 dentistas', status: 'partial' },
  'Quinta': { dentists: [0, 1, 2], label: '3 dentistas', status: 'full' },
  'Sexta': { dentists: [0, 1, 2], label: '3 dentistas', status: 'full' },
  'Sábado': { dentists: [0], label: '1 dentista', status: 'minimum' },
  'Domingo': { dentists: [], label: '0 dentistas', status: 'closed' },
};

const statusConfig = {
  full: { icon: '✅', text: 'cobertura total', className: 'text-emerald-500' },
  partial: { icon: '⚠️', text: 'cobertura parcial', className: 'text-amber-500' },
  minimum: { icon: '⚠️', text: 'cobertura mínima', className: 'text-amber-500' },
  closed: { icon: '❌', text: 'fechado', className: 'text-destructive' },
};

// Only show days that have coverage (not closed)
const activeDays = allDays.filter((d) => coverage[d].status !== 'closed');

export function CoverageTab() {
  const colCount = activeDays.length;

  return (
    <div className="space-y-6 pb-20">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {dentistColors.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-sm', d.color)} />
            <span className="text-xs">{d.name}</span>
          </div>
        ))}
      </div>

      {/* Visual Grid — scroll only on mobile (<768px) */}
      <div className="border border-border/50 rounded-lg bg-card p-3 relative">
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-card to-transparent z-10 md:hidden" />
        <div
          className="md:overflow-visible"
          style={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
          }}
        >
          <div
            className="md:min-w-0"
            style={{ minWidth: '700px' }}
          >
            {/* Header */}
            <div
              style={{ display: 'grid', gridTemplateColumns: `max-content repeat(${colCount}, 1fr)`, gap: '4px' }}
              className="mb-2"
            >
              <div
                className="text-xs font-medium text-muted-foreground sticky left-0 z-[5] md:static pr-2"
                style={{ background: 'hsl(var(--card))' }}
              >
                Hora
              </div>
              {activeDays.map((d) => (
                <div key={d} className="text-xs font-medium text-center">{d.slice(0, 3)}</div>
              ))}
            </div>
            {/* Time rows */}
            {hours.map((hour) => (
              <div
                key={hour}
                style={{ display: 'grid', gridTemplateColumns: `max-content repeat(${colCount}, 1fr)`, gap: '4px' }}
                className="mb-0.5"
              >
                <div
                  className="text-[10px] text-muted-foreground py-1 sticky left-0 z-[5] md:static pr-2 whitespace-nowrap"
                  style={{ background: 'hsl(var(--card))' }}
                >
                  {hour}
                </div>
                {activeDays.map((day) => {
                  const cov = coverage[day];
                  const hourNum = parseInt(hour);
                  const isOpen = hourNum >= 9 && (day === 'Sábado' ? hourNum < 13 : hourNum < 19);
                  return (
                    <div key={day} className="flex gap-px h-5">
                      {isOpen ? cov.dentists.map((dIdx) => (
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

      {/* Summary — only active days */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📋 Resumo de Cobertura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4">
          {activeDays.map((day) => {
            const cov = coverage[day];
            const status = statusConfig[cov.status];
            return (
              <div key={day} className="text-sm">
                <span className="font-medium">{day}</span>
                <span className="text-muted-foreground"> — </span>
                <span className={cn('text-xs', status.className)}>
                  {cov.label} ({status.icon} {status.text})
                </span>
              </div>
            );
          })}
          <div className="mt-3 p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
            ⚠️ Considere adicionar cobertura à quarta-feira
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="gap-2 w-full sm:w-auto">
        <FileText className="w-4 h-4" />Exportar Horários
      </Button>
    </div>
  );
}
