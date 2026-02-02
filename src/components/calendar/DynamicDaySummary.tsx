import { BarChart3, Video, MapPin, Clock, Users } from 'lucide-react';
import { Consultation, Dentist, Clinic } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { mockClinics, mockDentists, getDentistsForClinic } from '@/data/mockData';

interface DynamicDaySummaryProps {
  consultations: Consultation[];
  selectedDentistIds: string[];
  selectedClinics: string[];
  className?: string;
}

export function DynamicDaySummary({ 
  consultations, 
  selectedDentistIds,
  selectedClinics,
  className 
}: DynamicDaySummaryProps) {
  // Calculate title based on selection
  const getTitle = (): string => {
    // No selection = all
    if (selectedDentistIds.length === 0 || selectedDentistIds.includes('all')) {
      if (selectedClinics.length === 0 || selectedClinics.length === mockClinics.length) {
        return 'Resumo do Dia - Todas as Clínicas';
      } else if (selectedClinics.length === 1) {
        const clinic = mockClinics.find(c => c.id === selectedClinics[0]);
        return `Resumo do Dia - ${clinic?.name || 'Clínica'}`;
      } else {
        return 'Resumo do Dia - Múltiplas Clínicas';
      }
    }
    
    // Single dentist selected
    if (selectedDentistIds.length === 1) {
      const key = selectedDentistIds[0];
      // Key format: clinicId-dentistId
      const parts = key.split('-');
      let dentistId = key;
      let clinicId = '';
      
      if (parts.length >= 2) {
        clinicId = parts[0];
        dentistId = parts.slice(1).join('-');
      }
      
      // Find dentist by id
      const allDentists = mockClinics.flatMap(c => getDentistsForClinic(c.id));
      const dentist = allDentists.find(d => d.id === dentistId);
      
      if (dentist) {
        return `Resumo do Dia - ${dentist.name}`;
      }
    }
    
    // Multiple dentists selected - check if same clinic
    const clinicsFromSelection = new Set<string>();
    
    selectedDentistIds.forEach(key => {
      const parts = key.split('-');
      if (parts.length >= 2) {
        clinicsFromSelection.add(parts[0]);
      }
    });
    
    if (clinicsFromSelection.size === 1) {
      const clinicId = Array.from(clinicsFromSelection)[0];
      const clinic = mockClinics.find(c => c.id === clinicId);
      return `Resumo do Dia - ${clinic?.name || 'Clínica'}`;
    }
    
    return 'Resumo do Dia - Múltiplas Clínicas';
  };

  // Filter consultations based on selection
  const getFilteredConsultations = () => {
    if (selectedDentistIds.length === 0 || selectedDentistIds.includes('all')) {
      // Filter by clinics only
      if (selectedClinics.length === 0) {
        return consultations;
      }
      return consultations.filter(c => selectedClinics.includes(c.clinic.id));
    }
    
    // Filter by specific dentist-clinic pairs
    return consultations.filter(c => {
      const key = `${c.clinic.id}-${c.dentist.id}`;
      return selectedDentistIds.includes(key) || selectedDentistIds.includes(c.dentist.id);
    });
  };

  const filteredConsultations = getFilteredConsultations();
  
  // Calculate stats
  const presenciais = filteredConsultations.filter(c => 
    c.type !== 'teleconsulta'
  ).length;
  
  const teleconsultas = filteredConsultations.filter(c => 
    c.type === 'teleconsulta'
  ).length;
  
  const total = presenciais + teleconsultas;

  // If no selection at all
  if (selectedDentistIds.length === 0 && selectedClinics.length === 0) {
    return (
      <div className={cn('bg-card rounded-xl p-4 mx-4 animate-fade-in', className)}>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Resumo do Dia</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-2">
          Nenhum calendário selecionado
        </p>
      </div>
    );
  }

  return (
    <div className={cn('bg-card rounded-xl p-4 mx-4 animate-fade-in', className)}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">{getTitle()}</h3>
      </div>

      <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-presencial" />
          <span className="text-sm text-muted-foreground">Presenciais:</span>
          <span className="text-lg font-bold text-presencial">{presenciais}</span>
        </div>

        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-teleconsulta" />
          <span className="text-sm text-muted-foreground">Teleconsultas:</span>
          <span className="text-lg font-bold text-teleconsulta">{teleconsultas}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Total:</span>
          <span className="text-lg font-bold text-primary">{total}</span>
        </div>
      </div>
    </div>
  );
}
