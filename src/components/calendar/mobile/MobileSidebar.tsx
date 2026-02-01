import { X, User, CreditCard, List, Calendar, CalendarDays, Building2, Users, UserPlus, Bell, Clock, Globe, Gift, Settings, HelpCircle, Phone, FileText, LogOut, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole, ViewMode } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { mockDentists, mockClinics, mockFamilyMembers } from '@/data/mockData';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  // For family filter (patient)
  selectedMembers?: string[];
  onMemberToggle?: (memberId: string, isCheckbox: boolean) => void;
  // For dentist/clinic filters
  selectedDentists?: string[];
  onDentistToggle?: (dentistId: string, isCheckbox: boolean) => void;
  selectedClinics?: string[];
  onClinicToggle?: (clinicId: string, isCheckbox: boolean) => void;
}

export function MobileSidebar({
  isOpen,
  onClose,
  userRole,
  viewMode,
  onViewModeChange,
  selectedMembers = ['all'],
  onMemberToggle,
  selectedDentists = ['all'],
  onDentistToggle,
  selectedClinics = ['1'],
  onClinicToggle,
}: MobileSidebarProps) {
  const [agendasOpen, setAgendasOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [clinicsOpen, setClinicsOpen] = useState(false);
  const [dentistsOpen, setDentistsOpen] = useState(false);

  const userName = userRole === 'patient' 
    ? `${mockFamilyMembers[0].name} (${mockFamilyMembers[0].age} anos)` 
    : mockDentists[0].name;
  
  const userSubtitle = userRole === 'patient' 
    ? 'Conta Familiar' 
    : mockClinics[0].name;

  const handleViewChange = (mode: ViewMode) => {
    onViewModeChange(mode);
    onClose();
  };

  const MenuSection = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('py-2 border-b border-border', className)}>
      {children}
    </div>
  );

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    onClick,
    active = false
  }: { 
    icon: React.ElementType; 
    label: string; 
    onClick?: () => void;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors',
        active && 'text-primary bg-primary/10'
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] p-0 bg-card">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* User Profile */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground">{userSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Plan */}
        <MenuSection>
          <MenuItem icon={CreditCard} label="Gerir Plano" />
        </MenuSection>

        {/* Views */}
        <MenuSection>
          <MenuItem 
            icon={List} 
            label="Vista em Lista" 
            active={viewMode === 'list'}
            onClick={() => handleViewChange('list')}
          />
          <MenuItem 
            icon={Calendar} 
            label="Vista Diária" 
            active={viewMode === 'day'}
            onClick={() => handleViewChange('day')}
          />
          {userRole !== 'patient' && (
            <MenuItem 
              icon={CalendarDays} 
              label="Vista 3 Dias" 
              active={viewMode === 'three-day'}
              onClick={() => handleViewChange('three-day')}
            />
          )}
        </MenuSection>

        {/* Patient: Family filter */}
        {userRole === 'patient' && (
          <MenuSection>
            <Collapsible open={familyOpen} onOpenChange={setFamilyOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>Família</span>
                </div>
                {familyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 py-2 space-y-2">
                {/* All option */}
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={selectedMembers.includes('all')}
                    onCheckedChange={() => onMemberToggle?.('all', true)}
                  />
                  <button 
                    className="text-sm hover:text-primary"
                    onClick={() => onMemberToggle?.('all', false)}
                  >
                    Todos
                  </button>
                </div>
                {mockFamilyMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedMembers.includes(member.id) || selectedMembers.includes('all')}
                      onCheckedChange={() => onMemberToggle?.(member.id, true)}
                    />
                    <button 
                      className="text-sm hover:text-primary text-left"
                      onClick={() => onMemberToggle?.(member.id, false)}
                    >
                      {member.name} ({member.age} anos)
                    </button>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </MenuSection>
        )}

        {/* Dentist/Clinic: Agendas */}
        {userRole !== 'patient' && (
          <MenuSection>
            <Collapsible open={agendasOpen} onOpenChange={setAgendasOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" />
                  <span>Agendas</span>
                </div>
                {agendasOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 py-2 space-y-3">
                {/* Clinics submenu */}
                <Collapsible open={clinicsOpen} onOpenChange={setClinicsOpen}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between py-1 text-sm text-muted-foreground hover:text-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Clínicas</span>
                    </div>
                    {clinicsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 py-1 space-y-1.5">
                    {mockClinics.map(clinic => (
                      <div key={clinic.id} className="flex items-center gap-2">
                        <Checkbox 
                          checked={selectedClinics.includes(clinic.id)}
                          onCheckedChange={() => onClinicToggle?.(clinic.id, true)}
                        />
                        <button 
                          className="text-xs hover:text-primary"
                          onClick={() => onClinicToggle?.(clinic.id, false)}
                        >
                          {clinic.name}
                        </button>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Dentists submenu */}
                <Collapsible open={dentistsOpen} onOpenChange={setDentistsOpen}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between py-1 text-sm text-muted-foreground hover:text-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      <span>Dentistas</span>
                    </div>
                    {dentistsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 py-1 space-y-1.5">
                    {mockDentists.map(dentist => (
                      <div key={dentist.id} className="flex items-center gap-2">
                        <Checkbox 
                          checked={selectedDentists.includes(dentist.id) || selectedDentists.includes('all')}
                          onCheckedChange={() => onDentistToggle?.(dentist.id, true)}
                        />
                        <button 
                          className="text-xs hover:text-primary"
                          onClick={() => onDentistToggle?.(dentist.id, false)}
                        >
                          {dentist.name}
                        </button>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </CollapsibleContent>
            </Collapsible>
          </MenuSection>
        )}

        {/* Clinic-only: Gerir Equipa */}
        {userRole === 'clinic' && (
          <MenuSection>
            <MenuItem icon={Users} label="Gerir Equipa" />
          </MenuSection>
        )}

        {/* Common menu items */}
        <MenuSection>
          <MenuItem icon={UserPlus} label="Pacientes" />
          <MenuItem icon={Bell} label="Centro de Notificações" />
          {userRole !== 'patient' && (
            <MenuItem icon={Clock} label="Gerir Disponibilidade" />
          )}
        </MenuSection>

        <MenuSection>
          <MenuItem icon={Globe} label="Comunidade SmileCheck" />
          <MenuItem icon={Gift} label="Programa de Referral" />
        </MenuSection>

        <MenuSection>
          <MenuItem icon={Settings} label="Definições" />
          <MenuItem icon={HelpCircle} label="Ajuda" />
          <MenuItem icon={Phone} label="Contactar Suporte" />
          <MenuItem icon={FileText} label="Termos de Utilização" />
        </MenuSection>

        <MenuSection className="border-b-0">
          <MenuItem icon={LogOut} label="Terminar Sessão" />
        </MenuSection>
      </SheetContent>
    </Sheet>
  );
}
