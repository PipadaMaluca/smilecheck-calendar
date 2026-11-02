import { useTheme } from './useTheme';

/** Returns the icon-only logo path matching the current theme, for watermark/background usage. */
export function useWatermarkSrc() {
  const [theme] = useTheme();
  return theme === 'light' ? '/logos/logo_icon_light.webp' : '/logos/logo_icon_dark.webp';
}
