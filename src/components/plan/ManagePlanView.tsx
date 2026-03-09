import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Star, CreditCard, Smartphone, Wallet, AlertTriangle } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from
'@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface ManagePlanViewProps {
  userRole: UserRole;
}

type PlanTier = 'free' | 'pro' | 'premium';

interface PlanFeature {
  text: string;
  included: boolean;
  isInherited?: boolean;
  isWarning?: boolean;
}

interface Plan {
  id: PlanTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeature[];
  popular?: boolean;
  badge?: string;
  icon: React.ElementType;
}

// Tooth icon component
const ToothIcon = ({ className }: {className?: string;}) =>
<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C9.5 2 7 3.5 7 6c0 2-1 4-2 6s-1 5 1 7c1.5 1.5 3 1 4-1 .5-1 1-2 2-2s1.5 1 2 2c1 2 2.5 2.5 4 1 2-2 2-5 1-7s-2-4-2-6c0-2.5-2.5-4-5-4z" />
  </svg>;


const PLANS_BY_ROLE: Record<string, Plan[]> = {
  patient: [
  {
    id: 'free', name: 'Free', monthlyPrice: 0, annualPrice: 0, icon: ToothIcon,
    features: [
    { text: 'Acesso à app', included: true },
    { text: 'Marcar consultas', included: true },
    { text: '1 teleconsulta/mês', included: true },
    { text: 'Sistema de pontos básico', included: true },
    { text: 'Notificações: App, Push, Email', included: true },
    { text: 'Tema claro/escuro', included: true },
    { text: '10 cores de consulta (fixas)', included: true },
    { text: 'Reset anual de pontos', included: false, isWarning: true },
    { text: 'Sem bónus de pontos', included: false },
    { text: 'Com anúncios', included: false }]

  },
  {
    id: 'pro', name: 'Pro', monthlyPrice: 4.99, annualPrice: 50.90, icon: Star, popular: true, badge: 'Popular',
    features: [
    { text: 'Tudo do plano Free, mais:', included: true, isInherited: true },
    { text: 'Teleconsultas ilimitadas', included: true },
    { text: 'Mantém pontos (sem reset anual)', included: true },
    { text: 'Notificações SMS incluídas', included: true },
    { text: 'Prioridade nas marcações', included: true },
    { text: 'Sem anúncios', included: true },
    { text: 'Histórico completo', included: true },
    { text: '13 cores de consulta (editáveis)', included: true },
    { text: 'Sem bónus de pontos', included: false }]

  },
  {
    id: 'premium', name: 'Premium', monthlyPrice: 9.99, annualPrice: 101.90, icon: Crown, badge: 'Melhor',
    features: [
    { text: 'Tudo do plano Pro, mais:', included: true, isInherited: true },
    { text: 'Bónus pontos (+10% no fim do ano)', included: true },
    { text: 'Teleconsultas com 10% desconto', included: true },
    { text: 'Descontos em consultas', included: true },
    { text: 'Prioridade máxima em pesquisas', included: true },
    { text: 'Prioridade máxima nas marcações', included: true },
    { text: 'Prioridade máxima nas urgências', included: true },
    { text: 'Suporte prioritário', included: true },
    { text: 'Cores 100% personalizáveis (tema + consultas)', included: true },
    { text: 'Badge Premium no perfil', included: true },
    { text: 'Recompensas exclusivas', included: true }]

  }],

  dentist: [
  {
    id: 'free', name: 'Free', monthlyPrice: 0, annualPrice: 0, icon: ToothIcon,
    features: [
    { text: '10 teleconsultas/mês', included: true },
    { text: '1 clínica', included: true },
    { text: 'Sistema de pontos básico', included: true },
    { text: 'Notificações: App, Push, Email', included: true },
    { text: '10 cores de consulta (fixas)', included: true },
    { text: 'Tema claro/escuro', included: true },
    { text: 'Exportar relatórios básicos (PDF)', included: true },
    { text: 'Prescrições limitadas', included: true },
    { text: 'Reset anual de pontos', included: false, isWarning: true },
    { text: 'Sem bónus de pontos', included: false },
    { text: 'Com anúncios', included: false }]

  },
  {
    id: 'pro', name: 'Pro', monthlyPrice: 19.99, annualPrice: 203.90, icon: Star, popular: true, badge: 'Popular',
    features: [
    { text: 'Tudo do plano Free, mais:', included: true, isInherited: true },
    { text: 'Teleconsultas ilimitadas', included: true },
    { text: 'Até 3 clínicas', included: true },
    { text: 'Mantém pontos (sem reset anual)', included: true },
    { text: 'Notificações SMS', included: true },
    { text: 'Estatísticas', included: true },
    { text: 'Prescrições ilimitadas', included: true },
    { text: '13 cores de consulta (editáveis)', included: true },
    { text: 'Exportar todos os relatórios (PDF, Excel)', included: true },
    { text: 'Sem anúncios', included: true },
    { text: 'Sem bónus de pontos', included: false }]

  },
  {
    id: 'premium', name: 'Premium', monthlyPrice: 29.99, annualPrice: 305.90, icon: Crown, badge: 'Melhor',
    features: [
    { text: 'Tudo do plano Pro, mais:', included: true, isInherited: true },
    { text: 'Clínicas ilimitadas', included: true },
    { text: 'Bónus pontos (+10% no fim do ano)', included: true },
    { text: 'Prioridade máxima em pesquisas', included: true },
    { text: 'Prioridade máxima nas marcações', included: true },
    { text: 'Prioridade máxima nas urgências', included: true },
    { text: 'Estatísticas avançadas', included: true },
    { text: 'Destaque nos resultados de pesquisa', included: true },
    { text: 'Suporte prioritário', included: true },
    { text: 'Cores 100% personalizáveis (tema + consultas)', included: true },
    { text: 'Sincronização calendário externo', included: true }]

  }],

  clinic: [
  {
    id: 'free', name: 'Free', monthlyPrice: 0, annualPrice: 0, icon: ToothIcon,
    features: [
    { text: 'Até 3 dentistas', included: true },
    { text: 'Funcionalidades básicas', included: true },
    { text: 'Sistema de pontos básico', included: true },
    { text: '10 cores de consulta (fixas)', included: true },
    { text: 'Tema claro/escuro', included: true },
    { text: 'Reset anual de pontos', included: false, isWarning: true },
    { text: 'Sem bónus de pontos', included: false },
    { text: 'Com anúncios', included: false }]

  },
  {
    id: 'pro', name: 'Pro', monthlyPrice: 39.99, annualPrice: 407.90, icon: Star, popular: true, badge: 'Popular',
    features: [
    { text: 'Tudo do plano Free, mais:', included: true, isInherited: true },
    { text: 'Até 5 dentistas', included: true },
    { text: 'Mantém pontos (sem reset anual)', included: true },
    { text: 'Estatísticas', included: true },
    { text: 'Relatórios mensais', included: true },
    { text: 'Notificações SMS', included: true },
    { text: '13 cores de consulta (editáveis)', included: true },
    { text: 'Exportar relatórios (PDF, Excel)', included: true },
    { text: 'Dashboard confirmações em tempo real', included: true },
    { text: 'Sem anúncios', included: true },
    { text: 'Sem bónus de pontos', included: false }]

  },
  {
    id: 'premium', name: 'Premium', monthlyPrice: 49.99, annualPrice: 509.90, icon: Crown, badge: 'Melhor',
    features: [
    { text: 'Tudo do plano Pro, mais:', included: true, isInherited: true },
    { text: 'Dentistas ilimitados', included: true },
    { text: 'Bónus pontos (+10% no fim do ano)', included: true },
    { text: 'Prioridade máxima em pesquisas', included: true },
    { text: 'Prioridade máxima nas marcações', included: true },
    { text: 'Prioridade máxima nas urgências', included: true },
    { text: 'Estatísticas avançadas', included: true },
    { text: 'Suporte prioritário', included: true },
    { text: 'Destaque nos resultados', included: true },
    { text: 'Cores 100% personalizáveis (tema + consultas)', included: true },
    { text: 'Sincronização calendário externo', included: true }]

  }]

};

