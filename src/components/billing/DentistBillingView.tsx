import { useState } from 'react';
import { Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { dentistTeleconsultas, dentistRevenueMonths, generateReceipt } from './billingMockData';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DentistBillingViewProps {
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export function DentistBillingView({ initialTab, onNavigate }: DentistBillingViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab || 'resumo');
  const [chartToggle, setChartToggle] = useState<'total' | 'presencial' | 'teleconsulta'>('total');
  const [filter, setFilter] = useState('mes');

  const totalRevenue = 2450;
  const teleRevenue = 240;
  const commission = 36;
  const net = 2414;

  const totalTele = dentistTeleconsultas.reduce((s, t) => s + t.amount, 0);
  const totalComm = dentistTeleconsultas.reduce((s, t) => s + t.commission, 0);
  const totalNet = dentistTeleconsultas.reduce((s, t) => s + t.net, 0);

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-2xl mx-auto space-y-6 pb-32">
        <div>
          <h1 className="text-xl font-bold text-foreground">Faturação</h1>
          <p className="text-sm text-muted-foreground mt-1">Receitas, teleconsultas e dados fiscais</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="teleconsultas">Teleconsultas</TabsTrigger>
            <TabsTrigger value="plano">Plano</TabsTrigger>
            <TabsTrigger value="dados">Dados Fiscais</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Receita este mês</p>
                  <p className="text-2xl font-bold text-foreground mt-1">€{totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Teleconsultas</p>
                  <p className="text-2xl font-bold text-foreground mt-1">12</p>
                  <p className="text-xs text-muted-foreground">€{teleRevenue}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Comissão SmileCheck (15%)</p>
                  <p className="text-2xl font-bold text-destructive mt-1">€{commission}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Líquido</p>
                  <p className="text-2xl font-bold text-primary mt-1">€{net.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Receita mensal</CardTitle>
                  <div className="flex gap-1">
                    {(['total', 'presencial', 'teleconsulta'] as const).map(t => (
                      <Button key={t} size="sm" variant={chartToggle === t ? 'default' : 'outline'} onClick={() => setChartToggle(t)} className="text-xs capitalize h-7 px-2">
                        {t === 'total' ? 'Total' : t === 'presencial' ? 'Presenciais' : 'Teleconsultas'}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dentistRevenueMonths}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                      {(chartToggle === 'total' || chartToggle === 'presencial') && <Bar dataKey="presencial" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Presencial" />}
                      {(chartToggle === 'total' || chartToggle === 'teleconsulta') && <Bar dataKey="teleconsulta" fill="hsl(210, 80%, 65%)" radius={[4, 4, 0, 0]} name="Teleconsulta" />}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teleconsultas" className="space-y-4 mt-4">
            <div className="flex gap-2 flex-wrap">
              {[{ k: 'mes', l: 'Este mês' }, { k: 'trim', l: 'Trimestre' }, { k: 'ano', l: 'Ano' }].map(f => (
                <Button key={f.k} size="sm" variant={filter === f.k ? 'default' : 'outline'} onClick={() => setFilter(f.k)} className="text-xs">
                  {f.l}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              {dentistTeleconsultas.map(t => (
                <Card key={t.id} className="bg-card/80 backdrop-blur border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{t.date} — {t.patient}</p>
                        <p className="text-xs text-muted-foreground">{t.duration} · €{t.amount} · Comissão: €{t.commission} · Líquido: €{t.net}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { generateReceipt(t.id, `Teleconsulta ${t.patient}`, t.amount, 'Transferência'); toast.success('Recibo descarregado'); }}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{dentistTeleconsultas.length} teleconsultas</span>
                <span className="text-muted-foreground">€{totalTele} · Comissão: €{totalComm.toFixed(2)} · <span className="text-primary font-bold">Líquido: €{totalNet.toFixed(2)}</span></span>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plano" className="space-y-4 mt-4">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Pro</p>
                    <p className="text-xs text-muted-foreground">€19,99/mês</p>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Activo</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Próxima faturação: 1 Fev 2026</p>
                  <p>Método: Visa ****4532</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => onNavigate?.('plano')}>Alterar Plano</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Dados Fiscais</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><label className="text-xs text-muted-foreground">Nome / Razão Social</label><Input defaultValue="Dr. Gonçalo Pipo" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">NIF</label><Input defaultValue="234 567 890" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">Morada fiscal</label><Input defaultValue="Rua dos Dentistas, 25, 1200-100 Lisboa" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">IBAN (pagamentos teleconsultas)</label><Input defaultValue="PT50 0035 0000 0000 0000 0001 2" className="mt-1" /></div>
                <Button className="w-full" onClick={() => toast.success('Dados guardados')}>Guardar</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
