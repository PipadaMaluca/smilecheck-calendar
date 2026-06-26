import { CATEGORY_PILL_EMOJIS, ConsultationCategory, CATEGORY_COLORS, getCategoryBadgeStyle, getCategoryLabel } from '@/types/calendar';
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
  const pillStyle = getCategoryBadgeStyle(hex);
  const text = label ?? getCategoryLabel(t, category);
  const emoji = CATEGORY_PILL_EMOJIS[category];
  const sizeClass =
    size === 'sm'
      ? 'text-[11px] font-bold leading-none'
      : 'text-[11px] font-bold leading-none';
  const padStyle: CSSProperties =
    size === 'sm' ? { padding: '2px 6px' } : { padding: '2px 10px' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[2px] rounded-full whitespace-nowrap flex-shrink-0',
        sizeClass,
        className,
      )}
      style={{ ...pillStyle, ...padStyle, ...style }}
    >
      {children}
      {text}
      {emoji && <span style={{ fontSize: 'inherit', lineHeight: 1 }}>{emoji}</span>}
    </span>
  );
}
