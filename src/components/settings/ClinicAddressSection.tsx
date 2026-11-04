import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type ClinicRow = {
  id: string; name: string; address: string | null; postal_code: string | null; city: string | null;
  country: string; latitude: number | null; geocode_status: string | null;
};

/** Clinic owner edits its address; coordinates are computed only by the `clinic-address` server function. */
export function ClinicAddressSection() {
  const { t } = useTranslation();
  const { session, demoMode } = useAuth();
  const [clinics, setClinics] = useState<ClinicRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ address: '', postalCode: '', city: '' });
  const [saving, setSaving] = useState(false);
  const uid = session?.user.id;

  useEffect(() => {
    if (demoMode || !uid) return;
    supabase.from('clinics')
      .select('id, name, address, postal_code, city, country, latitude, geocode_status')
      .eq('owner_profile_id', uid).order('name')
      .then(({ data }) => {
        const rows = (data ?? []) as ClinicRow[];
        setClinics(rows);
        if (rows[0]) pick(rows[0]);
      });
  }, [uid, demoMode]);

  const pick = (c: ClinicRow) => {
    setSelected(c.id);
    setForm({ address: c.address ?? '', postalCode: c.postal_code ?? '', city: c.city ?? '' });
  };

  if (demoMode || !uid || clinics.length === 0) return null;
  const current = clinics.find(c => c.id === selected)!;

  const save = async () => {
    if (!form.address.trim()) { toast.error(t('clinicAddress.required')); return; }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke('clinic-address', {
      body: { clinicId: current.id, address: form.address, postalCode: form.postalCode, city: form.city },
    });
    setSaving(false);
    if (error) {
      const details = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
      console.error('clinic-address failed:', details);
      toast.error(t('clinicAddress.saveError'));
      return;
    }
    const status = (data as { geocode?: string | null })?.geocode ?? null;
    setClinics(prev => prev.map(c => c.id === current.id
      ? { ...c, address: form.address, postal_code: form.postalCode || null, city: form.city || null, geocode_status: status }
      : c));
    toast.success(t('clinicAddress.saved'));
  };

  const dirty = form.address !== (current.address ?? '') || form.postalCode !== (current.postal_code ?? '') || form.city !== (current.city ?? '');
  const notFound = !dirty && current.geocode_status === 'not_found';
  const located = !dirty && current.geocode_status === 'ok';

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle size="compact" className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" aria-hidden />
          {t('clinicAddress.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {clinics.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {clinics.map(c => (
              <Button key={c.id} type="button" size="sm" variant={c.id === selected ? 'default' : 'outline'}
                aria-pressed={c.id === selected} onClick={() => pick(c)}>{c.name}</Button>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="clinic-street">{t('clinicAddress.street')}</Label>
          <Input id="clinic-street" value={form.address} maxLength={200} autoComplete="street-address"
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clinic-postal">{t('clinicAddress.postalCode')}</Label>
            <Input id="clinic-postal" value={form.postalCode} maxLength={20} autoComplete="postal-code"
              onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic-city">{t('clinicAddress.city')}</Label>
            <Input id="clinic-city" value={form.city} maxLength={100} autoComplete="address-level2"
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="clinic-country">{t('clinicAddress.country')}</Label>
          <Input id="clinic-country" value={t(`clinicAddress.countries.${current.country}`, current.country)} readOnly disabled />
          <p className="text-xs text-muted-foreground">{t('clinicAddress.countryHint')}</p>
        </div>
        {notFound && (
          <p role="status" className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-warning" aria-hidden />
            {t('clinicAddress.notFound')}
          </p>
        )}
        {located && <p className="text-xs text-muted-foreground">{t('clinicAddress.located')} · © OpenStreetMap contributors</p>}
        <p className="text-xs text-muted-foreground">{t('clinicAddress.privacy')}</p>
        <div className="flex justify-end">
          <Button type="button" onClick={save} disabled={saving || !dirty}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            {t('clinicAddress.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
