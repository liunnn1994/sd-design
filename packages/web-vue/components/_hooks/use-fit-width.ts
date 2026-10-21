import type { CSSProperties, MaybeRefOrGetter, Ref } from 'vue';
import { computed, nextTick, onMounted, onUpdated, ref, toValue, watch } from 'vue';

import { createFitWidthMeasurer } from '@sdata/web-core/text/fit-width';

import { getPrefixCls } from '../_utils/global-config';

type FitWidthElement = HTMLInputElement | HTMLTextAreaElement;

export interface FitWidthProps {
  /**
   * @zh 宽度是否适应文字内容
   * @en Whether the width adapts to the text content
   */
  fitWidth?: boolean;
  /**
   * @zh 最大宽度是否限制为父容器宽度
   * @en Whether the maximum width is limited to the parent container width
   */
  maxWFull?: boolean;
}

interface UseFitWidthOptions {
  fitWidth: MaybeRefOrGetter<boolean | undefined>;
  text: MaybeRefOrGetter<string | undefined>;
  fallbackWidth: MaybeRefOrGetter<string>;
  target: Ref<FitWidthElement | undefined>;
  whiteSpace?: 'normal' | 'pre-wrap';
  additionalWidth?: number;
}

export const getFitWidthCssVar = (prefix: string) => `--${prefix}-fit-width`;

export function useFitWidth(options: UseFitWidthOptions) {
  const fitWidthCssVar = getFitWidthCssVar(getPrefixCls());
  const fitWidthValue = `var(${fitWidthCssVar})`;
  const measuredWidth = ref(toValue(options.fallbackWidth));
  const measurer = createFitWidthMeasurer();

  const measure = () => {
    if (!toValue(options.fitWidth)) {
      return;
    }

    const text = toValue(options.text);
    const target = options.target.value;
    if (!text || !target || typeof window === 'undefined') {
      measuredWidth.value = toValue(options.fallbackWidth);
      measurer.invalidate();
      return;
    }

    const width = measurer.measure(text, window.getComputedStyle(target), options);
    measuredWidth.value = `${width}px`;
  };

  const scheduleMeasure = () => {
    void nextTick(measure);
  };

  watch(
    [
      () => toValue(options.fitWidth),
      () => toValue(options.text),
      () => toValue(options.fallbackWidth),
      options.target,
    ],
    scheduleMeasure,
    { immediate: true },
  );
  onMounted(() => {
    measure();
    if (typeof document !== 'undefined' && document.fonts) {
      void document.fonts.ready.then(() => {
        measurer.invalidate();
        measure();
      });
    }
  });
  onUpdated(measure);

  const fitWidthStyle = computed<CSSProperties>(() =>
    toValue(options.fitWidth) ? ({ [fitWidthCssVar]: measuredWidth.value } as CSSProperties) : {},
  );

  return {
    fitWidthCssVar,
    fitWidthStyle,
    fitWidthValue,
    measure,
  };
}
