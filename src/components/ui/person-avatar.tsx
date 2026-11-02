import { useState } from 'react';
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
  const initials = kind === 'clinic' ? getClinicInitials(name) : getDentistInitials(name);
  const hue = hueFor(name);
  const base = cn('relative inline-flex shrink-0 items-center justify-center rounded-full ring-1 ring-border overflow-hidden font-semibold select-none', SIZES[size], className);
  if (photo && !failed) {
    return <img src={photo} alt={name} onError={() => setFailed(true)} className={cn(base, 'object-cover')} />;
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