export function ManagePlanView({ userRole }: ManagePlanViewProps) {
  const [currentPlan] = useState<PlanTier>('pro');
  const [isAnnual, setIsAnnual] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const plans = PLANS_BY_ROLE[userRole] || PLANS_BY_ROLE.patient;

  const formatPrice = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return { main: 'Grátis', sub: '' };
    if (isAnnual) {
      return {
        main: `€${plan.annualPrice.toFixed(2)}/ano`,
        sub: `≈ €${(plan.annualPrice / 12).toFixed(2)}/mês`
      };
    }
    return { main: `€${plan.monthlyPrice.toFixed(2)}`, sub: '/mês' };
  };

  const handleSubscribe = () => {
    toast.success(`Plano ${checkoutPlan?.name} ativado com sucesso!`);
    setCheckoutPlan(null);
  };

  const handleCancel = () => {
    toast.success('Subscrição cancelada. Voltará ao plano Free no final do período.');
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">O Seu Plano</h2>
          <p className="text-sm text-muted-foreground">Escolha o plano ideal para si</p>
        </div>
        <Badge className={cn(
          'text-xs font-bold px-3 py-1 self-start sm:self-auto',
          currentPlan === 'premium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
          currentPlan === 'pro' ? 'bg-primary/20 text-primary border-primary/30' :
          'bg-secondary text-secondary-foreground'
        )}>
          {currentPlan === 'premium' ? 'Premium' : currentPlan === 'pro' ? 'Pro' : 'Free'}
        </Badge>
      </div>

      {/* Billing toggle */}
      <div className="items-start justify-center flex flex-row gap-[7px]">
        <button
          onClick={() => setIsAnnual(false)}
          className={cn(
            'px-4 py-2 rounded-l-lg text-sm font-medium transition-colors border',
            !isAnnual ?
            'bg-primary text-primary-foreground border-primary' :
            'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary'
          )}>

          Mensal
        </button>
        <button
          onClick={() => setIsAnnual(true)}
          className={cn(
            'px-4 py-2 rounded-r-lg text-sm font-medium transition-colors border relative',
            isAnnual ?
            'bg-primary text-primary-foreground border-primary' :
            'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary'
          )}>

          Anual
          <span className="ml-1.5 text-xs font-bold text-emerald-400">-15%</span>
        </button>
      </div>

      {/* Current plan info */}
      {currentPlan !== 'free' &&
      <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                Plano actual: <span className="font-bold">{currentPlan === 'pro' ? 'Pro' : 'Premium'}</span>
              </p>
              <p className="text-xs text-muted-foreground">Próxima renovação: 28 Fev 2026</p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleCancel}>
              Cancelar subscrição
            </Button>
          </CardContent>
        </Card>
      }

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const Icon = plan.icon;
          const price = formatPrice(plan);
          const includedFeatures = plan.features.filter((f) => f.included);
          const warningFeatures = plan.features.filter((f) => !f.included && f.isWarning);
          const excludedFeatures = plan.features.filter((f) => !f.included && !f.isWarning);

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative transition-all duration-200 flex flex-col',
                isCurrent && 'border-primary ring-2 ring-primary/20',
                plan.badge && !isCurrent && 'border-amber-500/30'
              )}>

              {plan.badge &&
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-500 text-white border-0 text-[10px] px-3">
                    {plan.badge}
                  </Badge>
                </div>
              }
              <CardHeader className="text-center pb-2 pt-6">
                <div className={cn(
                  'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2',
                  plan.id === 'premium' ? 'bg-amber-500/20' :
                  plan.id === 'pro' ? 'bg-primary/20' :
                  'bg-secondary'
                )}>
                  <Icon className={cn(
                    'w-6 h-6',
                    plan.id === 'premium' ? 'text-amber-400' :
                    plan.id === 'pro' ? 'text-primary' :
                    'text-muted-foreground'
                  )} />
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-1">
                  <span className={cn("font-bold text-foreground text-center",

                  isAnnual && plan.monthlyPrice > 0 ? "text-xl" : "text-2xl"
                  )}>
                    {price.main}
                  </span>
                  {price.sub &&
                  <span className={cn(
                    "text-muted-foreground",
                    isAnnual && plan.monthlyPrice > 0 ? "block text-xs mt-0.5" : "text-sm ml-0.5"
                  )}>
                      {price.sub}
                    </span>
                  }
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-2 px-4">
                <div className="space-y-1.5 flex-1">
                  {/* Included features */}
                  {includedFeatures.map((feat, i) =>
                  <div key={i} className={cn("flex items-start gap-2 text-sm", feat.isInherited && "mb-1")}>
                      {feat.isInherited ?
                    <span className="text-muted-foreground text-xs italic">{feat.text}</span> :

                    <>
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{feat.text}</span>
                        </>
                    }
                    </div>
                  )}

                  {/* Warning features */}
                  {warningFeatures.length > 0 &&
                  <div className="border-t border-amber-500/30 mt-3 pt-2 pb-2 border-b border-b-amber-500/30 space-y-1.5">
                      <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                        {warningFeatures.map((feat, i) =>
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span className="text-amber-400 font-medium">{feat.text}</span>
                        </div>
                        )}
                      </div>
                    </div>
                  }

                  {/* Excluded features */}
                  {excludedFeatures.length > 0 &&
                  <div className="mt-2 space-y-1.5">
                      {excludedFeatures.map((feat, i) =>
                    <div key={i} className="flex items-start gap-2 text-sm">
                          <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground line-through">{feat.text}</span>
                        </div>
                    )}
                    </div>
                  }
                </div>
                <Button
                  className="w-full mt-4"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent}
                  onClick={() => !isCurrent && setCheckoutPlan(plan)}>

                  {isCurrent ? 'Plano Actual' : plan.monthlyPrice > (plans.find((p) => p.id === currentPlan)?.monthlyPrice || 0) ? 'Subscrever' : 'Escolher'}
                </Button>
              </CardContent>
            </Card>);

        })}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={!!checkoutPlan} onOpenChange={() => setCheckoutPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscrever {checkoutPlan?.name}</DialogTitle>
            <DialogDescription>
              {checkoutPlan && formatPrice(checkoutPlan).main}{checkoutPlan && !isAnnual ? '/mês' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Método de pagamento</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer text-sm">Cartão de crédito/débito</Label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer text-sm">PayPal</Label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="mbway" id="mbway" />
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="mbway" className="flex-1 cursor-pointer text-sm">MB WAY</Label>
                </div>
              </RadioGroup>
            </div>
            {paymentMethod === 'card' &&
            <div className="space-y-3">
                <div><Label className="text-xs">Número do cartão</Label><Input placeholder="4242 4242 4242 4242" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Validade</Label><Input placeholder="MM/AA" /></div>
                  <div><Label className="text-xs">CVC</Label><Input placeholder="123" /></div>
                </div>
              </div>
            }
            {paymentMethod === 'mbway' &&
            <div><Label className="text-xs">Número de telemóvel</Label><Input placeholder="+351 912 345 678" /></div>
            }
            <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plano {checkoutPlan?.name} ({isAnnual ? 'anual' : 'mensal'})</span>
                <span className="font-medium text-foreground">{checkoutPlan && formatPrice(checkoutPlan).main}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border pt-1">
                <span>Total</span>
                <span>{checkoutPlan && formatPrice(checkoutPlan).main}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCheckoutPlan(null)}>Cancelar</Button>
            <Button onClick={handleSubscribe}>Subscrever</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}