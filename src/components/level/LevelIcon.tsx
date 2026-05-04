import { Cylinder, Shield, ShieldCheck, Award, Gem, Diamond, Crown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Single source of truth for level → Lucide icon + theme color class. */
export const LEVEL_ICON_MAP: Record<string, { Icon: LucideIcon; colorClass: string }> = {
  lata:       { Icon: Cylinder,    colorClass: 'text-slate-400' },
  bronze:     { Icon: Shield,      colorClass: 'text-amber-700' },
  prata:      { Icon: ShieldCheck, colorClass: 'text-slate-300' },
  ouro:       { Icon: Award,       colorClass: 'text-amber-400' },
  platina:    { Icon: Gem,         colorClass: 'text-purple-400' },
  diamante:   { Icon: Diamond,     colorClass: 'text-blue-400' },
  adamantino: { Icon: Crown,       colorClass: 'text-amber-300' },
};

interface LevelIconProps {
  levelKey: string;
  /** Pixel size — pick a context-appropriate value: 16 for pills, 20 for cards, 32+ for headers. */
  size?: number;
  className?: string;
  /** If true, ignore the level's preferred color and inherit currentColor. */
  inheritColor?: boolean;
}

export function LevelIcon({ levelKey, size = 20, className, inheritColor }: LevelIconProps) {
  const cfg = LEVEL_ICON_MAP[levelKey] ?? LEVEL_ICON_MAP.lata;
  const { Icon, colorClass } = cfg;
  return <Icon size={size} strokeWidth={2} className={cn(!inheritColor && colorClass, className)} aria-hidden />;
}