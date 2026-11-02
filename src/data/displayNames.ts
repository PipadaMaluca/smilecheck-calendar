import { supabase } from '@/integrations/supabase/client';

/**
 * Display names for a mix of patients and professionals.
 * Professionals come from the public-safe `professional_public_profiles` view
 * (no phone/email/birth date); anyone else falls back to `profiles` under RLS.
 */
export async function fetchDisplayNames(ids: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const names = new Map<string, string>();
  if (!unique.length) return names;
  const { data: pros } = await supabase.from('professional_public_profiles').select('id, full_name').in('id', unique);
  for (const p of pros ?? []) if (p.id && p.full_name) names.set(p.id, p.full_name);
  const rest = unique.filter((id) => !names.has(id));
  if (rest.length) {
    const { data } = await supabase.from('profiles').select('id, full_name').in('id', rest);
    for (const p of data ?? []) if (p.full_name) names.set(p.id, p.full_name);
  }
  return names;
}
