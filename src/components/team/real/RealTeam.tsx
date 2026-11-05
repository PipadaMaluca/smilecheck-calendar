import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Check, Mail, Send, Trash2, User, Users, X, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PersonAvatar } from '@/components/ui/person-avatar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDirectory, WEEKDAYS, type WorkingHours } from '@/data/directorySource';
import {
  cancelInvite, fetchClinicInvites, fetchMyInvites, inviteDentist, inviteErrorKey,
  removeClinicMember, respondInvite, type ClinicInvite,
} from '@/data/directoryWrites';
import { weekdayLabels, formatDate } from '@/lib/formatters';

/** Short summary like "seg 09:00–13:00, 14:00–18:00 · ter …" in the active language. */
export function scheduleSummary(wh: WorkingHours | undefined): string {
  if (!wh) return '';
  const labels = weekdayLabels('short'); // Monday first
  return WEEKDAYS.filter((d) => (wh[d]?.length ?? 0) > 0)
    .map((d) => `${labels[WEEKDAYS.indexOf(d)]} ${wh[d]!.map(([a, b]) => `${a}–${b}`).join(', ')}`)
    .join(' · ');
}

export function DirectorySkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

/** Pending invites addressed to the signed-in dentist (accept / decline). */
export function DentistInvitesCard() {
  const { t } = useTranslation();
  const dir = useDirectory();
  const [invites, setInvites] = useState<ClinicInvite[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(() => { fetchMyInvites().then(setInvites).catch(() => setInvites([])); }, []);
  useEffect(load, [load]);
  if (!invites.length) return null;

  const answer = async (inv: ClinicInvite, accept: boolean) => {
    setBusy(inv.id);
    try {
      await respondInvite(inv.id, accept);
      toast.success(t(accept ? 'directory.invites.accepted' : 'directory.invites.declined'));
      load(); dir.refresh();
    } catch (e) { toast.error(t(inviteErrorKey(e))); }
    finally { setBusy(null); }
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle size="compact" className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" aria-hidden />{t('directory.invites.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {invites.map((inv) => (
          <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{inv.clinicName ?? t('common.clinic')}</p>
              <p className="text-xs text-muted-foreground">{t('directory.invites.sentOn', { date: formatDate(new Date(inv.createdAt)) })}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={busy === inv.id} onClick={() => answer(inv, false)}>
                <X className="w-3 h-3 mr-1" />{t('directory.invites.decline')}
              </Button>
              <Button size="sm" disabled={busy === inv.id} onClick={() => answer(inv, true)}>
                <Check className="w-3 h-3 mr-1" />{t('directory.invites.accept')}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Dentist leaves a clinic; the server refuses leaving the last one. */
export function LeaveClinicButton({ clinicId, clinicName }: { clinicId: string; clinicName: string }) {
  const { t } = useTranslation();
  const dir = useDirectory();
  const [open, setOpen] = useState(false);
  const member = dir.clinicDentists.find((m) => m.clinicId === clinicId && m.dentistId === dir.selfId);
  const isLast = dir.clinicDentists.filter((m) => m.dentistId === dir.selfId).length <= 1;
  if (!member?.memberId) return null;

  const leave = async () => {
    try {
      await removeClinicMember(member.memberId!);
      toast.success(t('directory.leave.done'));
      dir.refresh();
    } catch (e) { toast.error(t(inviteErrorKey(e))); }
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1 pt-1">
        <Button variant="ghost" size="sm" className="text-destructive" disabled={isLast} onClick={() => setOpen(true)}>
          <LogOut className="w-3 h-3 mr-1" />{t('directory.leave.button')}
        </Button>
        {isLast && <p className="text-xs text-muted-foreground">{t('directory.leave.lastClinic')}</p>}
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('directory.leave.title', { clinic: clinicName })}</AlertDialogTitle>
            <AlertDialogDescription>{t('directory.leave.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={leave}>{t('directory.leave.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Clinic owner: real team list, invite by email, pending invites, remove dentist. */
export function RealClinicTeam() {
  const { t } = useTranslation();
  const dir = useDirectory();
  const clinic = dir.clinics[0];
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [invites, setInvites] = useState<ClinicInvite[]>([]);
  const [removeFor, setRemoveFor] = useState<{ memberId: string; name: string } | null>(null);
  const clinicIds = dir.clinics.map((c) => c.id).join(',');
  const loadInvites = useCallback(() => {
    fetchClinicInvites(clinicIds ? clinicIds.split(',') : []).then(setInvites).catch(() => setInvites([]));
  }, [clinicIds]);
  useEffect(loadInvites, [loadInvites]);

  if (dir.loading) return <DirectorySkeleton />;
  if (!clinic) return <EmptyState icon={Building2} title={t('directory.team.noClinicTitle')} description={t('directory.team.noClinicDesc')} />;

  const members = dir.clinicDentists.filter((m) => m.clinicId === clinic.id);

  const send = async () => {
    setSending(true);
    try {
      await inviteDentist(clinic.id, email);
      toast.success(t('directory.team.inviteSent'));
      setEmail(''); loadInvites();
    } catch (e) { toast.error(t(inviteErrorKey(e))); }
    finally { setSending(false); }
  };
  const cancel = async (id: string) => {
    try { await cancelInvite(id); loadInvites(); } catch (e) { toast.error(t(inviteErrorKey(e))); }
  };
  const remove = async () => {
    if (!removeFor) return;
    try {
      await removeClinicMember(removeFor.memberId);
      toast.success(t('directory.team.removed'));
      dir.refresh();
    } catch (e) { toast.error(t(inviteErrorKey(e))); }
    setRemoveFor(null);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-2">
          <label htmlFor="invite-email" className="text-sm font-medium text-foreground">{t('team.inviteDentist')}</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input id="invite-email" type="email" placeholder={t('i18nA.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
            <Button className="gap-2 min-h-11" disabled={!email || sending} onClick={send}>
              <Send className="w-4 h-4" />{t('team.send')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t('directory.team.inviteHint')}</p>
        </CardContent>
      </Card>

      {members.length === 0 ? (
        <EmptyState icon={Users} title={t('directory.team.emptyTitle')} description={t('directory.team.emptyDesc')} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {members.map((m) => {
            const name = dir.dentists.find((d) => d.id === m.dentistId)?.name ?? '';
            const summary = scheduleSummary(m.workingHours);
            return (
              <Card key={m.memberId ?? m.dentistId} className="border-border/50">
                <CardContent className="p-3 flex items-start gap-3">
                  <PersonAvatar name={name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground">{summary || t('directory.hours.notSet')}</p>
                  </div>
                  {m.memberId && (
                    <Button variant="ghost" size="icon" aria-label={t('a11y.remove')} onClick={() => setRemoveFor({ memberId: m.memberId!, name })}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {invites.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">{t('team.pendingInvites')}</h3>
          <div className="space-y-2">
            {invites.map((inv) => (
              <Card key={inv.id} className="border-border/50">
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">{t('team.sent')} {formatDate(new Date(inv.createdAt))}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => cancel(inv.id)}>
                    <X className="w-3 h-3 mr-1" />{t('team.cancelInvite')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={!!removeFor} onOpenChange={(o) => !o && setRemoveFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('directory.team.removeTitle', { name: removeFor?.name ?? '' })}</AlertDialogTitle>
            <AlertDialogDescription>{t('directory.team.removeDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>{t('directory.team.removeConfirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** On sign-in, a real dentist with pending invites gets a toast pointing to the Team tab. */
export function ClinicInviteNotifier() {
  const { t } = useTranslation();
  const dir = useDirectory();
  useEffect(() => {
    if (dir.isDemo || !dir.selfId) return;
    let alive = true;
    fetchMyInvites().then((list) => {
      if (!alive || !list.length) return;
      toast(t('directory.invites.toast', { count: list.length }), {
        action: { label: t('directory.invites.view'), onClick: () => { window.location.href = '/app?tab=equipa'; } },
      });
    }).catch(() => {});
    return () => { alive = false; };
  }, [dir.isDemo, dir.selfId, t]);
  return null;
}
