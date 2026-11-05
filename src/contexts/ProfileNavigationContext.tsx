import { createContext, useContext, useCallback } from 'react';
import { DentistSearchResult, MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { useDirectory } from '@/data/directorySource';
import { fetchPublicDentist, isUuid } from '@/data/publicProfiles';

interface ProfileNavigationContextType {
  openDentistProfile: (dentistNameOrResult: string | DentistSearchResult) => void;
  openClinicProfile: (clinicNameOrId: string) => void;
  openPatientProfile: (patientId: string) => void;
}

const ProfileNavigationContext = createContext<ProfileNavigationContextType | null>(null);

export function ProfileNavigationProvider({ 
  children, 
  onOpenDentistProfile, 
  onOpenClinicProfile,
  onOpenPatientProfile,
}: { 
  children: React.ReactNode;
  onOpenDentistProfile: (dentist: DentistSearchResult) => void;
  onOpenClinicProfile: (clinicId: string) => void;
  onOpenPatientProfile?: (patientId: string) => void;
}) {
  const dir = useDirectory();
  const { clinics: mockClinics } = dir;
  const openDentistProfile = useCallback((nameOrResult: string | DentistSearchResult) => {
    if (typeof nameOrResult === 'string' && !dir.isDemo) {
      // Real: uuid or a directory name → public-only profile from the server.
      const key: string = nameOrResult;
      const id = isUuid(key)
        ? key
        : dir.dentists.find((d) => d.name.toLowerCase() === key.toLowerCase())?.id;
      if (id) void fetchPublicDentist(id).then((d) => { if (d) onOpenDentistProfile(d); });
      return;
    }
    if (typeof nameOrResult === 'string') {
      const dentist = MOCK_DENTIST_RESULTS.find(
        (d) => d.name.toLowerCase() === nameOrResult.toLowerCase()
      );
      if (dentist) onOpenDentistProfile(dentist);
    } else {
      onOpenDentistProfile(nameOrResult);
    }
  }, [onOpenDentistProfile, dir]);

  const openClinicProfile = useCallback((nameOrId: string) => {
    const byId = mockClinics.find((c) => c.id === nameOrId);
    if (byId) {
      onOpenClinicProfile(byId.id);
    } else {
      const byName = mockClinics.find((c) => c.name.toLowerCase() === nameOrId.toLowerCase());
      if (byName) onOpenClinicProfile(byName.id);
    }
  }, [onOpenClinicProfile, mockClinics]);

  const openPatientProfile = useCallback((patientId: string) => {
    onOpenPatientProfile?.(patientId);
  }, [onOpenPatientProfile]);

  return (
    <ProfileNavigationContext.Provider value={{ openDentistProfile, openClinicProfile, openPatientProfile }}>
      {children}
    </ProfileNavigationContext.Provider>
  );
}

export function useProfileNavigation() {
  return useContext(ProfileNavigationContext);
}
