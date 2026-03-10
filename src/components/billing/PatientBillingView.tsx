import { useState } from 'react';
import { CreditCard, Download, Star, Trash2, Plus, Smartphone, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { patientPayments, savedCards, generateReceipt } from './billingMockData';
import { toast } from 'sonner';

interface PatientBillingViewProps {
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export function PatientBillingView({ initialTab, onNavigate }: PatientBillingViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab || 'resumo');
  const [filter, setFilter] = useState('todos');

  const filtered = filter === 'todos' ? patientPayments
    : patientPayments.filter(p => p.type === filter.replace('teleconsultas', 'teleconsulta').replace('planos', 'plano'));

  const totalMonth = 24.99;
  const teleCount = 1;
  const teleTotal = 20;

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-2xl mx-auto space-y-6 pb-32">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pagamentos e Faturação</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir pagamentos, recibos e dados fiscais</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="metodos">Métodos</TabsTrigger>
            <TabsTrigger value="dados">Dados Fiscais</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Total gasto este mês</p>
                  <p className="text-2xl font-bold text-foreground mt-1">€{totalMonth.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Teleconsultas pagas</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{teleCount}</p>
                  <p className="text-xs text-muted-foreground">€{teleTotal}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Plano atual</p>
                  <p className="text-lg font-bold text-foreground mt-1">Pro</p>
                  <p className="text-xs text-muted-foreground">€4,99/mês</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4 mt-4">
            <div className="flex gap-2 flex-wrap">
              {['todos', 'teleconsultas', 'planos'].map(f => (
                <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-xs">
                  {f}
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
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { generateReceipt(p.id, p.description, p.amount, p.method); toast.success('Recibo descarregado'); }}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={() => toast.success('Histórico exportado')}>
              <Download className="w-4 h-4" /> Exportar histórico
            </Button>
          </TabsContent>

          <TabsContent value="metodos" className="space-y-4 mt-4">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Cartões guardados</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {savedCards.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{c.type} ****{c.last4}</span>
                      {c.isDefault && <Badge variant="secondary" className="text-[10px]"><Star className="w-3 h-3 mr-1" /> Predefinido</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7"><Edit2 className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full gap-2"><Plus className="w-4 h-4" /> Adicionar cartão</Button>
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
              <CardHeader className="pb-2"><CardTitle className="text-sm">Dados de Faturação</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><label className="text-xs text-muted-foreground">Nome completo</label><Input defaultValue="João Silva" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">NIF (opcional)</label><Input defaultValue="123 456 789" className="mt-1" /></div>
                <div><label className="text-xs text-muted-foreground">Morada de faturação</label><Input defaultValue="Rua da Saúde, 50, 1000-001 Lisboa" className="mt-1" /></div>
                <Button className="w-full" onClick={() => toast.success('Dados guardados')}>Guardar</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
