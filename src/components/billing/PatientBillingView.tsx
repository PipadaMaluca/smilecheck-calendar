import { formatCurrency } from '@/lib/formatters';
import { useState } from 'react';
import { CreditCard, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { patientPayments, generateReceipt } from './billingMockData';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { ManagePlanView } from '@/components/plan/ManagePlanView';

interface PatientBillingViewProps {
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export function PatientBillingView({ initialTab, onNavigate }: PatientBillingViewProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab || 'resumo');
  const [filter, setFilter] = useState('todos');

  const filtered = filter === 'todos' ? patientPayments
    : patientPayments.filter(p => p.type === filter.replace('teleconsultas', 'teleconsulta').replace('planos', 'plano'));

  const totalMonth = 24.99;
  const teleCount = 1;
  const teleTotal = 20;

  return (
    <ScrollArea className="flex-1">
      <div className={`p-6 ${activeTab === 'plano' ? 'max-w-6xl' : 'max-w-2xl'} mx-auto space-y-6 pb-32`}>
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('billing.patientTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('billing.patientSubtitle')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="plano">{t('billing.myPlan')}</TabsTrigger>
            <TabsTrigger value="resumo">{t('billing.summary')}</TabsTrigger>
            <TabsTrigger value="historico">{t('billing.history')}</TabsTrigger>
            <TabsTrigger value="metodos">{t('billing.paymentMethods')}</TabsTrigger>
            <TabsTrigger value="dados">{t('billing.fiscalData')}</TabsTrigger>
          </TabsList>

          <TabsContent value="plano" className="space-y-4 mt-4">
            <div id="plan-comparison" className="-mx-6">
              <ManagePlanView
                userRole="patient"
                currentPlanName="Pro"
                currentPriceLabel={`${formatCurrency(4.99)}${t('units.perMonth')}`}
                nextBilling="1 Fev 2026"
              />
            </div>
          </TabsContent>

          <TabsContent value="resumo" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('billing.totalSpent')}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalMonth)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('billing.teleconsultPaid')}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{teleCount}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(teleTotal)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('billing.currentPlan')}</p>
                  <p className="text-lg font-bold text-foreground mt-1">Pro</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(4.99)}{t('units.perMonth')}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4 mt-4">
            <div className="flex gap-2 flex-wrap">
              {[{ k: 'todos', l: t('common.all') }, { k: 'teleconsultas', l: t('billing.teleconsultas') }, { k: 'planos', l: t('billing.plan') }].map(f => (
                <Button key={f.k} size="sm" variant={filter === f.k ? 'default' : 'outline'} onClick={() => setFilter(f.k)} className="text-xs">
                  {f.l}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              {filtered.map(p => (
                <Card key={p.id} className="bg-card/80 backdrop-blur border-border">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{p.description}</p>
                      <p className="text-xs text-muted-foreground">{p.date} · {p.method}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-sm font-bold text-foreground">{formatCurrency(p.amount)}</span>
                      <Button aria-label={t('a11y.download')} size="icon-sm" variant="ghost" onClick={() => { generateReceipt(p.id, p.description, p.amount, p.method); toast.success(t('billing.receiptDownloaded')); }}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={() => toast.success(t('billing.historyExported'))}>
              <Download className="w-4 h-4" /> {t('billing.exportHistory')}
            </Button>
          </TabsContent>

          <TabsContent value="metodos" className="space-y-4 mt-4">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="p-4 flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">{t('payments.methodsManagedSecurely')}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle size="compact">{t('billing.billingData')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <label className="block"><span className="text-xs text-muted-foreground">{t('billing.fullName')}</span><Input defaultValue="João Silva" className="mt-1" /></label>
                <label className="block"><span className="text-xs text-muted-foreground">{t('billing.taxIdOptional')}</span><Input defaultValue="123 456 789" className="mt-1" /></label>
                <label className="block"><span className="text-xs text-muted-foreground">{t('billing.billingAddress')}</span><Input defaultValue="Rua da Saúde, 50, 1000-001 Lisboa" className="mt-1" /></label>
                <Button className="w-full" onClick={() => toast.success(t('billing.dataSaved'))}>{t('common.save')}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
