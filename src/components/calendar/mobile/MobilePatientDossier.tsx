import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientDossierView } from '@/components/calendar/desktop/PatientDossierView';
import { FullScreenMobileOverlay } from '@/components/layout/FullScreenMobileOverlay';

import { UserRole } from '@/types/calendar';

interface MobilePatientDossierProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
  userRole?: UserRole;
}

/**
 * Full-screen wrapper for PatientDossierView on mobile/tablet.
 * Shows back arrow, bottom nav padding, and scrollable content.
 */
export function MobilePatientDossier({ patientId, isOpen, onClose, onNavigate, userRole }: MobilePatientDossierProps) {
  if (!isOpen) return null;

  return (
    <FullScreenMobileOverlay className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-base font-semibold">Dossier do Paciente</h2>
        <div className="w-10" />
      </div>
      <PatientDossierView
        patientId={patientId}
        onClose={onClose}
        onNavigate={onNavigate || (() => {})}
        userRole={userRole}
      />
    </FullScreenMobileOverlay>
  );
}
