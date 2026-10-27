export const THEME_ATTR = 'sd-theme';
export type ThemeMode = 'light' | 'dark';
export function createThemeModeFoundation(state: {
  readonly target: HTMLElement | null;
  mode: ThemeMode;
  readonly fallbackMode?: ThemeMode;
}) {
  const resolveTheme = () => {
    if (typeof document === 'undefined') return;
    const el = state.target;
    if (!el) return;
    const ancestor = el.closest<HTMLElement>(`[${THEME_ATTR}]`);
    state.mode = ancestor
      ? ancestor.getAttribute(THEME_ATTR) === 'dark'
        ? 'dark'
        : 'light'
      : (state.fallbackMode ?? 'light');
  };
  const handleMutations = (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        (mutation.attributeName === THEME_ATTR ||
          (state.fallbackMode !== undefined && mutation.attributeName === 'data-theme'))
      ) {
        resolveTheme();
        break;
      }
    }
  };
  return { resolveTheme, handleMutations };
}
