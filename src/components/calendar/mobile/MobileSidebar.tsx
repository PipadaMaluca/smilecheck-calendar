import { X, User, CreditCard, List, Calendar, CalendarDays, Building2, Users, Bell, Clock, Globe, Gift, Settings, HelpCircle, Phone, FileText, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UserRole, ViewMode } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { mockDentists, mockClinics, mockFamilyMembers, getDentistsForClinic } from '@/data/mockData';

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
  onDentistToggle?: (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => void;
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
  const [expandedClinics, setExpandedClinics] = useState<string[]>(['1']);

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

  const toggleClinicExpanded = (clinicId: string) => {
    setExpandedClinics(prev => 
      prev.includes(clinicId) 
        ? prev.filter(id => id !== clinicId)
        : [...prev, clinicId]
    );
  };

  // Check if a dentist is selected for a specific clinic
  const isDentistSelected = (dentistId: string, clinicId: string) => {
    const key = `${clinicId}-${dentistId}`;
    if (selectedDentists.includes('all')) return true;
    return selectedDentists.includes(key) || selectedDentists.includes(dentistId);
  };

  // Check if at least one dentist of a clinic is selected
  const isClinicPartiallySelected = (clinicId: string) => {
    if (selectedDentists.includes('all')) return true;
    const dentistsInClinic = getDentistsForClinic(clinicId);
    return dentistsInClinic.some(d => {
      const key = `${clinicId}-${d.id}`;
      return selectedDentists.includes(key) || selectedDentists.includes(d.id);
    });
  };

  // Check if all dentists of a clinic are selected
  const isClinicFullySelected = (clinicId: string) => {
    if (selectedDentists.includes('all')) return true;
    const dentistsInClinic = getDentistsForClinic(clinicId);
    return dentistsInClinic.every(d => {
      const key = `${clinicId}-${d.id}`;
      return selectedDentists.includes(key) || selectedDentists.includes(d.id);
    });
  };

  const handleClinicCheckbox = (clinicId: string) => {
    const dentistsInClinic = getDentistsForClinic(clinicId);
    const allSelected = isClinicFullySelected(clinicId);
    
    if (allSelected) {
      dentistsInClinic.forEach(d => {
        const key = `${clinicId}-${d.id}`;
        if (selectedDentists.includes(key) || selectedDentists.includes(d.id)) {
          onDentistToggle?.(d.id, true, clinicId);
        }
      });
    } else {
      dentistsInClinic.forEach(d => {
        const key = `${clinicId}-${d.id}`;
        if (!selectedDentists.includes(key) && !selectedDentists.includes(d.id)) {
          onDentistToggle?.(d.id, true, clinicId);
        }
      });
    }
    
    onClinicToggle?.(clinicId, true);
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

  // Custom checkbox component with larger size
  const CustomCheckbox = ({ checked, onChange, className }: { checked: boolean; onChange: () => void; className?: string }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
        checked 
          ? 'bg-primary border-primary text-primary-foreground' 
          : 'border-muted-foreground/50 hover:border-primary',
        className
      )}
    >
      {checked && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] p-0 bg-card overflow-y-auto">
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

        {/* Views - Only for Dentist/Clinic (NOT Patient) */}
        {userRole !== 'patient' && (
          <MenuSection>
            <MenuItem 
              icon={Calendar} 
              label="Vista Diária" 
              active={viewMode === 'day'}
              onClick={() => handleViewChange('day')}
            />
            <MenuItem 
              icon={CalendarDays} 
              label="Vista 3 Dias" 
              active={viewMode === 'three-day'}
              onClick={() => handleViewChange('three-day')}
            />
            <MenuItem 
              icon={List} 
              label="Vista em Lista" 
              active={viewMode === 'list'}
              onClick={() => handleViewChange('list')}
            />
          </MenuSection>
        )}

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
              <CollapsibleContent className="px-4 py-2 space-y-3">
                {/* All option */}
                <div className="flex items-center gap-3">
                  <CustomCheckbox 
                    checked={selectedMembers.includes('all')}
                    onChange={() => onMemberToggle?.('all', true)}
                  />
                  <button 
                    className="text-sm hover:text-primary"
                    onClick={() => onMemberToggle?.('all', false)}
                  >
                    Todos
                  </button>
                </div>
                {mockFamilyMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <CustomCheckbox 
                      checked={selectedMembers.includes(member.id) || selectedMembers.includes('all')}
                      onChange={() => onMemberToggle?.(member.id, true)}
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

        {/* Dentist/Clinic: Agendas - Hierarchical with 3 clinics */}
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
              <CollapsibleContent className="px-2 py-2 space-y-1">
                {/* "Filtrar Presentes" / Todos */}
                <div className="flex items-center gap-2 py-1.5 ml-2">
                  <CustomCheckbox 
                    checked={selectedDentists.includes('all') || selectedDentists.length === 0}
                    onChange={() => onDentistToggle?.(null, true)}
                  />
                  <button 
                    className="text-sm hover:text-primary"
                    onClick={() => onDentistToggle?.(null, false)}
                  >
                    Filtrar Presentes
                  </button>
                </div>
                
                {mockClinics.map(clinic => {
                  const clinicExpanded = expandedClinics.includes(clinic.id);
                  const dentistsInClinic = getDentistsForClinic(clinic.id);
                  
                  // Check if all dentists of this clinic are selected
                  const allClinicDentistsSelected = dentistsInClinic.every(d => {
                    const key = `${clinic.id}-${d.id}`;
                    return selectedDentists.includes('all') || selectedDentists.includes(key);
                  });
                  
                  // Check if at least one dentist of this clinic is selected
                  const someClinicDentistsSelected = dentistsInClinic.some(d => {
                    const key = `${clinic.id}-${d.id}`;
                    return selectedDentists.includes('all') || selectedDentists.includes(key);
                  });
                  
                  return (
                    <div key={clinic.id} className="ml-2">
                      {/* Clinic header */}
                      <div className="flex items-center gap-2 py-1.5">
                        <CustomCheckbox 
                          checked={allClinicDentistsSelected || someClinicDentistsSelected}
                          onChange={() => {
                            // Toggle all dentists in clinic
                            const keys = dentistsInClinic.map(d => `${clinic.id}-${d.id}`);
                            if (allClinicDentistsSelected) {
                              // Deselect all
                              keys.forEach(key => {
                                if (selectedDentists.includes(key)) {
                                  onDentistToggle?.(key.split('-').slice(1).join('-'), true, clinic.id);
                                }
                              });
                            } else {
                              // Select all
                              keys.forEach(key => {
                                if (!selectedDentists.includes(key) && !selectedDentists.includes('all')) {
                                  onDentistToggle?.(key.split('-').slice(1).join('-'), true, clinic.id);
                                }
                              });
                            }
                          }}
                        />
                        <button 
                          className="flex-1 flex items-center justify-between text-sm hover:text-primary"
                          onClick={() => {
                            // Exclusive selection - select only this clinic's dentists
                            const keys = dentistsInClinic.map(d => `${clinic.id}-${d.id}`);
                            // First dentist as name click to set exclusive
                            if (dentistsInClinic.length > 0) {
                              onDentistToggle?.(dentistsInClinic[0].id, false, clinic.id);
                              // Then add the rest
                              keys.slice(1).forEach(key => {
                                const dentistId = key.split('-').slice(1).join('-');
                                onDentistToggle?.(dentistId, true, clinic.id);
                              });
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{clinic.name.replace('Clínica ', '')}</span>
                          </div>
                        </button>
                        <button onClick={() => toggleClinicExpanded(clinic.id)}>
                          {clinicExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      
                      {/* Dentists under this clinic */}
                      {clinicExpanded && (
                        <div className="ml-8 space-y-2 pb-2">
                          {dentistsInClinic.map(dentist => {
                            const key = `${clinic.id}-${dentist.id}`;
                            const isSelected = selectedDentists.includes('all') || selectedDentists.includes(key);
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <CustomCheckbox 
                                  checked={isSelected}
                                  onChange={() => onDentistToggle?.(dentist.id, true, clinic.id)}
                                />
                                <button 
                                  className="text-xs hover:text-primary text-left"
                                  onClick={() => onDentistToggle?.(dentist.id, false, clinic.id)}
                                >
                                  {dentist.name}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
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
          {userRole !== 'patient' && (
            <MenuItem icon={Users} label="Pacientes" />
          )}
          <MenuItem icon={Bell} label="Centro de Notificações" />
          {userRole !== 'patient' && (
            <MenuItem icon={Clock} label="Gerir Disponibilidade" />
          )}
        </MenuSection>

        {userRole !== 'patient' && (
          <MenuSection>
            <MenuItem icon={Globe} label="Comunidade SmileCheck" />
            <MenuItem icon={Gift} label="Programa de Referral" />
          </MenuSection>
        )}

        {userRole === 'patient' && (
          <MenuSection>
            <MenuItem icon={Gift} label="Programa de Referral" />
          </MenuSection>
        )}

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
