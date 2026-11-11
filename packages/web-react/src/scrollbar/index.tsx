import type { ScrollbarProps as CoreProps } from '@sdata/web-core/scrollbar/types';
import type { CSSProperties, ComponentPropsWithoutRef, Ref } from 'react';

import { createScrollbar } from '@sdata/web-core/scrollbar/foundation';
import { getScrollbarOptions, normalizeScrollbarStyle } from '@sdata/web-core/scrollbar/options';
import { useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { usePrefix } from '../config-provider/index.js';

type Foundation = ReturnType<typeof createScrollbar>;
export type {
  ScrollbarElements,
  ScrollbarEventListener,
  ScrollbarEventListenerArgs,
  ScrollbarEventListeners,
  ScrollbarOptions,
  ScrollbarOptionsResolved,
  ScrollbarPlugin,
  ScrollbarReadonlyOptions,
  ScrollbarState,
  ScrollbarType,
  ScrollbarUpdatedEvent,
} from '@sdata/web-core/scrollbar/types';
export type ScrollbarExposed = Omit<
  Foundation,
  'mount' | 'dispose' | 'updateAutoSizeStyle' | 'bindExternalListeners' | 'syncOptions'
>;
export type ScrollbarExpose = ScrollbarExposed;
export type ScrollbarInstance = ScrollbarExposed;
export interface ScrollbarProps
  extends
    Omit<CoreProps<CSSProperties>, 'outerClass'>,
    Omit<ComponentPropsWithoutRef<'div'>, 'onScroll'> {
  outerClass?: string;
  hide?: boolean;
  disableHorizontal?: boolean;
  disableVertical?: boolean;
  onScroll?: (event: Event) => void;
  ref?: Ref<ScrollbarExposed>;
}

export function Scrollbar({
  type = 'embed',
  outerClass,
  outerStyle,
  hide = false,
  disableHorizontal = false,
  disableVertical = false,
  paddingAbsolute,
  showNativeOverlaidScrollbars,
  updateOptions,
  overflow,
  scrollbars,
  overlayOptions,
  events,
  onScroll,
  ref,
  children,
  className,
  ...attrs
}: ScrollbarProps) {
  const prefix = usePrefix('scrollbar');
  const outer = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [autoSize, setAutoSize] = useState<Record<string, string>>({});
  const props = {
    type,
    outerStyle,
    hide,
    disableHorizontal,
    disableVertical,
    paddingAbsolute,
    showNativeOverlaidScrollbars,
    updateOptions,
    overflow,
    scrollbars,
    overlayOptions,
    events,
  };
  const mergedOptions = useMemo(
    () => getScrollbarOptions(props, prefix),
    [
      type,
      hide,
      disableHorizontal,
      disableVertical,
      paddingAbsolute,
      showNativeOverlaidScrollbars,
      updateOptions,
      overflow,
      scrollbars,
      overlayOptions,
      prefix,
    ],
  );
  const live = useRef({ props, mergedOptions, onScroll, autoSize });
  live.current = { props, mergedOptions, onScroll, autoSize };
  const [foundation] = useState(() =>
    createScrollbar({
      get props() {
        return live.current.props;
      },
      get outer() {
        return outer.current ?? undefined;
      },
      get container() {
        return container.current ?? undefined;
      },
      get viewport() {
        return viewport.current ?? undefined;
      },
      get normalizedStyle() {
        return normalizeScrollbarStyle(live.current.props.outerStyle);
      },
      get mergedOptions() {
        return live.current.mergedOptions;
      },
      instance: null,
      removeListeners: null,
      get autoSizeStyle() {
        return live.current.autoSize;
      },
      set autoSizeStyle(next) {
        setAutoSize((previous) =>
          previous.width === next.width && previous.height === next.height ? previous : next,
        );
      },
      readComputedStyle: (element) => getComputedStyle(element),
      scroll: (event) => live.current.onScroll?.(event),
    }),
  );
  useLayoutEffect(() => {
    foundation.mount();
    const observer = new ResizeObserver(foundation.updateAutoSizeStyle);
    if (outer.current) observer.observe(outer.current);
    if (container.current) observer.observe(container.current);
    return () => {
      observer.disconnect();
      foundation.dispose();
    };
  }, [foundation]);
  useLayoutEffect(() => foundation.syncOptions(mergedOptions), [foundation, mergedOptions]);
  useLayoutEffect(() => foundation.bindExternalListeners(events), [foundation, events]);
  useLayoutEffect(() => foundation.updateAutoSizeStyle(), [foundation, outerStyle, children]);
  useImperativeHandle(
    ref,
    () => ({
      getOSInstance: foundation.getOSInstance,
      options: foundation.options,
      on: foundation.on,
      off: foundation.off,
      update: foundation.update,
      sleep: foundation.sleep,
      state: foundation.state,
      elements: foundation.elements,
      plugin: foundation.plugin,
      destroy: foundation.destroy,
      scrollTo: foundation.scrollTo,
      scrollTop: foundation.scrollTop,
      scrollLeft: foundation.scrollLeft,
    }),
    [foundation],
  );
  return (
    <div
      ref={outer}
      className={[prefix, `${prefix}-type-${type}`, outerClass].filter(Boolean).join(' ')}
      style={{ ...outerStyle, ...autoSize }}
    >
      <div
        {...attrs}
        ref={container}
        className={[`${prefix}-container`, className].filter(Boolean).join(' ')}
      >
        <div ref={viewport}>{children}</div>
      </div>
    </div>
  );
}

export default Scrollbar;
