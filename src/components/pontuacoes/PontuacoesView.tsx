import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/calendar';
import { PontosTab } from './PontosTab';
import { ClassificacoesTab } from './ClassificacoesTab';
import { StreakTab } from './StreakTab';
import { MyLevelView } from '@/components/level/MyLevelView';
import { useTranslation } from 'react-i18next';

interface PontuacoesViewProps {
  userRole: UserRole;
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export function PontuacoesView({ userRole, initialTab = 'pontos', onNavigate }: PontuacoesViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { t } = useTranslation();

  const showClassificacoes = userRole !== 'patient';

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-32">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('scores.title')}</h1>
          <p className="text-sm text-muted-foreground">{showClassificacoes ? t('scores.subtitle') : t('scores.subtitleNoClass')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`w-full grid ${showClassificacoes ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="pontos">{t('scores.pointsTab')}</TabsTrigger>
            <TabsTrigger value="nivel">{t('level.myLevelTab')}</TabsTrigger>
            {showClassificacoes && <TabsTrigger value="classificacoes">{t('scores.classificationsTab')}</TabsTrigger>}
            <TabsTrigger value="streak">{t('scores.dailyStreakTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="pontos" className="mt-4">
            <PontosTab userRole={userRole} onNavigate={onNavigate} />
          </TabsContent>

          <TabsContent value="nivel" className="mt-4">
            <MyLevelView userRole={userRole} />
          </TabsContent>

          {showClassificacoes && (
            <TabsContent value="classificacoes" className="mt-4">
              <ClassificacoesTab userRole={userRole} />
            </TabsContent>
          )}

          <TabsContent value="streak" className="mt-4">
            <StreakTab userRole={userRole} />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
