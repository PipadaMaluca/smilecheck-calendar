import { UserRole } from '@/types/calendar';
import { PatientBillingView } from './PatientBillingView';
import { DentistBillingView } from './DentistBillingView';
import { ClinicBillingView } from './ClinicBillingView';

interface BillingViewProps {
  userRole: UserRole;
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export function BillingView({ userRole, initialTab, onNavigate }: BillingViewProps) {
  if (userRole === 'patient') return <PatientBillingView initialTab={initialTab} onNavigate={onNavigate} />;
  if (userRole === 'dentist') return <DentistBillingView initialTab={initialTab} onNavigate={onNavigate} />;
  return <ClinicBillingView initialTab={initialTab} onNavigate={onNavigate} />;
}
