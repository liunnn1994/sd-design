export const WATERMARK_THEME_TOKEN = 'sd-theme';
export type WatermarkTheme = 'dark' | 'light';

export const getWatermarkTheme = (element: HTMLElement): WatermarkTheme =>
  element.getAttribute(WATERMARK_THEME_TOKEN) === 'dark' ? 'dark' : 'light';

export function handleWatermarkThemeMutations(
  mutations: MutationRecord[],
  setTheme: (theme: WatermarkTheme) => void,
  callback?: () => void,
) {
  for (const mutation of mutations) {
    if (mutation.type === 'attributes' && mutation.attributeName === WATERMARK_THEME_TOKEN) {
      setTheme(getWatermarkTheme(mutation.target as HTMLElement));
      callback?.();
      break;
    }
  }
}
