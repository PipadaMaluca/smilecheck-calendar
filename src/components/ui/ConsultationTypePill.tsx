import { CATEGORY_PILL_EMOJIS, ConsultationCategory, CATEGORY_COLORS, getCategoryLabel, getCategoryDotStyle } from '@/types/calendar';
import { Glyph } from '@/components/ui/glyph';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { CSSProperties, ReactNode } from 'react';

interface ConsultationTypePillProps {
  category?: ConsultationCategory;
  /** Optional override label (e.g. short label on dense grids) */
  label?: string;
  /** Visual size. 'md' = standard (11px / 2px 10px). 'sm' = compact for dense grid cells. */
  size?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Standard consultation-type pill used across the entire app.
 * Solid category color background, white text (dark text on yellow primeira_consulta),
 * rounded-full, 11px bold, 2px 10px padding. No border.
 * Use `size="sm"` only inside very dense calendar grid blocks where 11px would overflow.
 */
export function ConsultationTypePill({
  category,
  label,
  size = 'md',
  className,
  style,
  children,
}: ConsultationTypePillProps) {
  const { t } = useTranslation();
  if (!category) return null;
  const hex = CATEGORY_COLORS[category].hex;
  const text = label ?? getCategoryLabel(t, category);
  const emoji = CATEGORY_PILL_EMOJIS[category];
  const sizeClass = 'text-[11px] font-semibold leading-none';
  const toneClass =
    category === 'urgencia'
      ? 'text-destructive'
      : category === 'teleconsulta'
        ? 'text-warning'
        : 'text-muted-foreground';
  const padStyle: CSSProperties = size === 'sm' ? { padding: 0 } : { padding: 0 };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0',
        sizeClass,
        toneClass,
        className,
      )}
      style={{ ...padStyle, ...style }}
    >
      {children}
      <span style={getCategoryDotStyle(hex)} />
      {text}
      {emoji && <Glyph emoji={emoji} className="w-3.5 h-3.5" />}
    </span>
  );
}
