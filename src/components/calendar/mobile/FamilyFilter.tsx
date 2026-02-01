import { Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { mockFamilyMembers } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface FamilyFilterProps {
  selectedMembers: string[];
  onMemberToggle: (memberId: string, isCheckbox: boolean) => void;
}

export function FamilyFilter({ selectedMembers, onMemberToggle }: FamilyFilterProps) {
  const isAllSelected = selectedMembers.includes('all');

  return (
    <div className="px-4 mb-4">
      <p className="text-xs font-medium text-muted-foreground mb-2">Filtrar por membro:</p>
      <div className="flex flex-wrap gap-2">
        {/* All option */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
            isAllSelected
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-muted-foreground hover:border-primary/50'
          )}
        >
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={() => onMemberToggle('all', true)}
            className="w-3 h-3"
          />
          <button onClick={() => onMemberToggle('all', false)}>
            Todos
          </button>
        </div>

        {/* Family members */}
        {mockFamilyMembers.map(member => {
          const isSelected = selectedMembers.includes(member.id) || isAllSelected;
          return (
            <div
              key={member.id}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                isSelected && !isAllSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : isAllSelected
                    ? 'bg-primary/20 text-primary border-primary/50'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onMemberToggle(member.id, true)}
                className="w-3 h-3"
              />
              <button onClick={() => onMemberToggle(member.id, false)}>
                {member.name} ({member.age} anos) - {member.relation}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
