import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

  return (
    <div className="px-4 py-2">
      <div className={cn(
        'flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1',
        centered && 'justify-center'
      )}>
        {/* All button */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex-shrink-0',
            isAllSelected
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-muted-foreground hover:border-primary/50'
          )}
        >
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={() => onToggle(null, true)}
            className="w-3 h-3"
          />
          <button onClick={() => onToggle(null, false)}>
            Todos
          </button>
        </div>

        {/* Dentist buttons */}
        {dentists.map((dentist) => {
          const isSelected = selectedDentistIds.includes(dentist.id);
          return (
            <div
              key={dentist.id}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex-shrink-0',
                isSelected && !isAllSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : isAllSelected
                    ? 'bg-primary/20 text-primary border-primary/50'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              <Checkbox
                checked={isSelected || isAllSelected}
                onCheckedChange={() => onToggle(dentist.id, true)}
                className="w-3 h-3"
              />
              <button onClick={() => onToggle(dentist.id, false)}>
                {dentist.name.replace('Dr. ', '')}
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
