import { createContext, useContext, useCallback } from 'react';
import { DentistSearchResult, MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { mockClinics } from '@/data/mockData';

interface ProfileNavigationContextType {
  openDentistProfile: (dentistNameOrResult: string | DentistSearchResult) => void;
  openClinicProfile: (clinicNameOrId: string) => void;
}

const ProfileNavigationContext = createContext<ProfileNavigationContextType | null>(null);

export function ProfileNavigationProvider({ 
  children, 
  onOpenDentistProfile, 
  onOpenClinicProfile 
}: { 
  children: React.ReactNode;
  onOpenDentistProfile: (dentist: DentistSearchResult) => void;
  onOpenClinicProfile: (clinicId: string) => void;
}) {
  const openDentistProfile = useCallback((nameOrResult: string | DentistSearchResult) => {
    if (typeof nameOrResult === 'string') {
      const dentist = MOCK_DENTIST_RESULTS.find(
        (d) => d.name.toLowerCase() === nameOrResult.toLowerCase()
      );
      if (dentist) onOpenDentistProfile(dentist);
    } else {
      onOpenDentistProfile(nameOrResult);
    }
  }, [onOpenDentistProfile]);

  const openClinicProfile = useCallback((nameOrId: string) => {
    const byId = mockClinics.find((c) => c.id === nameOrId);
    if (byId) {
      onOpenClinicProfile(byId.id);
    } else {
      const byName = mockClinics.find((c) => c.name.toLowerCase() === nameOrId.toLowerCase());
      if (byName) onOpenClinicProfile(byName.id);
    }
  }, [onOpenClinicProfile]);

  return (
    <ProfileNavigationContext.Provider value={{ openDentistProfile, openClinicProfile }}>
      {children}
    </ProfileNavigationContext.Provider>
  );
}

export function useProfileNavigation() {
  return useContext(ProfileNavigationContext);
}
