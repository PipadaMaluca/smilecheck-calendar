import { onActivateKey } from '@/lib/a11y';
import { cn } from '@/lib/utils';
import { useProfileNavigation } from '@/contexts/ProfileNavigationContext';
import { MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { useDirectory } from '@/data/directorySource';
import { isUuid } from '@/data/publicProfiles';

interface ClickableDentistNameProps {
  name: string;
  /** Real accounts: backend id of the dentist (falls back to a directory name match). */
  dentistId?: string;
  className?: string;
  children?: React.ReactNode;
  onGoHome?: () => void;
}

/**
 * Makes a dentist name clickable to open their full profile view.
 * Uses ProfileNavigationContext to navigate at the top level — never renders inline.
 */
export function ClickableDentistName({ name, dentistId, className, children, onGoHome }: ClickableDentistNameProps) {
  const nav = useProfileNavigation();

  const dir = useDirectory();
  const realId = !dir.isDemo
    ? (isUuid(dentistId) ? dentistId : dir.dentists.find((d) => d.name.toLowerCase() === name.toLowerCase())?.id)
    : undefined;
  const dentist = dir.isDemo ? MOCK_DENTIST_RESULTS.find(
    (d) => d.name.toLowerCase() === name.toLowerCase()
  ) : undefined;

  if ((!dentist && !realId) || !nav) {
    return <span className={className}>{children || name}</span>;
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onKeyDown={onActivateKey}
      onClick={(e) => {
        e.stopPropagation();
        nav.openDentistProfile(dentist ?? realId!);
      }}
      className={cn("hover:underline transition-colors cursor-pointer text-left text-base px-px py-0.5 text-primary",

      className
      )}>

      {children || name}
    </span>);

}