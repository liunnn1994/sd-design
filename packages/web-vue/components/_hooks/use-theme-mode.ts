import type { ThemeMode } from '@sdata/web-core/config-provider/theme-mode';

import { type Ref, type MaybeRefOrGetter, ref, watch, toValue } from 'vue';

import { createThemeModeFoundation, THEME_ATTR } from '@sdata/web-core/config-provider/theme-mode';

import { useMutationObserver } from '../watermark/hooks/use-mutation-observer';
export type { ThemeMode } from '@sdata/web-core/config-provider/theme-mode';

/**
 * Detects the current theme mode from the nearest ancestor with `[sd-theme]`
 * attribute (set by ConfigProvider / ThemeProvider via the `themeMode` prop).
 * Reactively updates when ThemeProvider changes the attribute.
 *
 * Returns `'light'` when no `[sd-theme]` ancestor is present, matching the
 * default theme mode of ConfigProvider. Callers may supply a reactive fallback.
 */
export function useThemeMode<T extends HTMLElement = HTMLElement>(
  target: Ref<T | null>,
  fallback?: MaybeRefOrGetter<ThemeMode>,
): Ref<ThemeMode> {
  const themeMode = ref<ThemeMode>(fallback === undefined ? 'light' : toValue(fallback));

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
    get fallbackMode() {
      return fallback === undefined ? undefined : toValue(fallback);
    },
  });
  const { resolveTheme } = foundation;
  // Resolve when the element mounts / changes.
  watch(target, resolveTheme, { immediate: true });
  watch(() => (fallback === undefined ? undefined : toValue(fallback)), resolveTheme);

  // Observe any sd-theme attribute change in the subtree so both local
  // and ancestor ThemeProvider mutations are caught.
  useMutationObserver(
    typeof document !== 'undefined' ? document.documentElement : undefined,
    foundation.handleMutations,
    {
      attributes: true,
      attributeFilter: fallback === undefined ? [THEME_ATTR] : [THEME_ATTR, 'data-theme'],
      subtree: true,
    },
  );

  return themeMode;
}
