import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/calendar';
import { DentistSearchResult } from '@/data/mockDentistSearch';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { ProfileSkeleton } from '@/components/skeletons';
import { EditProfileView } from './EditProfileView';
import { PatientProfileBody } from './patient/PatientProfileBody';
import { FullScreenMobileOverlay } from '@/components/layout/FullScreenMobileOverlay';

interface ProfileViewProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
  onViewClinicProfile?: (clinicId: string) => void;
  onViewDentistProfile?: (dentist: DentistSearchResult) => void;
}

export function ProfileView(props: ProfileViewProps) {
  const { userRole, isOpen, onClose, inline } = props;
  const [showEdit, setShowEdit] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const isLoading = useSimulatedLoading(1000, `profile:${userRole}`);
  if (!isOpen) return null;

  if (showEdit) {
    return (
      <EditProfileView
        userRole={userRole}
        isOpen={true}
        onClose={() => setShowEdit(false)}
        onSave={() => setShowEdit(false)}
        inline={inline}
      />
    );
  }

  // Esta vista é, neste momento, específica para Paciente.
  // Dentista e Clínica usam os seus componentes dedicados.
  if (userRole !== 'patient') return null;

  const profileBody = isLoading ? (
    <ProfileSkeleton />
  ) : (
    <div className="animate-fade-in">
      <PatientProfileBody
        userRole={userRole}
        isMobile={isMobile}
        onEditProfile={() => setShowEdit(true)}
      />
    </div>
  );

  if (inline) {
    return <div className="w-full">{profileBody}</div>;
  }

  return (
    <FullScreenMobileOverlay>
      <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-base font-semibold">{t('profile.myProfile')}</h2>
        <div className="w-10" />
      </div>
      <ScrollArea className="flex-1">{profileBody}</ScrollArea>
    </FullScreenMobileOverlay>
  );
}
