export const THEME_ATTR = 'sd-theme';
export type ThemeMode = 'light' | 'dark';
export function createThemeModeFoundation(state: {
  readonly target: HTMLElement | null;
  mode: ThemeMode;
}) {
  const resolveTheme = () => {
    if (typeof document === 'undefined') return;
    const el = state.target;
    if (!el) return;
    const ancestor = el.closest<HTMLElement>(`[${THEME_ATTR}]`);
    state.mode = ancestor?.getAttribute(THEME_ATTR) === 'dark' ? 'dark' : 'light';
  };
  const handleMutations = (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === THEME_ATTR) {
        resolveTheme();
        break;
      }
    }
  };
  return { resolveTheme, handleMutations };
}
