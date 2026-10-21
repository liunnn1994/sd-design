import type { ThemeMode } from '@sdata/web-core/config-provider/theme-mode';

import { type Ref, ref, watch } from 'vue';

import { createThemeModeFoundation, THEME_ATTR } from '@sdata/web-core/config-provider/theme-mode';

import { useMutationObserver } from '../watermark/hooks/use-mutation-observer';
export type { ThemeMode } from '@sdata/web-core/config-provider/theme-mode';

/**
 * Detects the current theme mode from the nearest ancestor with `[sd-theme]`
 * attribute (set by ConfigProvider / ThemeProvider via the `themeMode` prop).
 * Reactively updates when ThemeProvider changes the attribute.
 *
 * Returns `'light'` when no `[sd-theme]` ancestor is present, matching the
 * default theme mode of ConfigProvider.
 */
export function useThemeMode<T extends HTMLElement = HTMLElement>(
  target: Ref<T | null>,
): Ref<ThemeMode> {
  const themeMode = ref<ThemeMode>('light');

  const foundation = createThemeModeFoundation({
    get target() {
      return target.value;
    },
    get mode() {
      return themeMode.value;
    },
    set mode(value) {
      themeMode.value = value;
    },
  });
  const { resolveTheme } = foundation;
  // Resolve when the element mounts / changes.
  watch(target, resolveTheme, { immediate: true });

  // Observe any sd-theme attribute change in the subtree so both local
  // and ancestor ThemeProvider mutations are caught.
  useMutationObserver(
    typeof document !== 'undefined' ? document.documentElement : undefined,
    foundation.handleMutations,
    { attributes: true, attributeFilter: [THEME_ATTR], subtree: true },
  );

  return themeMode;
}
