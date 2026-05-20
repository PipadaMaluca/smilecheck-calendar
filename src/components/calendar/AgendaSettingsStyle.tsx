import { useMemo } from 'react';
import { useAgendaSettings } from '@/stores/agendaSettingsStore';
import { LEGEND_ORDER, CATEGORY_COLORS } from '@/types/calendar';

/**
 * Mount once near the top of an agenda view. Injects a <style> tag that
 * overrides category colors and density visually for ALL .appt-block cards
 * in real time. Also hides free slots / blocks based on toggles.
 */
export function AgendaSettingsStyle() {
  const settings = useAgendaSettings();

  const css = useMemo(() => {
    // Per-category color overrides — only emit when different from default.
    const catRules = LEGEND_ORDER.map((cat) => {
      const color = settings.categoryColors[cat] || CATEGORY_COLORS[cat].hex;
      const defaultColor = CATEGORY_COLORS[cat].hex;
      if (color === defaultColor) return '';
      // Override background tint + left border for any consultation card with this category.
      return `
        .appt-block[data-cat="${cat}"] {
          border-left-color: ${color} !important;
          background-color: ${color}59 !important;
        }
        .cat-swatch[data-cat="${cat}"] { background-color: ${color} !important; }
      `;
    }).join('\n');

    // Density rules — row heights themselves are handled by useSlotHeight().
    // Here we only tweak inner padding / font-size to match the new row height.
    const densityRules =
      settings.density === 'compact'
        ? `
          [data-agenda-grid-row] { min-height: 0 !important; }
          [data-agenda-grid-row] > div { min-height: 0 !important; }
          .appt-block { padding: 1px 3px !important; overflow: hidden !important; }
          .appt-block .text-\\[12px\\], .appt-block .text-\\[11px\\], .appt-block .font-bold {
            font-size: 10px !important; line-height: 1.15 !important;
          }
          .appt-block [data-notes] { display: none !important; }
          .appt-block [data-line="type-row"] { font-size: 9px !important; }
        `
        : settings.density === 'expanded'
        ? `
          .appt-block { padding: 6px 8px !important; }
          .appt-block .font-bold { font-size: 13px !important; line-height: 1.3 !important; }
          .appt-block [data-line="type-row"] { font-size: 12px !important; }
          .appt-block [data-notes] { font-size: 11px !important; display: inline !important; }
        `
        : '';

    // Toggle rules
    const hideFree = !settings.showFreeSlots
      ? `.appt-slot-free { visibility: hidden !important; }`
      : '';
    const hideBlocks = !settings.showBlocks
      ? `.appt-block-blocked, [data-slot-blocked="true"] { display: none !important; }`
      : '';

    return [catRules, densityRules, hideFree, hideBlocks].join('\n');
  }, [settings]);

  return <style data-agenda-settings dangerouslySetInnerHTML={{ __html: css }} />;
}