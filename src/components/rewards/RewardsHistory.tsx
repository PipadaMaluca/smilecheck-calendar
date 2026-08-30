import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { RedeemHistoryItem } from '@/data/rewardsData';
import { ListSkeleton } from '@/components/skeletons';

const STATUS_KEYS: Record<string, { labelKey: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendente: { labelKey: 'store.statusPending', variant: 'secondary' },
  usado: { labelKey: 'store.statusUsed', variant: 'default' },
  expirado: { labelKey: 'store.statusExpired', variant: 'destructive' },
};

const FILTER_KEYS = [
  { value: 'all', labelKey: 'store.filterAll' },
  { value: 'pendente', labelKey: 'store.filterPending' },
  { value: 'usado', labelKey: 'store.filterUsed' },
  { value: 'expirado', labelKey: 'store.filterExpired' },
] as const;

interface RewardsHistoryProps {
  /** Mock list in demo mode, real `redemptions` rows for authenticated users. */
  items: RedeemHistoryItem[];
  loading?: boolean;
}

export function RewardsHistory({ items, loading = false }: RewardsHistoryProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleCopy = (item: RedeemHistoryItem) => {
    navigator.clipboard.writeText(item.code);
    setCopiedId(item.id);
    toast.success(t('store.codeCopied'));
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {FILTER_KEYS.map(f => (
          <Button key={f.value} variant={filter === f.value ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f.value)} className="text-xs">
            {t(f.labelKey)}
          </Button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t('store.noRedeems')}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const status = STATUS_KEYS[item.status];
            return (
              <Card key={item.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                      <span className="text-xs font-mono text-muted-foreground">{item.code}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={status.variant} className="text-xs">{t(status.labelKey)}</Badge>
                    <span className="text-sm font-bold text-destructive">−{item.points}</span>
                    {item.status === 'pendente' && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(item)}>
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
