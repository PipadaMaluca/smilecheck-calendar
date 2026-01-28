import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dentist } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DentistFilterProps {
  dentists: Dentist[];
  selectedDentistId: string | null;
  onSelect: (dentistId: string | null) => void;
}

export function DentistFilter({ dentists, selectedDentistId, onSelect }: DentistFilterProps) {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <Button
          variant={selectedDentistId === null ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onSelect(null)}
          className={cn(
            'flex-shrink-0 text-xs',
            selectedDentistId === null && 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          Todos
        </Button>
        {dentists.map((dentist) => (
          <Button
            key={dentist.id}
            variant={selectedDentistId === dentist.id ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onSelect(dentist.id)}
            className={cn(
              'flex-shrink-0 text-xs',
              selectedDentistId === dentist.id && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {dentist.name}
          </Button>
        ))}
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
