import type { ScrollbarProps } from './types.js';

import { isObject } from '../_utils/is.js';
export const normalizeScrollbarStyle = (styleValue: unknown): Record<string, unknown> => {
  if (!styleValue) {
    return {} as Record<string, unknown>;
  }

  if (Array.isArray(styleValue)) {
    return styleValue.reduce<Record<string, unknown>>((accumulator, item) => {
      Object.assign(accumulator, normalizeScrollbarStyle(item));
      return accumulator;
    }, {});
  }

  if (typeof styleValue === 'string') {
    return {} as Record<string, unknown>;
  }

  return styleValue as Record<string, unknown>;
};

export const parseComputedPx = (value: string) => {
  if (!value || value === 'none') {
    return null;
  }

  const parsedValue = Number.parseFloat(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const normalizeUpdateOptions = (update: ScrollbarProps['updateOptions']) => {
  if (!update?.debounce || !isObject(update.debounce) || Array.isArray(update.debounce)) {
    return update;
  }

  return {
    ...update,
    debounce: {
      mutation: update.debounce.mutation ?? 0,
      resize: update.debounce.resize ?? 0,
      event: update.debounce.event ?? 0,
      env: update.debounce.env ?? 0,
    },
  };
};

export function getScrollbarOptions(
  props: ScrollbarProps & { hide: boolean; disableHorizontal: boolean; disableVertical: boolean },
  prefixCls: string,
) {
  const optionProps = props.overlayOptions ?? {};
  const isTrackType = props.type === 'track';
  let visibility: 'hidden' | 'visible' | 'auto' = 'auto';
  if (props.hide) {
    visibility = 'hidden';
  } else if (isTrackType) {
    visibility = 'visible';
  }
  const autoHide = props.hide || isTrackType ? 'never' : 'leave';

  const mergedOverflow = {
    x: 'scroll',
    y: 'scroll',
    ...optionProps.overflow,
    ...props.overflow,
  };

  if (props.disableHorizontal) {
    mergedOverflow.x = 'hidden';
  }
  if (props.disableVertical) {
    mergedOverflow.y = 'hidden';
  }

  return {
    ...optionProps,
    paddingAbsolute: props.paddingAbsolute ?? optionProps.paddingAbsolute,
    showNativeOverlaidScrollbars:
      props.showNativeOverlaidScrollbars ?? optionProps.showNativeOverlaidScrollbars,
    update: normalizeUpdateOptions(props.updateOptions ?? optionProps.update),
    overflow: mergedOverflow,
    scrollbars: {
      theme: props.type === 'track' ? `${prefixCls}-theme-track` : `${prefixCls}-theme-embed`,
      visibility,
      autoHide,
      autoHideSuspend: false,
      clickScroll: 'instant',
      ...optionProps.scrollbars,
      ...props.scrollbars,
    },
  };
}
