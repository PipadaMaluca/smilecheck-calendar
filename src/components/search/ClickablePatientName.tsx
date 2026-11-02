import { onActivateKey } from '@/lib/a11y';
import { cn } from '@/lib/utils';
import { useProfileNavigation } from '@/contexts/ProfileNavigationContext';

interface ClickablePatientNameProps {
  name: string;
  patientId?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Makes a patient name clickable to open their profile/dossier.
 * Uses ProfileNavigationContext to navigate at the top level.
 */
export function ClickablePatientName({ name, patientId, className, children }: ClickablePatientNameProps) {
  const nav = useProfileNavigation();

  if (!nav) {
    return <span className={className}>{children || name}</span>;
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onKeyDown={onActivateKey}
      onClick={(e) => {
        e.stopPropagation();
        nav.openPatientProfile(patientId || 'default');
      }}
      className={cn("hover:underline hover:text-primary transition-colors cursor-pointer text-left text-sm",

      className
      )}>
      
      {children || name}
    </span>);

}