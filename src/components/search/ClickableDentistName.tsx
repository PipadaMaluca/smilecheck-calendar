import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DentistProfileView } from '@/components/profile/DentistProfileView';
import { MOCK_DENTIST_RESULTS, DentistSearchResult } from '@/data/mockDentistSearch';

interface ClickableDentistNameProps {
  name: string;
  className?: string;
  children?: React.ReactNode;
  onGoHome?: () => void;
}

/**
 * Makes a dentist name clickable to open their full profile view.
 * Works for all roles (patient, dentist, clinic).
 */
export function ClickableDentistName({ name, className, children, onGoHome }: ClickableDentistNameProps) {
  const [showProfile, setShowProfile] = useState(false);

  const dentist = MOCK_DENTIST_RESULTS.find(
    (d) => d.name.toLowerCase() === name.toLowerCase()
  );

  if (!dentist) {
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
        <DentistProfileView
          dentist={dentist}
          isOpen={true}
          onClose={() => setShowProfile(false)}
          onGoHome={onGoHome}
        />
      )}
    </>
  );
}
