import { Ref, ref } from 'vue';

import {
  WATERMARK_THEME_TOKEN,
  getWatermarkTheme,
  handleWatermarkThemeMutations,
  type WatermarkTheme,
} from '@sdata/web-core/watermark/theme';

import { useMutationObserver } from './use-mutation-observer';

export const useTheme = (callback?: () => void) => {
  const theme: Ref<WatermarkTheme> = ref('light');

  const setTheme = (value: WatermarkTheme) => {
    theme.value = value;
  };

  const body = typeof document === 'undefined' ? undefined : document.body;
  useMutationObserver(
    body,
    (mutations) => handleWatermarkThemeMutations(mutations, setTheme, callback),
    {
      attributes: true,
      attributeFilter: [WATERMARK_THEME_TOKEN],
      subtree: false,
      childList: false,
      characterData: false,
    },
  );

  if (body) setTheme(getWatermarkTheme(body));

  return {
    theme,
    setTheme,
  };
};
