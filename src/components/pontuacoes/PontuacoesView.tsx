import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/calendar';
import { PontosTab } from './PontosTab';
import { ClassificacoesTab } from './ClassificacoesTab';
import { StreakTab } from './StreakTab';

interface PontuacoesViewProps {
  userRole: UserRole;
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export function PontuacoesView({ userRole, initialTab = 'pontos', onNavigate }: PontuacoesViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-32">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pontuações</h1>
          <p className="text-sm text-muted-foreground">XP, pontos de recompensa e classificações</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pontos">Pontos</TabsTrigger>
            <TabsTrigger value="classificacoes">Classificações</TabsTrigger>
            <TabsTrigger value="streak">Streak Diário</TabsTrigger>
          </TabsList>

          <TabsContent value="pontos" className="mt-4">
            <PontosTab userRole={userRole} onNavigate={onNavigate} />
          </TabsContent>

          <TabsContent value="classificacoes" className="mt-4">
            <ClassificacoesTab userRole={userRole} />
          </TabsContent>

          <TabsContent value="streak" className="mt-4">
            <StreakTab userRole={userRole} />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
