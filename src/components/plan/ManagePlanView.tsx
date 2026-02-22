import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Star, Zap, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface ManagePlanViewProps {
  userRole: UserRole;
}

type PlanTier = 'free' | 'pro' | 'premium';

// PlanFeature interface moved into PLANS_BY_ROLE block

interface Plan {
  id: PlanTier;
  name: string;
  price: string;
  priceValue: number;
  period: string;
  features: PlanFeature[];
  popular?: boolean;
  icon: React.ElementType;
}

interface PlanFeature {
  text: string;
  included: boolean;
  isInherited?: boolean;
}

const PLANS_BY_ROLE: Record<string, Plan[]> = {
  patient: [
    {
      id: 'free', name: 'Free', price: 'Grátis', priceValue: 0, period: '',
      icon: Zap,
      features: [
        { text: 'Marcar consultas', included: true },
        { text: '1 teleconsulta/mês', included: true },
        { text: 'Notificações: App, Push, Email', included: true },
        { text: 'Tema claro/escuro', included: true },
        { text: 'Cores default', included: true },
      ],
    },
    {
      id: 'pro', name: 'Pro', price: '€4.99', priceValue: 4.99, period: '/mês',
      icon: Star, popular: true,
      features: [
        { text: 'Tudo do plano Free, mais:', included: true, isInherited: true },
        { text: 'Teleconsultas ilimitadas', included: true },
        { text: 'Notificações SMS incluídas', included: true },
        { text: 'Prioridade nas marcações', included: true },
        { text: 'Sem anúncios', included: true },
      ],
    },
    {
      id: 'premium', name: 'Premium', price: '€9.99', priceValue: 9.99, period: '/mês',
      icon: Crown,
      features: [
        { text: 'Tudo do plano Pro, mais:', included: true, isInherited: true },
        { text: 'Descontos em consultas', included: true },
        { text: 'Urgências prioritárias', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'Bónus pontos (+20%)', included: true },
        { text: 'Personalização completa do tema', included: true },
      ],
    },
  ],
  dentist: [
    {
      id: 'free', name: 'Free', price: 'Grátis', priceValue: 0, period: '',
      icon: Zap,
      features: [
        { text: 'Perfil básico', included: true },
        { text: '10 teleconsultas/mês', included: true },
        { text: '1 clínica', included: true },
        { text: 'Notificações: App, Push, Email', included: true },
        { text: 'Cores default', included: true },
        { text: 'Exportar relatórios básicos (PDF)', included: true },
      ],
    },
    {
      id: 'pro', name: 'Pro', price: '€19.99', priceValue: 19.99, period: '/mês',
      icon: Star, popular: true,
      features: [
        { text: 'Tudo do plano Free, mais:', included: true, isInherited: true },
        { text: 'Teleconsultas ilimitadas', included: true },
        { text: 'Até 3 clínicas', included: true },
        { text: 'Notificações SMS', included: true },
        { text: 'Estatísticas avançadas', included: true },
        { text: 'Prescrições ilimitadas', included: true },
        { text: 'Personalização cores da agenda', included: true },
        { text: 'Exportar todos os relatórios (PDF, Excel)', included: true },
      ],
    },
    {
      id: 'premium', name: 'Premium', price: '€29.99', priceValue: 29.99, period: '/mês',
      icon: Crown,
      features: [
        { text: 'Tudo do plano Pro, mais:', included: true, isInherited: true },
        { text: 'Clínicas ilimitadas', included: true },
        { text: 'Destaque nos resultados de pesquisa', included: true },
        { text: 'Bónus pontos (+30%)', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'Personalização completa do tema', included: true },
        { text: 'Sincronização calendário externo', included: true },
      ],
    },
  ],
  clinic: [
    {
      id: 'free', name: 'Free', price: 'Grátis', priceValue: 0, period: '',
      icon: Zap,
      features: [
        { text: 'Até 3 dentistas', included: true },
        { text: 'Funcionalidades básicas', included: true },
        { text: 'Cores default', included: true },
      ],
    },
    {
      id: 'pro', name: 'Pro', price: '€39.99', priceValue: 39.99, period: '/mês',
      icon: Star, popular: true,
      features: [
        { text: 'Tudo do plano Free, mais:', included: true, isInherited: true },
        { text: 'Até 10 dentistas', included: true },
        { text: 'Estatísticas da equipa', included: true },
        { text: 'Relatórios mensais', included: true },
        { text: 'Notificações SMS', included: true },
        { text: 'Personalização cores da agenda', included: true },
        { text: 'Exportar relatórios (PDF, Excel)', included: true },
        { text: 'Dashboard confirmações em tempo real', included: true },
      ],
    },
    {
      id: 'premium', name: 'Premium', price: '€49.99', priceValue: 49.99, period: '/mês',
      icon: Crown,
      features: [
        { text: 'Tudo do plano Pro, mais:', included: true, isInherited: true },
        { text: 'Dentistas ilimitados', included: true },
        { text: 'Estatísticas avançadas', included: true },
        { text: 'API de integração', included: true },
        { text: 'Suporte dedicado', included: true },
        { text: 'Destaque nos resultados', included: true },
        { text: 'Personalização completa do tema', included: true },
        { text: 'Sincronização calendário externo', included: true },
      ],
    },
  ],
};

