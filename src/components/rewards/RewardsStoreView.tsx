import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Tag, ShoppingBag, Sparkles, Star, BookOpen, Eye, Award, Clock } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface RewardsStoreViewProps {
  userRole: UserRole;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: React.ElementType;
  category: string;
}

interface HistoryItem {
  id: string;
  name: string;
  points: number;
  date: string;
}

const REWARDS_BY_ROLE: Record<string, { categories: string[]; items: Reward[] }> = {
  patient: {
    categories: ['Descontos', 'Produtos', 'Experiências'],
    items: [
      { id: 'p1', name: '€5 de desconto', description: 'Desconto em qualquer consulta', points: 50, icon: Tag, category: 'Descontos' },
      { id: 'p2', name: '€10 de desconto', description: 'Desconto em qualquer consulta', points: 100, icon: Tag, category: 'Descontos' },
      { id: 'p3', name: '€20 de desconto', description: 'Desconto em qualquer consulta', points: 200, icon: Tag, category: 'Descontos' },
      { id: 'p4', name: 'Teleconsulta grátis', description: 'Uma teleconsulta sem custo', points: 150, icon: Tag, category: 'Descontos' },
      { id: 'p5', name: 'Kit escova + pasta', description: 'Kit completo de higiene oral', points: 80, icon: ShoppingBag, category: 'Produtos' },
      { id: 'p6', name: 'Escova eléctrica', description: 'Escova eléctrica de qualidade', points: 500, icon: ShoppingBag, category: 'Produtos' },
      { id: 'p7', name: 'Kit branqueamento', description: 'Kit profissional de branqueamento', points: 800, icon: Sparkles, category: 'Produtos' },
      { id: 'p8', name: 'Limpeza dentária grátis', description: 'Sessão completa de limpeza', points: 300, icon: Star, category: 'Experiências' },
      { id: 'p9', name: 'Check-up completo grátis', description: 'Exame oral completo com raio-X', points: 600, icon: Star, category: 'Experiências' },
    ],
  },
  dentist: {
    categories: ['Subscrição', 'Destaque', 'Formação'],
    items: [
      { id: 'd1', name: '1 mês Pro grátis', description: 'Acesso Pro durante 1 mês', points: 1000, icon: Award, category: 'Subscrição' },
      { id: 'd2', name: '1 mês Premium grátis', description: 'Acesso Premium durante 1 mês', points: 2000, icon: Award, category: 'Subscrição' },
      { id: 'd3', name: 'Destaque 1 semana', description: 'Perfil destacado durante 7 dias', points: 300, icon: Eye, category: 'Destaque' },
      { id: 'd4', name: 'Destaque 1 mês', description: 'Perfil destacado durante 30 dias', points: 1000, icon: Eye, category: 'Destaque' },
      { id: 'd5', name: 'Webinar exclusivo', description: 'Acesso a webinar de formação', points: 500, icon: BookOpen, category: 'Formação' },
      { id: 'd6', name: 'Curso online certificado', description: 'Curso completo com certificação', points: 2000, icon: BookOpen, category: 'Formação' },
    ],
  },
  clinic: {
    categories: ['Subscrição', 'Destaque', 'Formação'],
    items: [
      { id: 'c1', name: '1 mês Pro grátis', description: 'Acesso Pro durante 1 mês', points: 1500, icon: Award, category: 'Subscrição' },
      { id: 'c2', name: '1 mês Premium grátis', description: 'Acesso Premium durante 1 mês', points: 3000, icon: Award, category: 'Subscrição' },
      { id: 'c3', name: 'Destaque 1 semana', description: 'Clínica destacada durante 7 dias', points: 500, icon: Eye, category: 'Destaque' },
      { id: 'c4', name: 'Destaque 1 mês', description: 'Clínica destacada durante 30 dias', points: 1500, icon: Eye, category: 'Destaque' },
      { id: 'c5', name: 'Webinar gestão clínica', description: 'Formação em gestão de clínica', points: 800, icon: BookOpen, category: 'Formação' },
      { id: 'c6', name: 'Curso gestão avançada', description: 'Curso completo com certificação', points: 2500, icon: BookOpen, category: 'Formação' },
    ],
  },
};

const MOCK_HISTORY: HistoryItem[] = [
  { id: 'h1', name: '€5 de desconto', points: 50, date: '15 Jan 2026' },
  { id: 'h2', name: 'Kit escova + pasta', points: 80, date: '02 Jan 2026' },
  { id: 'h3', name: 'Teleconsulta grátis', points: 150, date: '20 Dez 2025' },
];

export function RewardsStoreView({ userRole }: RewardsStoreViewProps) {
  const [userPoints] = useState(450);
  const [redeemReward, setRedeemReward] = useState<Reward | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const data = REWARDS_BY_ROLE[userRole] || REWARDS_BY_ROLE.patient;
  const filteredItems = activeCategory === 'all' ? data.items : data.items.filter(r => r.category === activeCategory);

  const handleRedeem = () => {
    toast.success(`Recompensa "${redeemReward?.name}" resgatada com sucesso!`);
    setRedeemReward(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Loja de Recompensas</h2>
          <p className="text-sm text-muted-foreground">100 pontos = €10</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2">
          <Gift className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-amber-400">{userPoints}</span>
          <span className="text-xs text-amber-400/70">pontos</span>
        </div>
      </div>

      <Tabs defaultValue="loja" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="loja">Loja</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="loja" className="space-y-4 mt-4">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className="text-xs"
            >
              Todas
            </Button>
            {data.categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="text-xs"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Rewards grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map(reward => {
              const canAfford = userPoints >= reward.points;
              const Icon = reward.icon;
              const missing = reward.points - userPoints;

              return (
                <Card
                  key={reward.id}
                  className={cn(
                    'transition-all duration-200',
                    !canAfford && 'opacity-60'
                  )}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      canAfford ? 'bg-primary/20' : 'bg-secondary'
                    )}>
                      <Icon className={cn(
                        'w-6 h-6',
                        canAfford ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground leading-tight">{reward.name}</h4>
                    <p className="text-xs text-muted-foreground leading-tight">{reward.description}</p>
                    <Badge variant="secondary" className="text-xs font-bold">
                      {reward.points} pts
                    </Badge>
                    <Button
                      size="sm"
                      className="w-full text-xs mt-1"
                      disabled={!canAfford}
                      onClick={() => setRedeemReward(reward)}
                    >
                      {canAfford ? 'Resgatar' : `Faltam ${missing} pts`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <div className="space-y-2">
            {MOCK_HISTORY.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma recompensa resgatada ainda.</p>
            ) : (
              MOCK_HISTORY.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-destructive">-{item.points} pts</span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Redeem confirmation dialog */}
      <Dialog open={!!redeemReward} onOpenChange={() => setRedeemReward(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar resgate</DialogTitle>
            <DialogDescription>
              Tem a certeza que quer resgatar "{redeemReward?.name}" por {redeemReward?.points} pontos?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">Saldo após resgate</p>
            <p className="text-lg font-bold text-foreground">{userPoints - (redeemReward?.points || 0)} pontos</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRedeemReward(null)}>Cancelar</Button>
            <Button onClick={handleRedeem}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
