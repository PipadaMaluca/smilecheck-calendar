import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserRole } from '@/types/calendar';
import { ConsultationTab } from './tabs/ConsultationTab';
import { AbsenceTab } from './tabs/AbsenceTab';
import { ExceptionalOpeningTab } from './tabs/ExceptionalOpeningTab';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SlotCreationScreenProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  initialDate: Date;
  initialTime: string;
  dentistKey?: string;
  dentistName?: string;
}

export function SlotCreationScreen({
  isOpen,
  onClose,
  userRole,
  initialDate,
  initialTime,
  dentistKey,
  dentistName,
}: SlotCreationScreenProps) {
  const [activeTab, setActiveTab] = useState('consulta');
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[60] bg-background flex flex-col",
      isMobile ? "pb-[60px]" : ""
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <h2 className="text-lg font-bold text-foreground">Nova Criação</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="consulta" className="flex-1 text-xs">Consulta</TabsTrigger>
            <TabsTrigger value="ausencia" className="flex-1 text-xs">Ausência</TabsTrigger>
            <TabsTrigger value="abertura" className="flex-1 text-xs">Abertura Excecional</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="consulta" className="flex-1 overflow-hidden mt-0">
          <ConsultationTab
            initialDate={initialDate}
            initialTime={initialTime}
            dentistKey={dentistKey}
            dentistName={dentistName}
            userRole={userRole}
            onClose={onClose}
          />
        </TabsContent>

        <TabsContent value="ausencia" className="flex-1 overflow-hidden mt-0">
          <AbsenceTab
            initialDate={initialDate}
            initialTime={initialTime}
            dentistKey={dentistKey}
            dentistName={dentistName}
            userRole={userRole}
            onClose={onClose}
          />
        </TabsContent>

        <TabsContent value="abertura" className="flex-1 overflow-hidden mt-0">
          <ExceptionalOpeningTab
            initialDate={initialDate}
            initialTime={initialTime}
            dentistKey={dentistKey}
            dentistName={dentistName}
            userRole={userRole}
            onClose={onClose}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
