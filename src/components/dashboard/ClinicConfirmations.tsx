import { useMemo } from 'react';
import { CheckCircle2, Clock, XCircle, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockConfirmations, ConfirmationStatus } from '@/types/scoring';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function ClinicConfirmations() {
  const { t } = useTranslation();
  const confirmed = useMemo(() =>
    mockConfirmations.filter(c => c.status24h === 'confirmed' && c.status1h === 'confirmed').length,
  []);
  const pending = useMemo(() =>
    mockConfirmations.filter(c => c.status24h === 'pending' || c.status1h === 'pending').length,
  []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{t('dashboard.confirmations')}</h2>
        <Badge variant="outline" className="gap-1.5 text-xs border-primary/30 text-primary">
          <Radio className="w-3 h-3 animate-pulse" />
          {t('dashboard.live')}
        </Badge>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-4 py-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{t('dashboard.confirmed')}: {confirmed}</span>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 rounded-lg px-4 py-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-foreground">{t('dashboard.pending')}: {pending}</span>
        </div>
      </div>

      {/* List */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-0 divide-y divide-[#E2E8F0] dark:divide-white/[0.08]">
          {mockConfirmations.map((conf) => {
            const isFullyConfirmed = conf.status24h === 'confirmed' && conf.status1h === 'confirmed';
            const isDeclined = conf.status24h === 'declined' || conf.status1h === 'declined';
            const StatusIcon = isFullyConfirmed ? CheckCircle2 : isDeclined ? XCircle : Clock;
            const statusColor = isFullyConfirmed ? 'text-primary' : isDeclined ? 'text-destructive' : 'text-amber-400';
            return (
              <div
                key={conf.consultationId}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <span className="text-sm font-mono text-muted-foreground w-12 flex-shrink-0">{conf.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{conf.patientName}</p>
                  <p className="text-xs text-muted-foreground truncate">{conf.dentistName}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ConfirmBadge label="24h" status={conf.status24h} />
                  <ConfirmBadge label="1h" status={conf.status1h} />
                  <StatusIcon className={cn('w-5 h-5', statusColor)} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function ConfirmBadge({ label, status }: { label: string; status: ConfirmationStatus }) {
  return (
    <span className={cn(
      'text-[10px] font-medium px-1.5 py-0.5 rounded',
      status === 'confirmed' ? 'bg-primary/10 text-primary' :
      status === 'declined' ? 'bg-destructive/10 text-destructive' :
      'bg-amber-500/10 text-amber-400'
    )}>
      {label} {status === 'confirmed' ? '✓' : status === 'declined' ? '✗' : '⏳'}
    </span>
  );
}

