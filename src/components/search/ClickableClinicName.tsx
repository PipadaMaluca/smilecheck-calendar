import { cn } from '@/lib/utils';
import { useProfileNavigation } from '@/contexts/ProfileNavigationContext';
import { mockClinics } from '@/data/mockData';

interface ClickableClinicNameProps {
  name: string;
  clinicId?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Makes a clinic name clickable to open its full profile page.
 * Uses ProfileNavigationContext to navigate at the top level — never renders inline.
 */
export function ClickableClinicName({ name, clinicId, className, children }: ClickableClinicNameProps) {
  const nav = useProfileNavigation();

  const clinic = clinicId
    ? mockClinics.find(c => c.id === clinicId)
    : mockClinics.find(c => c.name.toLowerCase() === name.toLowerCase());

  if (!clinic || !nav) {
    return <span className={className}>{children || name}</span>;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        nav.openClinicProfile(clinic.id);
      }}
      className={cn(
        'text-left hover:underline hover:text-primary transition-colors cursor-pointer',
        className
      )}
    >
      {children || name}
    </button>
  );
}
