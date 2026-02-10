import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DentistProfileModal } from './DentistProfileModal';
import { MOCK_DENTIST_RESULTS, DentistSearchResult } from '@/data/mockDentistSearch';

interface ClickableDentistNameProps {
  name: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Makes a dentist name clickable to open their profile modal.
 * Attempts to match the name to a dentist in the mock data.
 * If no match is found, the name is rendered as plain text.
 * Only intended for patient role.
 */
export function ClickableDentistName({ name, className, children }: ClickableDentistNameProps) {
  const [selectedDentist, setSelectedDentist] = useState<DentistSearchResult | null>(null);

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
          setSelectedDentist(dentist);
        }}
        className={cn(
          'text-left hover:underline hover:text-primary transition-colors cursor-pointer',
          className
        )}
      >
        {children || name}
      </button>
      {selectedDentist && (
        <DentistProfileModal
          dentist={selectedDentist}
          onClose={() => setSelectedDentist(null)}
        />
      )}
    </>
  );
}
