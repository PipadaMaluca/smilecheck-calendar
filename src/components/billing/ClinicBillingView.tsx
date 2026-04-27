import { useState } from 'react';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clinicDentistRevenue, dentistTeleconsultas, generateReceipt } from './billingMockData';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

import { ManagePlanView } from '@/components/plan/ManagePlanView';

interface ClinicBillingViewProps {
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

const monthlyData = [
  { month: 'Ago', 'Dr. Gonçalo Pipo': 3800, 'Dr. Alexandre Bernardo': 3200, 'Dr. Gil Santos': 4000 },
  { month: 'Set', 'Dr. Gonçalo Pipo': 4000, 'Dr. Alexandre Bernardo': 3500, 'Dr. Gil Santos': 4200 },
  { month: 'Out', 'Dr. Gonçalo Pipo': 4100, 'Dr. Alexandre Bernardo': 3700, 'Dr. Gil Santos': 4500 },
  { month: 'Nov', 'Dr. Gonçalo Pipo': 3900, 'Dr. Alexandre Bernardo': 3600, 'Dr. Gil Santos': 4300 },
  { month: 'Dez', 'Dr. Gonçalo Pipo': 4050, 'Dr. Alexandre Bernardo': 3750, 'Dr. Gil Santos': 4600 },
  { month: 'Jan', 'Dr. Gonçalo Pipo': 4200, 'Dr. Alexandre Bernardo': 3800, 'Dr. Gil Santos': 4800 },
];

export function ClinicBillingView({ initialTab, onNavigate }: ClinicBillingViewProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab || 'resumo');
  const [chartMode, setChartMode] = useState<'mensal' | 'semanal'>('mensal');
  const [expandedDentist, setExpandedDentist] = useState<string | null>(null);

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-2xl mx-auto space-y-6 pb-32">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('billing.clinicTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('billing.clinicSubtitle')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="resumo">{t('billing.summary')}</TabsTrigger>
            <TabsTrigger value="dentistas">{t('billing.perDentist')}</TabsTrigger>
            <TabsTrigger value="plano">{t('billing.plan')}</TabsTrigger>
            <TabsTrigger value="teleconsultas">{t('billing.teleconsultas')}</TabsTrigger>
            <TabsTrigger value="dados">{t('billing.fiscalData')}</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: t('billing.totalRevenue'), value: '€12.800', color: '' },
                { label: t('billing.teleconsultas'), value: '45 (€900)', color: '' },
                { label: t('billing.commission'), value: '€135', color: 'text-destructive' },
                { label: t('billing.plan'), value: 'Pro €39,99/' + t('billing.monthly').toLowerCase(), color: '' },
                { label: t('billing.net'), value: '€12.665', color: 'text-primary' },
              ].map((s, i) => (
                <Card key={i} className="bg-card/80 backdrop-blur border-border">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`text-lg font-bold mt-1 ${s.color || 'text-foreground'}`}>{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t('billing.revenuePerDentist')}</CardTitle>
                  <div className="flex gap-1">
                    {(['mensal', 'semanal'] as const).map(m => (
                      <Button key={m} size="sm" variant={chartMode === m ? 'default' : 'outline'} onClick={() => setChartMode(m)} className="text-xs h-7 px-2">
                        {m === 'mensal' ? t('billing.monthly') : t('billing.weekly')}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {clinicDentistRevenue.map(d => (
                        <Bar key={d.id} dataKey={d.name} fill={d.color} radius={[2, 2, 0, 0]} stackId="stack" />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dentistas" className="space-y-3 mt-4">
            {clinicDentistRevenue.map(d => (
              <Card key={d.id} className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-0">
                  <button className="w-full p-4 flex items-center justify-between text-left" onClick={() => setExpandedDentist(expandedDentist === d.id ? null : d.id)}>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.consultas} {t('billing.consultations')} · {d.tele} {t('billing.tele')} · €{d.revenue.toLocaleString()}</p>
                    </div>
                    {expandedDentist === d.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {expandedDentist === d.id && (
                    <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                      {dentistTeleconsultas.slice(0, 4).map(tc => (
                        <div key={tc.id} className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{tc.date} — {tc.patient} — {tc.duration}</span>
                          <span>€{tc.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="teleconsultas" className="space-y-2 mt-4">
            {dentistTeleconsultas.map(tc => (
              <Card key={tc.id} className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{tc.date} — {tc.patient}</p>
                    <p className="text-xs text-muted-foreground">{tc.duration} · €{tc.amount} · {t('billing.commissionLabel')}: €{tc.commission} · {t('billing.net')}: €{tc.net}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { generateReceipt(tc.id, `${t('billing.teleconsultas')} ${tc.patient}`, tc.amount, 'Transferência'); toast.success(t('billing.receiptDownloaded')); }}>
                    <Download className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="plano" className="space-y-4 mt-4">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Pro</p>
                    <p className="text-xs text-muted-foreground">€39,99/{t('billing.monthly').toLowerCase()}</p>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">{t('billing.active')}</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{t('billing.nextBillingDate')}: 1 Fev 2026</p>
                  <p>{t('billing.method')}: Visa ****4532</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    document.getElementById('plan-comparison')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {t('billing.changePlan')}
                </Button>
                <button className="text-xs text-destructive hover:underline w-full text-center mt-1">{t('plan.cancelSubscription')}</button>
              </CardContent>
            </Card>
            <div id="plan-comparison" className="-mx-6">
              <ManagePlanView userRole="clinic" />
            </div>
          </TabsContent>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('billing.fiscalData')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><label className="text-xs text-muted-foreground">{t('billing.clinicName')}</label><Input defaultValue="Clínica SmileCheck" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">{t('billing.taxIdCorp')}</label><Input defaultValue="509 123 456" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">{t('billing.fiscalAddress')}</label><Input defaultValue="Rua da Saúde, 100, 1000-001 Lisboa" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">IBAN</label><Input defaultValue="PT50 0035 0000 0000 0000 0009 8" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">{t('billing.financialManager')}</label><Input defaultValue="Ana Gestão" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">{t('billing.financialEmail')}</label><Input defaultValue="financeiro@smilecheck.pt" className="mt-1" /></div>
                <Button className="w-full" onClick={() => toast.success(t('billing.dataSaved'))}>{t('common.save')}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
