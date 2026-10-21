import chroma from 'chroma-js';
import { isNil } from 'es-toolkit/compat';

import { isGradientString, extractColorsFromGradient } from '../_utils/color.js';
import { isObject } from '../_utils/is.js';
import { isActivationKey } from '../_utils/keyboard.js';
import { TAG_COLORS, type TagColor, type TagProps, type TagTooltipOptions } from './types.js';
export interface TagFoundationState<
  Tooltip extends TagTooltipOptions = TagTooltipOptions,
  Size extends string = string,
> {
  readonly props: Omit<TagProps<Tooltip>, 'size' | 'ellipsisTooltip'> & {
    readonly ellipsisTooltip: boolean | Tooltip;
  };
  visible: boolean;
  checked: boolean;
  readonly size: Size;
  readonly isBuiltInColor: boolean | '' | undefined;
  readonly isCustomColor: boolean | '' | undefined;
  readonly resolvedColor: string | undefined;
  readonly isGradientColor: boolean;
  readonly resolvedBackgroundColor: string | undefined;
  readonly autoTextColor: string | undefined;
  readonly finalTextColor: string | undefined;
  readonly colorAlpha: number | undefined;
  readonly finalBackgroundAlpha: number;
  readonly computedChecked: boolean;
  readonly resolvedEllipsis: boolean;
  readonly shouldRenderEllipsis: boolean;
  readonly hasCustomTooltip: boolean;
  readonly hasDefaultSlot: boolean;
  readonly hasTooltipSlot: boolean;
}
export function createTagFoundation<Tooltip extends TagTooltipOptions, Size extends string>(
  state: TagFoundationState<Tooltip, Size>,
  callbacks: {
    updateVisible(value: boolean): void;
    updateChecked(value: boolean): void;
    close(event: MouseEvent | KeyboardEvent): void;
    check(value: boolean, event: MouseEvent | KeyboardEvent): void;
  },
) {
  const props = state.props;

  function getIsBuiltInColor() {
    return props.color && TAG_COLORS.includes(props.color as TagColor);
  }

  function getIsCustomColor() {
    return props.color && !TAG_COLORS.includes(props.color as TagColor);
  }

  function getResolvedColor() {
    if (!state.isCustomColor || isGradientString(props.color)) return props.color;
    try {
      const dom = document.createElement('div');
      dom.style.color = props.color as string;
      document.body.appendChild(dom);
      const computedColor = window.getComputedStyle(dom).color;
      document.body.removeChild(dom);
      return computedColor;
    } catch {
      return props.color;
    }
  }

  function getIsGradientColor() {
    return isGradientString(state.resolvedColor);
  }

  function getResolvedBackgroundColor() {
    if (state.isBuiltInColor) {
      return undefined;
    }
    return state.resolvedColor;
  }

  function getAutoTextColor() {
    // 如果是内置颜色，不需要自动计算
    if (state.isBuiltInColor) {
      return undefined;
    }
    if (!state.resolvedColor) {
      return undefined;
    }

    try {
      const rawColor = state.resolvedColor as string;
      // 获取背景色 chroma 对象
      const bg = state.isGradientColor
        ? chroma.average(extractColorsFromGradient(rawColor), 'rgb')
        : chroma(rawColor);

      // 与白色的对比度
      const contrastWhite = chroma.contrast(bg, 'white');

      // WCAG AA 标准对比度至少 4.5:1，背景深时使用白色文字
      if (contrastWhite >= 4.5) {
        return '#FFFFFF';
      }

      // 获取背景的 HSL
      const [h, s] = bg.hsl();

      // 背景是灰色系（饱和度低），直接返回深黑色
      if (isNaN(h) || s < 0.02) {
        return '#1D2129';
      }

      // 色相 H：冷色调(Blue/Cyan)向顺时针偏移
      let targetH = h;
      if (h >= 130 && h <= 200) {
        targetH += 10;
      }

      // 饱和度 S：保持较高
      const targetS = Math.min(s + 0.4, 0.9);

      // 亮度 L：从 0.5 向下寻找满足对比度 2.0 的值
      let bestL = 0.15;
      for (let curL = 0.5; curL >= 0.1; curL -= 0.01) {
        const tempColor = chroma.hsl(targetH, targetS, curL);
        if (chroma.contrast(bg, tempColor) >= 2.0) {
          bestL = curL;
          break;
        }
      }

      const colorfulDark = chroma.hsl(targetH, targetS, bestL);
      const contrastDark = chroma.contrast(bg, colorfulDark);

      // 白色对比度更好时用白色
      if (contrastWhite > contrastDark) {
        return '#FFFFFF';
      }

      // 兜底：对比度仍然极低时返回深黑色
      if (contrastDark < 2.0) {
        return '#1D2129';
      }

      return colorfulDark.css();
    } catch {
      return '#FFFFFF';
    }
  }

  function getFinalTextColor() {
    return props.textColor ?? state.autoTextColor;
  }

  function getColorAlpha() {
    if (!state.isCustomColor || !state.resolvedColor || state.isGradientColor) {
      return undefined;
    }
    try {
      const alpha = chroma(state.resolvedColor as string).alpha();
      return alpha < 1 ? alpha : undefined;
    } catch {
      return undefined;
    }
  }

  function getFinalBackgroundAlpha() {
    if (isNil(props.bordered)) {
      return 1;
    }
    if (!isNil(props.backgroundAlpha)) {
      return props.backgroundAlpha;
    }
    return isNil(state.colorAlpha) ? 0.8 : state.colorAlpha;
  }

  function getComputedVisible() {
    return props.visible ?? state.visible;
  }

  function getComputedChecked() {
    return props.checkable ? (props.checked ?? state.checked) : true;
  }

  function getMergedSize() {
    if (state.size === 'mini') {
      return 'small';
    }
    return state.size;
  }

  function getResolvedEllipsis() {
    return props.ellipsis ?? props.nowrap ?? true;
  }

  function getShouldRenderEllipsis() {
    return state.resolvedEllipsis && state.hasDefaultSlot;
  }

  function getHasLineClampEllipsis() {
    return state.shouldRenderEllipsis && props.ellipsisLineClamp !== undefined;
  }

  function getHasCustomTooltip() {
    return Boolean(props.tooltip) || state.hasTooltipSlot;
  }

  function getMergedEllipsisTooltip() {
    if (!state.hasCustomTooltip) {
      return props.ellipsisTooltip;
    }
    if (props.ellipsisTooltip === false) {
      return false;
    }
    const config: Partial<Tooltip> & TagTooltipOptions = isObject(props.ellipsisTooltip)
      ? { ...(props.ellipsisTooltip as Tooltip) }
      : {};
    config.always = true;
    return config;
  }

  function getTooltipBindings(): Partial<Omit<Tooltip, 'always'>> {
    if (!isObject(props.ellipsisTooltip)) return {};
    const { always: _always, ...rest } = props.ellipsisTooltip as Tooltip;
    return rest;
  }

  const handleClose = (ev: MouseEvent | KeyboardEvent) => {
    state.visible = false;
    callbacks.updateVisible(false);
    callbacks.close(ev);
  };

  const handleCloseKeydown = (ev: KeyboardEvent) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') {
      return;
    }
    ev.preventDefault();
    handleClose(ev);
  };

  const handleClick = (ev: MouseEvent | KeyboardEvent) => {
    if (props.checkable) {
      const newChecked = !state.computedChecked;
      state.checked = newChecked;
      callbacks.updateChecked(newChecked);
      callbacks.check(newChecked, ev);
    }
  };

  const handleTagKeydown = (ev: KeyboardEvent) => {
    if (!props.checkable) return;
    if (isActivationKey(ev)) {
      ev.preventDefault();
      handleClick(ev);
    }
  };

  function getBackgroundColor() {
    try {
      const bgColor = state.isGradientColor
        ? chroma.average(extractColorsFromGradient(state.resolvedColor as string), 'rgb')
        : chroma(state.resolvedColor as string);
      return bgColor.alpha(state.finalBackgroundAlpha).css();
    } catch {
      return state.resolvedColor;
    }
  }

  return {
    getIsBuiltInColor,
    getIsCustomColor,
    getResolvedColor,
    getIsGradientColor,
    getResolvedBackgroundColor,
    getAutoTextColor,
    getFinalTextColor,
    getColorAlpha,
    getFinalBackgroundAlpha,
    getComputedVisible,
    getComputedChecked,
    getMergedSize,
    getResolvedEllipsis,
    getShouldRenderEllipsis,
    getHasLineClampEllipsis,
    getHasCustomTooltip,
    getMergedEllipsisTooltip,
    getTooltipBindings,
    handleClose,
    handleCloseKeydown,
    handleClick,
    handleTagKeydown,
    getBackgroundColor,
  };
}
