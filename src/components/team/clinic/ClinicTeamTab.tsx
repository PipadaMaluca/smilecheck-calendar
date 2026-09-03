import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Users, Send, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TeamDentistCard } from '../shared/TeamDentistCard';
import { PermissionsModal } from '../shared/PermissionsModal';
import { RemoveModal } from '../shared/RemoveModal';
import { InviteModal } from '../shared/InviteModal';
import { clinicTeamMembers, pendingInvites } from '../shared/teamMockData';

type FilterType = 'all' | 'active' | 'paused' | 'pending';

interface ClinicTeamTabProps {
  onSwitchToAvailability?: (dentistId: string) => void;
}

export function ClinicTeamTab({ onSwitchToAvailability }: ClinicTeamTabProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [permissionsFor, setPermissionsFor] = useState<string | null>(null);
  const [removeFor, setRemoveFor] = useState<string | null>(null);

  const allMembers = [...clinicTeamMembers, ...pendingInvites.map((i) => ({
    id: i.id, name: i.name, specialty: '', rating: 0, level: 'Lata',
    consultationsThisMonth: 0, status: 'pending' as const,
  }))];

  const filtered = allMembers
    .filter((d) => filter === 'all' || d.status === filter)
    .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.rating - a.rating);

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('team.all') },
    { key: 'active', label: t('team.activePlural') },
    { key: 'paused', label: t('team.pausedPlural') },
    { key: 'pending', label: t('team.pendingPlural') },
  ];

  const permDentist = clinicTeamMembers.find((d) => d.id === permissionsFor);
  const removeDentist = clinicTeamMembers.find((d) => d.id === removeFor);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('team.searchTeam')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button className="gap-2" onClick={() => setInviteOpen(true)}>
          <Users className="w-4 h-4" />
          {t('team.inviteDentist')}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((f) => (
          <Badge key={f.key} variant={filter === f.key ? 'default' : 'outline'} className="cursor-pointer transition-colors press" onClick={() => setFilter(f.key)}>
            {f.label}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((d) => (
          <TeamDentistCard key={d.id} dentist={d as any} showActions={d.status !== 'pending'}
            onEditSchedule={() => onSwitchToAvailability?.(d.id)}
            onManagePermissions={() => setPermissionsFor(d.id)}
            onRemove={() => setRemoveFor(d.id)} />
        ))}
      </div>

      {pendingInvites.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">{t('team.pendingInvites')}</h3>
            {pendingInvites.map((inv) => (
              <Card key={inv.id} className="border-border/50">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{inv.name}</p>
                    <p className="text-xs text-muted-foreground">{inv.email} · {t('team.sent')} {inv.sentAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm"><X className="w-3 h-3 mr-1" />{t('team.cancelInvite')}</Button>
                    <Button variant="outline" size="sm"><Send className="w-3 h-3 mr-1" />{t('team.resend')}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Separator />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('team.totalDentists'), value: clinicTeamMembers.length.toString() },
          { label: t('team.consultationsThisMonth'), value: clinicTeamMembers.reduce((s, d) => s + d.consultationsThisMonth, 0).toString() },
          { label: t('team.confirmationRate'), value: `${Math.round(clinicTeamMembers.reduce((s, d) => s + (d.confirmationRate || 0), 0) / clinicTeamMembers.length)}%` },
          { label: t('team.averageRating'), value: `${(clinicTeamMembers.reduce((s, d) => s + d.rating, 0) / clinicTeamMembers.length).toFixed(1)}` },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      {permDentist && <PermissionsModal open={!!permissionsFor} onClose={() => setPermissionsFor(null)} dentistName={permDentist.name} />}
      {removeDentist && <RemoveModal open={!!removeFor} onClose={() => setRemoveFor(null)} dentistName={removeDentist.name} otherDentists={clinicTeamMembers.filter((d) => d.id !== removeFor).map((d) => ({ id: d.id, name: d.name }))} />}
    </div>
  );
}
