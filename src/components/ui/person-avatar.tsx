import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isAvatarEndpoint } from '@/lib/avatarImage';

/**
 * Photos from the `avatar` function are fetched with the viewer's session so
 * "contacts only" photos reach related people; a 404 falls back to initials.
 */
export function useAvatarSrc(photo?: string | null) {
  const stable = isAvatarEndpoint(photo);
  const [src, setSrc] = useState<string | null | undefined>(stable ? undefined : photo);
  useEffect(() => {
    if (!stable) { setSrc(photo); return; }
    let url: string | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) { if (!cancelled) setSrc(photo); return; }
        const res = await fetch(photo!, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { if (!cancelled) setSrc(null); return; }
        url = URL.createObjectURL(await res.blob());
        if (!cancelled) setSrc(url);
      } catch { if (!cancelled) setSrc(null); }
    })();
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [photo, stable]);
  return src;
}
import { cn } from '@/lib/utils';
import { getDentistInitials, getClinicInitials } from '@/lib/avatarUtils';

/** Soft background hues derived from the name — stable per person, theme-safe (tinted, never saturated). */
const HUES = [207, 190, 160, 265, 330, 25, 45, 230];
function hueFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return HUES[h % HUES.length];
}

const SIZES = { xs: 'w-8 h-8 text-xs', sm: 'w-10 h-10 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-lg', xl: 'w-24 h-24 text-2xl' } as const;
export type PersonAvatarSize = keyof typeof SIZES;

interface PersonAvatarProps {
  name: string;
  photo?: string | null;
  kind?: 'person' | 'clinic';
  size?: PersonAvatarSize;
  className?: string;
}

/** Single avatar used for dentists, patients and clinics: same size scale, ring and initials style. */
export function PersonAvatar({ name, photo, kind = 'person', size = 'sm', className }: PersonAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = useAvatarSrc(photo);
  useEffect(() => setFailed(false), [src]);
  const initials = kind === 'clinic' ? getClinicInitials(name) : getDentistInitials(name);
  const hue = hueFor(name);
  const base = cn('relative inline-flex shrink-0 items-center justify-center rounded-full ring-1 ring-border overflow-hidden font-semibold select-none', SIZES[size], className);
  if (src && !failed) {
    return <img src={src} alt={name} onError={() => setFailed(true)} className={cn(base, 'object-cover')} />;
  }
  return (
    <span
      role="img"
      aria-label={name}
      className={base}
      style={{ backgroundColor: `hsl(${hue} 70% 50% / 0.16)`, color: `hsl(${hue} 60% var(--avatar-text-l, 40%))` }}
    >
      {initials}
    </span>
  );
}
