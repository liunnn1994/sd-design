import type { ThemeMode } from '../config-provider/theme-mode.js';

export function getLiquidGlassLogoFallbackTheme(
  element: HTMLElement | null,
  libraryMode: ThemeMode | undefined,
  preferredDark: boolean,
): ThemeMode {
  if (libraryMode) return libraryMode;
  const pageMode = element?.closest('[data-theme]')?.getAttribute('data-theme');
  if (pageMode === 'dark' || pageMode === 'light') return pageMode;
  const schemes = element
    ? getComputedStyle(element)
        .colorScheme.split(/\s+/)
        .filter((mode) => mode === 'light' || mode === 'dark')
    : [];
  return schemes.length === 1 ? (schemes[0] as ThemeMode) : preferredDark ? 'dark' : 'light';
}
