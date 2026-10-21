import { getElement, off, on } from '../_utils/dom.js';
import { isUndefined, isWindow } from '../_utils/is.js';
import { throttleByRaf } from '../_utils/throttle-by-raf.js';

export type AffixFixedStyle = {
  position?: 'fixed';
  top?: string;
  bottom?: string;
  width?: string;
};

export function getAffixPosition(input: {
  offsetTop?: number;
  offsetBottom?: number;
  wrapperRect: Pick<DOMRect, 'top' | 'bottom'>;
  targetRect: Pick<DOMRect, 'top' | 'bottom'>;
  wrapperWidth: number;
  wrapperHeight: number;
  contentHeight: number | undefined;
  fixed: boolean;
  viewportHeight: number;
}) {
  const { wrapperRect, targetRect, offsetTop, offsetBottom } = input;
  const placeholder = {
    width: `${input.wrapperWidth}px`,
    height: `${input.fixed && input.contentHeight !== undefined ? input.contentHeight : input.wrapperHeight}px`,
  };
  const top = isUndefined(offsetBottom);
  const fixed = top
    ? wrapperRect.top - targetRect.top < (offsetTop || 0)
    : targetRect.bottom - wrapperRect.bottom < (offsetBottom || 0);
  const style: AffixFixedStyle = fixed
    ? {
        position: 'fixed',
        ...(top
          ? { top: `${targetRect.top + (offsetTop || 0)}px` }
          : { bottom: `${input.viewportHeight - targetRect.bottom + (offsetBottom || 0)}px` }),
        width: placeholder.width,
      }
    : {};
  return { fixed, placeholder, style };
}

export function createAffix(adapter: {
  readonly props: {
    offsetTop: number;
    offsetBottom?: number;
    target?: string | HTMLElement | Window;
    targetContainer?: string | HTMLElement | Window;
  };
  readonly wrapper: HTMLElement | undefined;
  readonly content: HTMLElement | undefined;
  readonly fixed: boolean;
  target: HTMLElement | Window | undefined;
  setFixed(value: boolean): void;
  onChange(value: boolean): void;
  setPlaceholder(value: { width: string; height: string }): void;
  setStyle(value: AffixFixedStyle): void;
}) {
  const update = throttleByRaf(() => {
    if (!adapter.wrapper || !adapter.target) return;
    const { offsetTop, offsetBottom } = adapter.props;
    const wrapperRect = adapter.wrapper.getBoundingClientRect();
    const targetRect = isWindow(adapter.target)
      ? { top: 0, bottom: window.innerHeight }
      : adapter.target.getBoundingClientRect();
    const result = getAffixPosition({
      offsetTop,
      offsetBottom,
      wrapperRect,
      targetRect,
      wrapperWidth: adapter.wrapper.offsetWidth,
      wrapperHeight: adapter.wrapper.offsetHeight,
      contentHeight: adapter.fixed && adapter.content ? adapter.content.offsetHeight : undefined,
      fixed: adapter.fixed,
      viewportHeight: isUndefined(adapter.props.offsetBottom) ? 0 : window.innerHeight,
    });
    if (result.fixed !== adapter.fixed) {
      adapter.setFixed(result.fixed);
      adapter.onChange(result.fixed);
    }
    adapter.setPlaceholder(result.placeholder);
    adapter.setStyle(result.style);
  });
  function bind(element: HTMLElement | Window) {
    on(element, 'scroll', update);
    on(element, 'resize', update);
    return () => {
      off(element, 'scroll', update);
      off(element, 'resize', update);
    };
  }
  return {
    update,
    bindTarget() {
      const element =
        (adapter.props.target !== window &&
          getElement(adapter.props.target as string | HTMLElement)) ||
        window;
      adapter.target = element;
      return bind(element);
    },
    bindContainer() {
      if (!adapter.target) return undefined;
      const element =
        (adapter.props.targetContainer !== window &&
          getElement(adapter.props.targetContainer as string | HTMLElement)) ||
        window;
      return bind(element);
    },
    dispose() {
      update.cancel();
    },
  };
}
