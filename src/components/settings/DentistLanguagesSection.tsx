import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isSpokenLanguage, sortedSpokenLanguages } from '@/lib/spokenLanguages';

/** Dentist picks the languages they speak (closed list, validated again by the server). */
export function DentistLanguagesSection() {
  const { t } = useTranslation();
  const { session, demoMode } = useAuth();
  const uid = session?.user.id;
  const [saved, setSaved] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (demoMode || !uid) return;
    supabase.from('dentists').select('spoken_languages').eq('id', uid).maybeSingle().then(({ data }) => {
      const langs = (data?.spoken_languages ?? []).filter(isSpokenLanguage);
      setSaved(langs); setSelected(langs);
    });
  }, [uid, demoMode]);

  if (demoMode || !uid || saved === null) return null;

  const toggle = (code: string) => setSelected(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  const dirty = [...selected].sort().join() !== [...saved].sort().join();

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('dentists').upsert({ id: uid, spoken_languages: selected }, { onConflict: 'id' });
    setSaving(false);
    if (error) { console.error('save languages failed:', error.message); toast.error(t('dentistLanguages.saveError')); return; }
    setSaved(selected);
    toast.success(t('dentistLanguages.saved'));
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle size="compact" className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-muted-foreground" aria-hidden />
          {t('dentistLanguages.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('dentistLanguages.hint')}</p>
        <div className="flex flex-wrap gap-2">
          {sortedSpokenLanguages().map(lang => {
            const on = selected.includes(lang.code);
            return (
              <Button key={lang.code} type="button" variant="outline" size="sm" aria-pressed={on} onClick={() => toggle(lang.code)}
                className={cn('h-auto px-2.5 py-1.5 rounded-full text-xs font-medium tap-target',
                  on ? 'bg-primary-solid text-primary-foreground hover:bg-primary-solid/90 border-primary'
                     : 'bg-secondary text-muted-foreground border-border hover:bg-accent')}>
                {lang.name}
              </Button>
            );
          })}
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={save} disabled={saving || !dirty}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            {t('dentistLanguages.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
