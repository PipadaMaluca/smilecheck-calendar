import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { RedeemHistoryItem, MOCK_REDEEM_HISTORY } from '@/data/rewardsData';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendente: { label: 'Pendente', variant: 'secondary' },
  usado: { label: 'Usado', variant: 'default' },
  expirado: { label: 'Expirado', variant: 'destructive' },
};

const FILTERS = ['Todos', 'Pendentes', 'Usados', 'Expirados'] as const;

export function RewardsHistory() {
  const [filter, setFilter] = useState<string>('Todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = MOCK_REDEEM_HISTORY.filter(item => {
    if (filter === 'Todos') return true;
    if (filter === 'Pendentes') return item.status === 'pendente';
    if (filter === 'Usados') return item.status === 'usado';
    if (filter === 'Expirados') return item.status === 'expirado';
    return true;
  });

  const handleCopy = (item: RedeemHistoryItem) => {
    navigator.clipboard.writeText(item.code);
    setCopiedId(item.id);
    toast.success('Código copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="text-xs"
          >
            {f}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhum resgate encontrado.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const status = STATUS_MAP[item.status];
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
                    <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
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
