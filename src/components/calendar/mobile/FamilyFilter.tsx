import { mockFamilyMembers } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface FamilyFilterProps {
  selectedMembers: string[];
  onMemberToggle: (memberId: string, isCheckbox: boolean) => void;
}

export function FamilyFilter({ selectedMembers, onMemberToggle }: FamilyFilterProps) {
  const isAllSelected = selectedMembers.includes('all');

  // Custom checkbox with larger size (24px x 24px)
  const CustomCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
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
      <div className="flex flex-wrap items-center gap-3">
        {/* All option */}
        <div className="flex items-center gap-2">
          <CustomCheckbox
            checked={isAllSelected}
            onChange={() => onMemberToggle('all', true)}
          />
          <button 
            className={cn(
              'text-xs font-medium transition-colors',
              isAllSelected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => onMemberToggle('all', false)}
          >
            Todos
          </button>
        </div>

        {/* Family members with ages */}
        {mockFamilyMembers.map((member) => {
          const isSelected = isAllSelected || selectedMembers.includes(member.id);
          return (
            <div key={member.id} className="flex items-center gap-2">
              <CustomCheckbox
                checked={isSelected}
                onChange={() => onMemberToggle(member.id, true)}
              />
              <button 
                className={cn(
                  'text-xs font-medium transition-colors text-left',
                  isSelected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => onMemberToggle(member.id, false)}
              >
                {member.name} ({member.age} anos) - {member.relation}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
