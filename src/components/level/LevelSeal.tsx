import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';
import { LevelIcon } from '@/components/level/LevelIcon';

/** Seal text per role per level (Ouro+). Adamantino has shimmer. */
const SEAL_KEYS: Record<UserRole, Record<string, string>> = {
  patient: {
    ouro: 'level.seal.patient.loyal',
    platina: 'level.seal.patient.exemplary',
    diamante: 'level.seal.patient.diamond',
    adamantino: 'level.seal.patient.diamond',
  },
  dentist: {
    ouro: 'level.seal.dentist.recommended',
    platina: 'level.seal.dentist.top',
    diamante: 'level.seal.dentist.diamond',
    adamantino: 'level.seal.dentist.diamond',
  },
  clinic: {
    ouro: 'level.seal.clinic.recommended',
    platina: 'level.seal.clinic.top',
    diamante: 'level.seal.clinic.diamond',
    adamantino: 'level.seal.clinic.diamond',
  },
};

const SEAL_STYLES: Record<string, string> = {
  ouro: 'bg-amber-400/20 text-amber-500 border-amber-400/40',
  platina: 'bg-purple-400/20 text-purple-300 border-purple-400/40',
  diamante: 'bg-blue-400/20 text-blue-300 border-blue-400/40',
  adamantino: 'bg-amber-300/30 text-amber-200 border-amber-300/60 level-frame-shimmer',
};

interface LevelSealProps {
  role: UserRole;
  levelKey: string;
  className?: string;
}

export function LevelSeal({ role, levelKey, className }: LevelSealProps) {
  const { t } = useTranslation();
  const key = SEAL_KEYS[role]?.[levelKey];
  if (!key) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
        SEAL_STYLES[levelKey],
        className,
      )}
    >
      <LevelIcon levelKey={levelKey} size={12} inheritColor className="shrink-0" /> {t(key)}
    </span>
  );
}