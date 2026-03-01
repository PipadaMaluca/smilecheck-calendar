import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PatientDossierView } from '@/components/calendar/desktop/PatientDossierView';

interface MobilePatientDossierProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

/**
 * Full-screen wrapper for PatientDossierView on mobile/tablet.
 * Shows back arrow, bottom nav padding, and scrollable content.
 */
export function MobilePatientDossier({ patientId, isOpen, onClose, onNavigate }: MobilePatientDossierProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden pb-[60px]">
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
      />
    </div>
  );
}
