import { type Ref, ref, watch } from 'vue';

import { useMutationObserver } from '../watermark/hooks/use-mutation-observer';

const THEME_ATTR = 'sd-theme';

export type ThemeMode = 'light' | 'dark';

/**
 * Detects the current theme mode from the nearest ancestor with `[sd-theme]`
 * attribute (set by ConfigProvider / ThemeProvider via the `themeMode` prop).
 * Reactively updates when ThemeProvider changes the attribute.
 *
 * Returns `'light'` when no `[sd-theme]` ancestor is present, matching the
 * default theme mode of ConfigProvider.
 */
export function useThemeMode(target: Ref<HTMLElement | null>): Ref<ThemeMode> {
  const themeMode = ref<ThemeMode>('light');

  const resolveTheme = () => {
    if (typeof document === 'undefined') return;
    const el = target.value;
    if (!el) return;
    const ancestor = el.closest<HTMLElement>(`[${THEME_ATTR}]`);
    themeMode.value = ancestor?.getAttribute(THEME_ATTR) === 'dark' ? 'dark' : 'light';
  };

  // Resolve when the element mounts / changes.
  watch(target, resolveTheme, { immediate: true });

  // Observe any sd-theme attribute change in the subtree so both local
  // and ancestor ThemeProvider mutations are caught.
  useMutationObserver(
    typeof document !== 'undefined' ? document.body : undefined,
    (mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === THEME_ATTR) {
          resolveTheme();
          break;
        }
      }
    },
    { attributes: true, attributeFilter: [THEME_ATTR], subtree: true },
  );

  return themeMode;
}
