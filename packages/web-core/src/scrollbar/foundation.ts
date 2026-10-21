import type {
  EventListenerArgs,
  EventListeners,
  OverlayScrollbars as OverlayScrollbarsInstance,
} from 'overlayscrollbars';

import type { ScrollbarProps, ScrollbarEventListener, ScrollbarPlugin } from './types.js';

import { isObject } from '../_utils/is.js';
import { OverlayScrollbars } from './engine.js';
import { parseComputedPx, getScrollbarOptions } from './options.js';

export function createScrollbar(adapter: {
  readonly props: ScrollbarProps & {
    hide: boolean;
    disableHorizontal: boolean;
    disableVertical: boolean;
  };
  readonly outer: HTMLElement | undefined;
  readonly container: HTMLElement | undefined;
  readonly normalizedStyle: Record<string, unknown>;
  readonly mergedOptions: ReturnType<typeof getScrollbarOptions>;
  instance: OverlayScrollbarsInstance | null;
  removeListeners: (() => void) | null;
  autoSizeStyle: Record<string, string>;
  readComputedStyle(element: HTMLElement): Pick<CSSStyleDeclaration, 'maxHeight' | 'maxWidth'>;
  scroll(event: Event): void;
  createInstance?: typeof OverlayScrollbars;
}) {
  const updateAutoSizeStyle = () => {
    const outerElement = adapter.outer;
    const containerElement = adapter.container;

    if (!outerElement || !containerElement) {
      adapter.autoSizeStyle = {};
      return;
    }

    const scrollElement = getScrollOffsetElement() ?? containerElement;
    const nextStyle: Record<string, string> = {};
    const styleObject = adapter.normalizedStyle;
    const computedStyle = adapter.readComputedStyle(outerElement);
    const hasExplicitHeight = 'height' in styleObject || 'blockSize' in styleObject;
    const hasExplicitWidth = 'width' in styleObject || 'inlineSize' in styleObject;

    if (!hasExplicitHeight && ('maxHeight' in styleObject || 'maxBlockSize' in styleObject)) {
      const maxHeight = parseComputedPx(computedStyle.maxHeight);

      if (maxHeight !== null) {
        nextStyle.height = `${Math.min(scrollElement.scrollHeight, maxHeight)}px`;
      }
    }

    if (!hasExplicitWidth && ('maxWidth' in styleObject || 'maxInlineSize' in styleObject)) {
      const maxWidth = parseComputedPx(computedStyle.maxWidth);

      if (maxWidth !== null) {
        nextStyle.width = `${Math.min(scrollElement.scrollWidth, maxWidth)}px`;
      }
    }

    adapter.autoSizeStyle = nextStyle;
    resolveOSInstance()?.update(true);
  };

  const resolveOSInstance = () => {
    const osInstance = adapter.instance;
    if (!osInstance || osInstance.state().destroyed) {
      return null;
    }
    return osInstance;
  };

  const getScrollOffsetElement = () => {
    const osInstance = resolveOSInstance();
    if (!osInstance) {
      return null;
    }
    return osInstance.elements().scrollOffsetElement ?? null;
  };

  const bindExternalListeners = (eventListeners?: EventListeners) => {
    adapter.removeListeners?.();
    adapter.removeListeners = null;

    const osInstance = resolveOSInstance();
    if (!osInstance || !eventListeners) {
      return;
    }

    adapter.removeListeners = osInstance.on(eventListeners);
  };

  const initScrollbar = () => {
    if (!adapter.container) {
      return;
    }

    adapter.instance = (adapter.createInstance ?? OverlayScrollbars)(
      adapter.container,
      adapter.mergedOptions as Parameters<typeof OverlayScrollbars>[1],
      {
        initialized: (instance) => {
          const listeners = adapter.props.events?.initialized;
          if (Array.isArray(listeners)) {
            listeners.forEach((listener) => listener(instance));
          } else {
            listeners?.(instance);
          }
        },
        scroll: (_instance, event) => {
          adapter.scroll(event);
        },
      },
    );

    bindExternalListeners(adapter.props.events);
  };

  /**
   * @zh 获取底层 OverlayScrollbars 实例。
   * @en Get underlying OverlayScrollbars instance.
   */
  function getOSInstance() {
    return resolveOSInstance();
  }
  /**
   * @zh 获取或更新底层 options。
   * @en Get or set OverlayScrollbars options.
   */
  function options(newOptions?: ScrollbarProps['overlayOptions'], pure?: boolean) {
    const osInstance = getOSInstance();
    if (!osInstance) {
      return undefined;
    }

    if (typeof newOptions === 'undefined') {
      return osInstance.options();
    }

    return osInstance.options(newOptions as Parameters<typeof osInstance.options>[0], pure);
  }
  /**
   * @zh 绑定底层 OverlayScrollbars 事件。
   * @en Bind OverlayScrollbars listeners.
   */
  function on(
    nameOrListeners: keyof EventListenerArgs | EventListeners,
    listenerOrPure?:
      | ScrollbarEventListener<keyof EventListenerArgs>
      | ScrollbarEventListener<keyof EventListenerArgs>[]
      | boolean,
  ) {
    const osInstance = getOSInstance();
    if (!osInstance) {
      return undefined;
    }

    if (isObject(nameOrListeners)) {
      return osInstance.on(
        nameOrListeners as EventListeners,
        listenerOrPure as boolean | undefined,
      );
    }

    if (Array.isArray(listenerOrPure)) {
      return osInstance.on(nameOrListeners, listenerOrPure);
    }

    return osInstance.on(
      nameOrListeners,
      listenerOrPure as ScrollbarEventListener<keyof EventListenerArgs>,
    );
  }
  /**
   * @zh 解绑底层 OverlayScrollbars 事件。
   * @en Remove OverlayScrollbars listeners.
   */
  function off(
    name: keyof EventListenerArgs,
    listener:
      | ScrollbarEventListener<keyof EventListenerArgs>
      | ScrollbarEventListener<keyof EventListenerArgs>[],
  ) {
    const osInstance = getOSInstance();
    if (!osInstance) {
      return;
    }

    if (Array.isArray(listener)) {
      osInstance.off(name, listener);
      return;
    }

    osInstance.off(name, listener);
  }
  /**
   * @zh 强制更新底层实例。
   * @en Force instance update.
   */
  function update(force?: boolean) {
    return getOSInstance()?.update(force) ?? false;
  }
  /**
   * @zh 设置底层实例休眠状态。
   * @en Toggle sleeping state.
   */
  function sleep(sleeping: boolean) {
    getOSInstance()?.sleep(sleeping);
  }
  /**
   * @zh 获取底层状态。
   * @en Get underlying state.
   */
  function state() {
    return getOSInstance()?.state();
  }
  /**
   * @zh 获取底层生成的元素引用。
   * @en Get generated elements.
   */
  function elements() {
    return getOSInstance()?.elements();
  }
  /**
   * @zh 获取底层插件实例。
   * @en Get plugin instance.
   */
  function plugin(osPlugin: ScrollbarPlugin) {
    return getOSInstance()?.plugin(osPlugin);
  }
  /**
   * @zh 销毁底层实例。
   * @en Destroy underlying instance.
   */
  function destroy() {
    const osInstance = getOSInstance();
    if (!osInstance) {
      return;
    }

    osInstance.destroy();
  }
  /**
   * @zh 滚动
   * @en scrollTo
   * @public
   * @param {number | {left?: number;top?: number}} options
   * @param {number} y
   */
  function scrollTo(
    options?:
      | number
      | {
          left?: number;
          top?: number;
        },
    y?: number,
  ) {
    const scrollOffsetElement = getScrollOffsetElement();
    if (!scrollOffsetElement || !('scrollTop' in scrollOffsetElement)) {
      return;
    }

    const canUseNativeScrollTo = typeof scrollOffsetElement.scrollTo === 'function';

    if (isObject(options)) {
      if (canUseNativeScrollTo) {
        scrollOffsetElement.scrollTo(options);
        return;
      }

      if (typeof options.top === 'number') {
        scrollOffsetElement.scrollTop = options.top;
      }
      if (typeof options.left === 'number') {
        scrollOffsetElement.scrollLeft = options.left;
      }

      return;
    }

    if (typeof options !== 'number' && typeof y !== 'number') {
      return;
    }

    if (canUseNativeScrollTo) {
      scrollOffsetElement.scrollTo(
        typeof options === 'number' ? options : scrollOffsetElement.scrollLeft,
        typeof y === 'number' ? y : scrollOffsetElement.scrollTop,
      );
      return;
    }

    if (typeof options === 'number') {
      scrollOffsetElement.scrollLeft = options;
    }
    if (typeof y === 'number') {
      scrollOffsetElement.scrollTop = y;
    }
  }
  /**
   * @zh 纵向滚动
   * @en scroll vertically
   * @public
   * @param {number} top
   * @version 2.40.0
   */
  function scrollTop(top: number) {
    const scrollOffsetElement = getScrollOffsetElement();
    if (!scrollOffsetElement || !('scrollTop' in scrollOffsetElement)) {
      return;
    }

    if (typeof scrollOffsetElement.scrollTo === 'function') {
      scrollOffsetElement.scrollTo({
        top,
      });
    } else {
      scrollOffsetElement.scrollTop = top;
    }
  }
  /**
   * @zh 横向滚动
   * @en scroll horizontal
   * @public
   * @param {number} left
   * @version 2.40.0
   */
  function scrollLeft(left: number) {
    const scrollOffsetElement = getScrollOffsetElement();
    if (!scrollOffsetElement || !('scrollLeft' in scrollOffsetElement)) {
      return;
    }

    if (typeof scrollOffsetElement.scrollTo === 'function') {
      scrollOffsetElement.scrollTo({
        left,
      });
    } else {
      scrollOffsetElement.scrollLeft = left;
    }
  }

  return {
    mount() {
      initScrollbar();
      updateAutoSizeStyle();
    },
    updateAutoSizeStyle,
    bindExternalListeners,
    syncOptions(value: ReturnType<typeof getScrollbarOptions>) {
      resolveOSInstance()?.options(value as Parameters<OverlayScrollbarsInstance['options']>[0]);
    },
    dispose() {
      adapter.removeListeners?.();
      adapter.removeListeners = null;
      adapter.instance?.destroy();
      adapter.instance = null;
    },
    getOSInstance,
    options,
    on,
    off,
    update,
    sleep,
    state,
    elements,
    plugin,
    destroy,
    scrollTo,
    scrollTop,
    scrollLeft,
  };
}
