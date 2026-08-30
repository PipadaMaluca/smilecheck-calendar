import { useState } from 'react';
import { CreditCard, Download, Star, Trash2, Plus, Smartphone, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { patientPayments, savedCards, generateReceipt } from './billingMockData';
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
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [newCardName, setNewCardName] = useState('');

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
                currentPriceLabel={`€4,99/${t('billing.monthly').toLowerCase()}`}
                nextBilling="1 Fev 2026"
                paymentMethodLabel="Visa ****4532"
              />
            </div>
          </TabsContent>

          <TabsContent value="resumo" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('billing.totalSpent')}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">€{totalMonth.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('billing.teleconsultPaid')}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{teleCount}</p>
                  <p className="text-xs text-muted-foreground">€{teleTotal}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('billing.currentPlan')}</p>
                  <p className="text-lg font-bold text-foreground mt-1">Pro</p>
                  <p className="text-xs text-muted-foreground">€4,99/{t('billing.monthly').toLowerCase()}</p>
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
                      <span className="text-sm font-bold text-foreground">€{p.amount.toFixed(2)}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { generateReceipt(p.id, p.description, p.amount, p.method); toast.success(t('billing.receiptDownloaded')); }}>
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
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('billing.savedCards')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {savedCards.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{c.type} ****{c.last4}</span>
                      {c.isDefault && <Badge variant="secondary" className="text-[11px]"><Star className="w-3 h-3 mr-1" /> {t('billing.default')}</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7"><Edit2 className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
                {showNewCard ? (
                  <div className="space-y-3 border border-border rounded-xl p-4 bg-secondary/30 animate-in slide-in-from-top-2">
                    <div className="relative">
                      <Input
                        placeholder={t('billing.cardNumber')}
                        value={newCardNumber}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setNewCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
                        }}
                        maxLength={19}
                        className="pr-12"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {newCardNumber.replace(/\s/g, '').startsWith('4') ? (
                          <span className="text-xs font-bold text-blue-400">VISA</span>
                        ) : newCardNumber.replace(/\s/g, '').startsWith('5') ? (
                          <span className="text-xs font-bold text-orange-400">MC</span>
                        ) : newCardNumber.replace(/\s/g, '').startsWith('3') ? (
                          <span className="text-xs font-bold text-blue-300">AMEX</span>
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Input placeholder="MM/AA" value={newCardExpiry} onChange={e => {
                        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                        setNewCardExpiry(val);
                      }} maxLength={5} className="flex-1" />
                      <Input placeholder="CVV" value={newCardCvv} onChange={e => setNewCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} maxLength={3} className="w-24" type="password" />
                    </div>
                    <Input placeholder={t('billing.nameOnCard')} value={newCardName} onChange={e => setNewCardName(e.target.value)} />
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        disabled={newCardNumber.replace(/\s/g, '').length < 16 || newCardExpiry.length < 5 || newCardCvv.length < 3 || !newCardName.trim()}
                        onClick={() => { toast.success(t('billing.cardAdded')); setShowNewCard(false); setNewCardNumber(''); setNewCardExpiry(''); setNewCardCvv(''); setNewCardName(''); }}
                      >
                        {t('common.continue')}
                      </Button>
                      <button className="text-xs text-muted-foreground hover:text-foreground px-3" onClick={() => setShowNewCard(false)}>{t('common.cancel')}</button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full gap-2" onClick={() => setShowNewCard(true)}><Plus className="w-4 h-4" /> {t('billing.addCardBtn')}</Button>
                )}
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">MB WAY</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">+351 912 000 001</span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7"><Edit2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('billing.billingData')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><label className="text-xs text-muted-foreground">{t('billing.fullName')}</label><Input defaultValue="João Silva" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">{t('billing.taxIdOptional')}</label><Input defaultValue="123 456 789" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">{t('billing.billingAddress')}</label><Input defaultValue="Rua da Saúde, 50, 1000-001 Lisboa" className="mt-1" /></div>
                <Button className="w-full" onClick={() => toast.success(t('billing.dataSaved'))}>{t('common.save')}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
