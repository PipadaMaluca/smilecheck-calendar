import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/types/calendar';

// Clinic tabs
import { ClinicTeamTab } from './clinic/ClinicTeamTab';
import { ClinicScheduleTab } from './clinic/ClinicScheduleTab';
import { AvailabilityTab } from './clinic/AvailabilityTab';
import { CoverageTab } from './clinic/CoverageTab';

// Dentist tabs
import { DentistAvailabilityTab } from './dentist/DentistAvailabilityTab';
import { DentistTeamTab } from './dentist/DentistTeamTab';

interface TeamViewProps {
  userRole: UserRole;
  onNavigate?: (tab: string) => void;
}

function PatientTeamView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
      <AlertCircle className="w-10 h-10 text-muted-foreground/50" />
      <p className="text-lg font-medium">Página não disponível</p>
      <p className="text-sm text-muted-foreground/70">Esta secção não está disponível para pacientes.</p>
    </div>
  );
}

function ClinicTeamView() {
  const [activeTab, setActiveTab] = useState('equipa');
  const [preselectedDentistId, setPreselectedDentistId] = useState<string | undefined>();

  const handleSwitchToAvailability = (dentistId: string) => {
    setPreselectedDentistId(dentistId);
    setActiveTab('disponibilidade');
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Gestão de Equipa</h1>
        <p className="text-sm text-muted-foreground">Equipa, horários, disponibilidade e permissões</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full overflow-x-auto justify-start flex-nowrap">
          <TabsTrigger value="equipa" className="text-xs whitespace-nowrap flex-shrink-0">Equipa</TabsTrigger>
          <TabsTrigger value="horarios" className="text-xs whitespace-nowrap flex-shrink-0">Horários da Clínica</TabsTrigger>
          <TabsTrigger value="disponibilidade" className="text-xs whitespace-nowrap flex-shrink-0">Disponibilidade</TabsTrigger>
          <TabsTrigger value="cobertura" className="text-xs whitespace-nowrap flex-shrink-0">Cobertura</TabsTrigger>
        </TabsList>

        <TabsContent value="equipa" className="mt-4">
          <ClinicTeamTab onSwitchToAvailability={handleSwitchToAvailability} />
        </TabsContent>
        <TabsContent value="horarios" className="mt-4">
          <ClinicScheduleTab />
        </TabsContent>
        <TabsContent value="disponibilidade" className="mt-4">
          <AvailabilityTab preselectedDentistId={preselectedDentistId} />
        </TabsContent>
        <TabsContent value="cobertura" className="mt-4">
          <CoverageTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DentistTeamView() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">A Minha Disponibilidade</h1>
        <p className="text-sm text-muted-foreground">Configure os seus horários de trabalho</p>
      </div>

      <Tabs defaultValue="disponibilidade" className="w-full">
        <TabsList className="w-full overflow-x-auto justify-start flex-nowrap">
          <TabsTrigger value="disponibilidade" className="text-xs whitespace-nowrap flex-shrink-0">Disponibilidade</TabsTrigger>
          <TabsTrigger value="equipa" className="text-xs whitespace-nowrap flex-shrink-0">Equipa</TabsTrigger>
        </TabsList>

        <TabsContent value="disponibilidade" className="mt-4">
          <DentistAvailabilityTab />
        </TabsContent>
        <TabsContent value="equipa" className="mt-4">
          <DentistTeamTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function TeamView({ userRole, onNavigate }: TeamViewProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-28">
        {userRole === 'patient' && <PatientTeamView />}
        {userRole === 'dentist' && <DentistTeamView />}
        {userRole === 'clinic' && <ClinicTeamView />}
      </div>
    </div>
  );
}
