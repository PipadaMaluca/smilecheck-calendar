import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dentist } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DentistFilterMobileProps {
  dentists: Dentist[];
  selectedDentistIds: string[];
  onToggle: (dentistId: string | null, isCheckbox: boolean) => void;
  centered?: boolean;
}

export function DentistFilterMobile({ 
  dentists, 
  selectedDentistIds, 
  onToggle,
  centered = false 
}: DentistFilterMobileProps) {
  const isAllSelected = selectedDentistIds.length === 0 || selectedDentistIds.includes('all');

  // Custom checkbox with larger size (24px x 24px)
  const CustomCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
        checked 
          ? 'bg-primary border-primary text-primary-foreground' 
          : 'border-muted-foreground/50 hover:border-primary'
      )}
    >
      {checked && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="px-4 py-2">
      <div className={cn(
        'flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1',
        centered && 'justify-center'
      )}>
        {/* All button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <CustomCheckbox
            checked={isAllSelected}
            onChange={() => onToggle(null, true)}
          />
          <button 
            className={cn(
              'text-xs font-medium transition-colors',
              isAllSelected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => onToggle(null, false)}
          >
            Todos
          </button>
        </div>

        {/* Dentist buttons */}
        {dentists.map((dentist) => {
          const isSelected = selectedDentistIds.includes(dentist.id);
          return (
            <div
              key={dentist.id}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <CustomCheckbox
                checked={isSelected || isAllSelected}
                onChange={() => onToggle(dentist.id, true)}
              />
              <button 
                className={cn(
                  'text-xs font-medium transition-colors',
                  (isSelected || isAllSelected) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => onToggle(dentist.id, false)}
              >
                {dentist.name.replace('Dr. ', '').replace('Dra. ', '')}
              </button>
            </div>
          );
        })}

        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 w-8 h-8 text-primary"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