export function ManagePlanView({ userRole }: ManagePlanViewProps) {
  const [currentPlan] = useState<PlanTier>('pro');
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const plans = PLANS_BY_ROLE[userRole] || PLANS_BY_ROLE.patient;

  const handleSubscribe = () => {
    toast.success(`Plano ${checkoutPlan?.name} ativado com sucesso!`);
    setCheckoutPlan(null);
  };

  const handleCancel = () => {
    toast.success('Subscrição cancelada. Voltará ao plano Free no final do período.');
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-28 text-center md:text-left">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">O Seu Plano</h2>
          <p className="text-sm text-muted-foreground">Escolha o plano ideal para si</p>
        </div>
        <Badge className={cn(
          'ml-auto text-xs font-bold px-3 py-1',
          currentPlan === 'premium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
          currentPlan === 'pro' ? 'bg-primary/20 text-primary border-primary/30' :
          'bg-secondary text-secondary-foreground'
        )}>
          {currentPlan === 'premium' ? 'Premium' : currentPlan === 'pro' ? 'Pro' : 'Free'}
        </Badge>
      </div>

      {/* Current plan info */}
      {currentPlan !== 'free' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
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
      )}

      {/* Plan comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const Icon = plan.icon;

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative transition-all duration-200 flex flex-col',
                isCurrent && 'border-primary ring-2 ring-primary/20',
                plan.popular && !isCurrent && 'border-amber-500/30'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-500 text-white border-0 text-[10px] px-3">
                    Popular
                  </Badge>
                </div>
              )}
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
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pt-2">
                <div className="space-y-2 flex-1">
                  {plan.features.map((feat, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-2 text-sm",
                      feat.isInherited && "mb-1"
                    )}>
                      {feat.isInherited ? (
                        <span className="text-muted-foreground text-xs italic">
                          {feat.text}
                        </span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-foreground">{feat.text}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full mt-4"
                  variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'secondary'}
                  disabled={isCurrent}
                  onClick={() => !isCurrent && setCheckoutPlan(plan)}
                >
                  {isCurrent ? 'Plano Actual' : 'Escolher'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={!!checkoutPlan} onOpenChange={() => setCheckoutPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscrever {checkoutPlan?.name}</DialogTitle>
            <DialogDescription>
              {checkoutPlan?.price}{checkoutPlan?.period}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Payment method */}
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

            {/* Card fields */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Número do cartão</Label>
                  <Input placeholder="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Validade</Label>
                    <Input placeholder="MM/AA" />
                  </div>
                  <div>
                    <Label className="text-xs">CVC</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'mbway' && (
              <div>
                <Label className="text-xs">Número de telemóvel</Label>
                <Input placeholder="+351 912 345 678" />
              </div>
            )}

            {/* Summary */}
            <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plano {checkoutPlan?.name}</span>
                <span className="font-medium text-foreground">{checkoutPlan?.price}{checkoutPlan?.period}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border pt-1">
                <span>Total</span>
                <span>{checkoutPlan?.price}{checkoutPlan?.period}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCheckoutPlan(null)}>Cancelar</Button>
            <Button onClick={handleSubscribe}>Subscrever</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
