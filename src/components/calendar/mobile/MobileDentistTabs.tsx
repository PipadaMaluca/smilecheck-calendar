import { cn } from '@/lib/utils';
import { mockClinics, getDentistsForClinic, clinicDentists } from '@/data/mockData';
import { getDentistInitials } from '@/lib/avatarUtils';

interface MobileDentistTabsProps {
  activeKey: string | null;
  onSelect: (key: string) => void;
}

/**
 * Mobile-only horizontal scrollable dentist switcher for the Agenda.
 * Shows one dentist (per clinic) at a time as a pill with initials + first name.
 */
export function MobileDentistTabs({ activeKey, onSelect }: MobileDentistTabsProps) {
  const items: { key: string; name: string; initials: string; works: boolean }[] = [];
  mockClinics.forEach((clinic) => {
    getDentistsForClinic(clinic.id).forEach((d) => {
      const key = `${clinic.id}-${d.id}`;
      if (items.some((i) => i.key === key)) return;
      const works =
        clinicDentists.find((cd) => cd.clinicId === clinic.id && cd.dentistId === d.id)?.worksOnDemo ?? true;
      const cleaned = d.name.replace(/^Dr\.?\s*/i, '').replace(/^Dra\.?\s*/i, '');
      const firstName = cleaned.split(' ')[0] ?? d.name;
      items.push({ key, name: firstName, initials: getDentistInitials(d.name), works });
    });
  });

  return (
    <div
      className="flex gap-2 overflow-x-auto px-3 py-2 border-b border-border bg-card/40"
      style={{ scrollbarWidth: 'none' }}
    >
      {items.map((it) => {
        const active = it.key === activeKey;
        return (
          <button
            key={it.key}
            onClick={() => onSelect(it.key)}
            className={cn(
              'flex items-center gap-1.5 flex-shrink-0 pl-1 pr-3 py-1 rounded-full text-xs font-medium border transition-colors min-h-[36px]',
              active
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-muted',
              !it.works && !active && 'opacity-60'
            )}
          >
            <span
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                active ? 'bg-primary-foreground/20' : 'bg-muted text-foreground'
              )}
            >
              {it.initials}
            </span>
            <span className="truncate max-w-[80px]">{it.name}</span>
          </button>
        );
      })}
    </div>
  );
}