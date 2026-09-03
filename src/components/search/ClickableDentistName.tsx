import { cn } from '@/lib/utils';
import { useProfileNavigation } from '@/contexts/ProfileNavigationContext';
import { MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';

interface ClickableDentistNameProps {
  name: string;
  className?: string;
  children?: React.ReactNode;
  onGoHome?: () => void;
}

/**
 * Makes a dentist name clickable to open their full profile view.
 * Uses ProfileNavigationContext to navigate at the top level — never renders inline.
 */
export function ClickableDentistName({ name, className, children, onGoHome }: ClickableDentistNameProps) {
  const nav = useProfileNavigation();

  const dentist = MOCK_DENTIST_RESULTS.find(
    (d) => d.name.toLowerCase() === name.toLowerCase()
  );

  if (!dentist || !nav) {
    return <span className={className}>{children || name}</span>;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        nav.openDentistProfile(dentist);
      }}
      className={cn("hover:underline transition-colors cursor-pointer text-left text-base px-px py-[3px] text-[#7ab4ff] press",

      className
      )}>

      {children || name}
    </button>);

}