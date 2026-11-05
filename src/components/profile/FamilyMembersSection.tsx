import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDirectory, type DirectoryFamilyMember } from '@/data/directorySource';
import { addFamilyMember, removeFamilyMember, updateFamilyMember, type FamilyInput } from '@/data/directoryWrites';
import { formatDate } from '@/lib/formatters';

const EMPTY: FamilyInput = { name: '', relation: '', dateOfBirth: null };

function Editor({ value, onChange, onSave, onCancel, saving }: {
  value: FamilyInput; onChange: (v: FamilyInput) => void; onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <Input placeholder={t('editProfile.name')} aria-label={t('editProfile.name')} value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} className="flex-1" />
      <div className="flex gap-2">
        <Input placeholder={t('editProfile.relation')} aria-label={t('editProfile.relation')} value={value.relation} onChange={(e) => onChange({ ...value, relation: e.target.value })} className="flex-1 sm:w-28" />
        <Input type="date" aria-label={t('directory.family.birthDate')} value={value.dateOfBirth ?? ''} onChange={(e) => onChange({ ...value, dateOfBirth: e.target.value || null })} className="w-40" />
        <Button variant="ghost" size="icon" aria-label={t('a11y.save')} disabled={!value.name.trim() || saving} onClick={onSave}><Check className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" aria-label={t('common.cancel')} onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

/** Real patient accounts: family members stored in the database (RLS: account holder only). */
export function FamilyMembersSection() {
  const { t } = useTranslation();
  const dir = useDirectory();
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<FamilyInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [removeFor, setRemoveFor] = useState<DirectoryFamilyMember | null>(null);
  const others = dir.familyMembers.filter((m) => !m.self);

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') await addFamilyMember(draft);
      else if (editing) await updateFamilyMember(editing, draft);
      setEditing(null); setDraft(EMPTY); dir.refresh();
      toast.success(t('directory.family.saved'));
    } catch { toast.error(t('family.saveError')); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!removeFor) return;
    try { await removeFamilyMember(removeFor.id); dir.refresh(); } catch { toast.error(t('family.saveError')); }
    setRemoveFor(null);
  };

  if (dir.loading) return <Skeleton className="h-16 w-full rounded-xl" />;

  return (
    <div className="space-y-3">
      {others.length === 0 && editing !== 'new' && <p className="text-sm text-muted-foreground">{t('directory.family.empty')}</p>}
      {others.map((m) => editing === m.id ? (
        <Editor key={m.id} value={draft} onChange={setDraft} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
      ) : (
        <div key={m.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
            <p className="text-xs text-muted-foreground">
              {[m.relation, m.dateOfBirth ? formatDate(new Date(`${m.dateOfBirth}T00:00:00`)) : null].filter(Boolean).join(' · ')}
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label={t('a11y.edit')} onClick={() => { setEditing(m.id); setDraft({ name: m.name, relation: m.relation, dateOfBirth: m.dateOfBirth ?? null }); }}><Pencil className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" aria-label={t('a11y.remove')} onClick={() => setRemoveFor(m)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      ))}
      {editing === 'new' && <Editor value={draft} onChange={setDraft} onSave={save} onCancel={() => setEditing(null)} saving={saving} />}
      {editing !== 'new' && (
        <Button variant="outline" size="sm" onClick={() => { setEditing('new'); setDraft(EMPTY); }} className="gap-1"><Plus className="w-3 h-3" /> {t('editProfile.addFamily')}</Button>
      )}
      <AlertDialog open={!!removeFor} onOpenChange={(o) => !o && setRemoveFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('directory.family.removeTitle', { name: removeFor?.name ?? '' })}</AlertDialogTitle>
            <AlertDialogDescription>{t('directory.family.removeDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>{t('a11y.remove')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
