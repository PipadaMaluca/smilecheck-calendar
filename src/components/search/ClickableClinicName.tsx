import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ClinicProfileView } from '@/components/profile/ClinicProfileView';
import { mockClinics } from '@/data/mockData';

interface ClickableClinicNameProps {
  name: string;
  clinicId?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Makes a clinic name clickable to open its full profile modal.
 * Matches by name or clinicId.
 */
export function ClickableClinicName({ name, clinicId, className, children }: ClickableClinicNameProps) {
  const [showProfile, setShowProfile] = useState(false);

  const clinic = clinicId
    ? mockClinics.find(c => c.id === clinicId)
    : mockClinics.find(c => c.name.toLowerCase() === name.toLowerCase());

  if (!clinic) {
    return <span className={className}>{children || name}</span>;
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowProfile(true);
        }}
        className={cn(
          'text-left hover:underline hover:text-primary transition-colors cursor-pointer',
          className
        )}
      >
        {children || name}
      </button>
      {showProfile && (
        <ClinicProfileView
          clinicId={clinic.id}
          isOpen={true}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}
