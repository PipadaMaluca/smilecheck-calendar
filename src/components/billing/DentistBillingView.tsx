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
import { useTranslation } from 'react-i18next';

interface DentistBillingViewProps {
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export function DentistBillingView({ initialTab, onNavigate }: DentistBillingViewProps) {
  const { t } = useTranslation();
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
          <h1 className="text-xl font-bold text-foreground">{t('billing.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('billing.subtitle')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="resumo">{t('billing.summary')}</TabsTrigger>
            <TabsTrigger value="teleconsultas">{t('billing.teleconsultas')}</TabsTrigger>
            <TabsTrigger value="plano">{t('billing.plan')}</TabsTrigger>
            <TabsTrigger value="dados">{t('billing.fiscalData')}</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('billing.revenue')}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">€{totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('billing.teleconsultas')}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">12</p>
                  <p className="text-xs text-muted-foreground">€{teleRevenue}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('billing.commission')} (15%)</p>
                  <p className="text-2xl font-bold text-destructive mt-1">€{commission}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('billing.net')}</p>
                  <p className="text-2xl font-bold text-primary mt-1">€{net.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t('billing.monthlyRevenue')}</CardTitle>
                  <div className="flex gap-1">
                    {(['total', 'presencial', 'teleconsulta'] as const).map(tog => (
                      <Button key={tog} size="sm" variant={chartToggle === tog ? 'default' : 'outline'} onClick={() => setChartToggle(tog)} className="text-xs capitalize h-7 px-2">
                        {tog === 'total' ? t('billing.total') : tog === 'presencial' ? t('billing.inPerson') : t('billing.teleconsultas')}
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
                      {(chartToggle === 'total' || chartToggle === 'presencial') && <Bar dataKey="presencial" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={t('billing.inPerson')} />}
                      {(chartToggle === 'total' || chartToggle === 'teleconsulta') && <Bar dataKey="teleconsulta" fill="hsl(210, 80%, 65%)" radius={[4, 4, 0, 0]} name={t('billing.teleconsultas')} />}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teleconsultas" className="space-y-4 mt-4">
            <div className="flex gap-2 flex-wrap">
              {[{ k: 'mes', l: t('billing.thisMonth') }, { k: 'trim', l: t('billing.quarter') }, { k: 'ano', l: t('billing.year') }].map(f => (
                <Button key={f.k} size="sm" variant={filter === f.k ? 'default' : 'outline'} onClick={() => setFilter(f.k)} className="text-xs">
                  {f.l}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              {dentistTeleconsultas.map(tc => (
                <Card key={tc.id} className="bg-card/80 backdrop-blur border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{tc.date} — {tc.patient}</p>
                        <p className="text-xs text-muted-foreground">{tc.duration} · €{tc.amount} · {t('billing.commissionLabel')}: €{tc.commission} · {t('billing.net')}: €{tc.net}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { generateReceipt(tc.id, `${t('billing.teleconsultas')} ${tc.patient}`, tc.amount, 'Transferência'); toast.success(t('billing.receiptDownloaded')); }}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{dentistTeleconsultas.length} {t('billing.teleconsultas').toLowerCase()}</span>
                <span className="text-muted-foreground">€{totalTele} · {t('billing.commissionLabel')}: €{totalComm.toFixed(2)} · <span className="text-primary font-bold">{t('billing.net')}: €{totalNet.toFixed(2)}</span></span>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plano" className="space-y-4 mt-4">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Pro</p>
                    <p className="text-xs text-muted-foreground">€19,99/{t('billing.monthly').toLowerCase()}</p>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">{t('billing.active')}</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{t('billing.nextBillingDate')}: 1 Fev 2026</p>
                  <p>{t('billing.method')}: Visa ****4532</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => onNavigate?.('plano')}>{t('billing.changePlan')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('billing.fiscalData')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><label className="text-xs text-muted-foreground">{t('billing.businessName')}</label><Input defaultValue="Dr. Gonçalo Pipo" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">{t('billing.taxId')}</label><Input defaultValue="234 567 890" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">{t('billing.fiscalAddress')}</label><Input defaultValue="Rua dos Dentistas, 25, 1200-100 Lisboa" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">{t('billing.ibanLabel')}</label><Input defaultValue="PT50 0035 0000 0000 0000 0001 2" className="mt-1" /></div>
                <Button className="w-full" onClick={() => toast.success(t('billing.dataSaved'))}>{t('common.save')}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
