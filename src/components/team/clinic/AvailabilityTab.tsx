import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvailabilitySection } from '../shared/AvailabilitySection';
import { clinicTeamMembers } from '../shared/teamMockData';

interface AvailabilityTabProps {
  preselectedDentistId?: string;
}

export function AvailabilityTab({ preselectedDentistId }: AvailabilityTabProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState(preselectedDentistId || clinicTeamMembers[0]?.id || '');

  const selected = clinicTeamMembers.find((d) => d.id === selectedId);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">{t('team.selectDentist')}</label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {clinicTeamMembers.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected && <AvailabilitySection dentistName={selected.name} />}
    </div>
  );
}
