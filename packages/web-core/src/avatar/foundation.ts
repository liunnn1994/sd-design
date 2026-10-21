import type { AvatarGroupContext, AvatarShape, AvatarTriggerType, AvatarStyle } from './types.js';

import { isNumber } from '../_utils/is.js';
export interface AvatarFoundationState {
  readonly props: {
    readonly shape: AvatarShape;
    readonly size?: number | undefined;
    readonly autoFixFontSize: boolean;
    readonly imageUrl?: string | undefined;
  };
  readonly group: AvatarGroupContext | undefined;
  readonly itemElement: HTMLDivElement | undefined;
  readonly wrapperElement: HTMLElement | undefined;
  readonly mergedSize: number | undefined;
  readonly mergedAutoFixFontSize: boolean;
  readonly isImage: boolean;
  readonly index: number;
  readonly rtl: boolean;
  hasError: boolean;
  isLoaded: boolean;
}
export const getAvatarTriggerIconStyle = ({
  triggerType,
  inlineStyle = {},
  triggerIconStyle = {},
}: {
  triggerType: AvatarTriggerType;
  inlineStyle?: AvatarStyle | undefined;
  triggerIconStyle?: AvatarStyle | undefined;
}): AvatarStyle => {
  let addon: AvatarStyle = {};
  if (
    triggerType === 'button' &&
    (!triggerIconStyle || (triggerIconStyle && !triggerIconStyle.color)) &&
    inlineStyle &&
    inlineStyle.backgroundColor
  ) {
    addon = { color: inlineStyle.backgroundColor };
  }
  return {
    ...triggerIconStyle,
    ...addon,
  };
};

export function createAvatarFoundation(
  state: AvatarFoundationState,
  callbacks: {
    afterRender(task: () => void): void;
    click(event: MouseEvent): void;
    load(): void;
    error(): void;
  },
) {
  const props = state.props;

  function getMergedShape() {
    return state.group?.shape ?? props.shape;
  }

  function getMergedSize() {
    return state.group?.size ?? props.size;
  }

  function getMergedAutoFixFontSize() {
    return state.group?.autoFixFontSize ?? props.autoFixFontSize;
  }

  function resetImageState() {
    state.hasError = false;
    state.isLoaded = false;
  }

  function getOuterStyle() {
    const style: AvatarStyle = isNumber(state.mergedSize)
      ? {
          width: `${state.mergedSize}px`,
          height: `${state.mergedSize}px`,
          fontSize: `${state.mergedSize / 2}px`,
        }
      : {};
    if (state.group) {
      style.zIndex = state.group.zIndexAscend ? state.index + 1 : state.group.total - state.index;
      const margin = state.index !== 0 ? `-${(state.mergedSize ?? 40) / 4}px` : '0';
      style.marginLeft = state.rtl ? '0' : margin;
      style.marginRight = state.rtl ? margin : undefined;
    }

    return style;
  }

  const autoFixFontSizeHandler = () => {
    callbacks.afterRender(() => {
      if (!state.wrapperElement || !state.itemElement) {
        return;
      }
      if (state.isImage || props.imageUrl || !state.mergedAutoFixFontSize) {
        state.wrapperElement.style.transform = '';
        return;
      }
      const textWidth = state.wrapperElement.clientWidth;
      const avatarWidth = state.mergedSize ?? state.itemElement.offsetWidth;

      const scale = avatarWidth / (textWidth + 8);
      state.wrapperElement.style.transform =
        avatarWidth && scale < 1 ? `scale(${scale}) translateX(-50%)` : '';
    });
  };

  const onClick = (e: MouseEvent) => {
    callbacks.click(e);
  };

  const handleResize = () => {
    if (state.mergedAutoFixFontSize) {
      autoFixFontSizeHandler();
    }
  };

  const handleImgLoad = () => {
    state.isLoaded = true;
    callbacks.load();
  };

  const handleImgError = () => {
    state.hasError = true;
    callbacks.error();
  };

  return {
    getMergedShape,
    getMergedSize,
    getMergedAutoFixFontSize,
    getOuterStyle,
    autoFixFontSizeHandler,
    onClick,
    handleResize,
    handleImgLoad,
    handleImgError,
    resetImageState,
  };
}
