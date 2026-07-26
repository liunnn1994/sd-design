import type { CSSProperties, MaybeRefOrGetter, Ref } from 'vue';
import { computed, nextTick, onMounted, onUpdated, ref, toValue, watch } from 'vue';

import { measureNaturalWidth, prepareWithSegments } from '@chenglou/pretext';

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

function getFont(style: CSSStyleDeclaration) {
  if (style.font) {
    return style.font;
  }

  return [
    style.fontStyle,
    style.fontVariant,
    style.fontWeight,
    style.fontStretch,
    style.fontSize,
    style.fontFamily,
  ]
    .filter(Boolean)
    .join(' ');
}

export function useFitWidth(options: UseFitWidthOptions) {
  const fitWidthCssVar = getFitWidthCssVar(getPrefixCls());
  const fitWidthValue = `var(${fitWidthCssVar})`;
  const measuredWidth = ref(toValue(options.fallbackWidth));
  let measurementKey = '';

  const measure = () => {
    if (!toValue(options.fitWidth)) {
      return;
    }

    const text = toValue(options.text);
    const target = options.target.value;
    if (!text || !target || typeof window === 'undefined') {
      measuredWidth.value = toValue(options.fallbackWidth);
      measurementKey = '';
      return;
    }

    const style = window.getComputedStyle(target);
    const font = getFont(style);
    const parsedLetterSpacing = Number.parseFloat(style.letterSpacing);
    const letterSpacing = Number.isFinite(parsedLetterSpacing) ? parsedLetterSpacing : 0;
    const nextMeasurementKey = [
      text,
      font,
      letterSpacing,
      options.whiteSpace,
      options.additionalWidth,
    ].join('\0');

    if (nextMeasurementKey === measurementKey) {
      return;
    }

    const prepared = prepareWithSegments(text, font, {
      whiteSpace: options.whiteSpace,
      letterSpacing,
    });
    measuredWidth.value = `${measureNaturalWidth(prepared) + (options.additionalWidth ?? 0)}px`;
    measurementKey = nextMeasurementKey;
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
        measurementKey = '';
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
