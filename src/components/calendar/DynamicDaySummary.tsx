import { BarChart3, Video, MapPin, Users } from 'lucide-react';
import { Consultation } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { mockClinics, getDentistsForClinic } from '@/data/mockData';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const getTitle = (): string => {
    const allKeys = mockClinics.flatMap(c => getDentistsForClinic(c.id).map(d => `${c.id}-${d.id}`));
    const isAll = selectedDentistIds.length === 0 || allKeys.every(k => selectedDentistIds.includes(k));
    if (isAll) {
      if (selectedClinics.length === 0 || selectedClinics.length === mockClinics.length) {
        return `${t('daySummary.title')} - ${t('daySummary.allClinics')}`;
      } else if (selectedClinics.length === 1) {
        const clinic = mockClinics.find(c => c.id === selectedClinics[0]);
        return `${t('daySummary.title')} - ${clinic?.name || ''}`;
      } else {
        return `${t('daySummary.title')} - ${t('daySummary.multipleClinics')}`;
      }
    }
    
    if (selectedDentistIds.length === 1) {
      const key = selectedDentistIds[0];
      const parts = key.split('-');
      let dentistId = key;
      
      if (parts.length >= 2) {
        dentistId = parts.slice(1).join('-');
      }
      
      const allDentists = mockClinics.flatMap(c => getDentistsForClinic(c.id));
      const dentist = allDentists.find(d => d.id === dentistId);
      
      if (dentist) {
        return `${t('daySummary.title')} - ${dentist.name}`;
      }
    }
    
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
      return `${t('daySummary.title')} - ${clinic?.name || ''}`;
    }
    
    return `${t('daySummary.title')} - ${t('daySummary.multipleClinics')}`;
  };

  const getFilteredConsultations = () => {
    const allKeys2 = mockClinics.flatMap(c => getDentistsForClinic(c.id).map(d => `${c.id}-${d.id}`));
    const isAll2 = selectedDentistIds.length === 0 || allKeys2.every(k => selectedDentistIds.includes(k));
    if (isAll2) {
      if (selectedClinics.length === 0) {
        return consultations;
      }
      return consultations.filter(c => selectedClinics.includes(c.clinic.id));
    }
    
    return consultations.filter(c => {
      const key = `${c.clinic.id}-${c.dentist.id}`;
      return selectedDentistIds.includes(key) || selectedDentistIds.includes(c.dentist.id);
    });
  };

  const filteredConsultations = getFilteredConsultations();
  
  const presenciais = filteredConsultations.filter(c => 
    c.type !== 'teleconsulta'
  ).length;
  
  const teleconsultas = filteredConsultations.filter(c => 
    c.type === 'teleconsulta'
  ).length;
  
  const total = presenciais + teleconsultas;

  if (selectedDentistIds.length === 0 && selectedClinics.length === 0) {
    return (
      <div className={cn('bg-card rounded-xl p-4 mx-4 animate-fade-in', className)}>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">{t('daySummary.title')}</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-2">
          {t('daySummary.noCalendarSelected')}
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
          <span className="text-sm text-muted-foreground">{t('daySummary.inPerson')}:</span>
          <span className="text-lg font-bold text-presencial">{presenciais}</span>
        </div>

        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-teleconsulta" />
          <span className="text-sm text-muted-foreground">{t('daySummary.teleconsultations')}:</span>
          <span className="text-lg font-bold text-teleconsulta">{teleconsultas}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">{t('daySummary.total')}:</span>
          <span className="text-lg font-bold text-primary">{total}</span>
        </div>
      </div>
    </div>
  );
}
