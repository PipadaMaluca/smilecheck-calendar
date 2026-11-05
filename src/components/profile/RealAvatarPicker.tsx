import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { toAvatarWebp, avatarStableUrl } from '@/lib/avatarImage';

/** Own photo / clinic logo: resized WebP in the owner's folder of `avatars`; only the owner writes. */
export function RealAvatarPicker({ isClinic }: { isClinic: boolean }) {
  const { t } = useTranslation();
  const { user, profile, patchProfile } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file?: File) => {
    if (!file || !user) return;
    setBusy(true);
    try {
      const blob = await toAvatarWebp(file);
      const version = Date.now();
      const path = `${user.id}/avatar-${version}.webp`;
      const up = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/webp', upsert: true });
      if (up.error) throw up.error;
      const url = avatarStableUrl(import.meta.env.VITE_SUPABASE_URL, user.id, version);
      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      if (error) throw error;
      patchProfile({ avatar_url: url });
      toast.success(t('editProfileReal.saved'));
    } catch (e) {
      const m = (e as { message?: string }).message ?? '';
      toast.error(m.startsWith('editProfileReal.') ? t(m) : t('editProfileReal.error'));
    } finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  const label = isClinic ? t('editProfile.changeLogo') : t('editProfile.changePhoto');
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <PersonAvatar name={profile?.full_name ?? ''} photo={profile?.avatar_url} kind={isClinic ? 'clinic' : 'person'} size="xl" className="h-20 w-20" />
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <button type="button" disabled={busy} aria-label={label} onClick={() => input.current?.click()}
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary-solid text-primary-foreground flex items-center justify-center shadow-lg">
          <Camera className="w-4 h-4" />
        </button>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
