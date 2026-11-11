import type { HTMLAttributes, Ref } from 'react';

import { createPopupEntry } from '@sdata/web-core/popup/manager';
import { createTriggerFoundation } from '@sdata/web-core/trigger/foundation';
import { resolvePopupContainer } from '@sdata/web-core/trigger/popup-container';
import {
  fromFloatingPlacement,
  getArrowFloatingStyle,
  toFloatingPlacement,
} from '@sdata/web-core/trigger/position';
import { getScrollElements, getTransformOrigin } from '@sdata/web-core/trigger/utils';
import {
  cloneElement,
  Children,
  Fragment,
  isValidElement,
  createContext,
  useCallback,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import type { TriggerProps } from './types.js';

import { useTransitionPresence } from '../_shared/use-transition-presence.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { ThemeContext } from '../config-provider/theme-provider.js';
import { useFloatingPosition } from './use-floating-position.js';
export type {
  TriggerProps,
  TriggerEvent,
  TriggerPosition,
  TriggerPopupTranslate,
} from './types.js';
export type { FloatingOptions } from './use-floating-position.js';

interface TriggerContextValue {
  hidden: boolean;
  register(element: HTMLElement): () => void;
  mouseenter(event: MouseEvent): void;
  mouseleave(event: MouseEvent): void;
}
const TriggerContext = createContext<TriggerContextValue | undefined>(undefined);

export function Trigger({
  children,
  ref,
  content,
  popupVisible,
  defaultPopupVisible = false,
  trigger = 'hover',
  position = 'bottom',
  disabled = false,
  popupOffset = 0,
  popupTranslate,
  showArrow = false,
  alignPoint = false,
  blurToClose = true,
  clickToClose = true,
  clickOutsideToClose = true,
  unmountOnClose = true,
  contentClass,
  contentStyle,
  arrowClass,
  arrowStyle,
  popupStyle,
  animationName = 'fade-in',
  duration,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 100,
  focusDelay = 0,
  autoFitPopupWidth = false,
  autoFitPopupMinWidth = false,
  autoFitPopupSize = false,
  autoFixPosition = true,
  popupContainer,
  referenceElement,
  updateAtScroll,
  autoFitTransformOrigin = false,
  hideEmpty = false,
  openedClass,
  autoFitPosition = true,
  renderToBody = true,
  preventFocus = false,
  scrollToClose,
  scrollToCloseDistance = 0,
  escToClose = false,
  ariaHasPopup,
  ariaDescribedbyPopup = false,
  floatingOptions,
  onPopupVisibleChange,
  onShow,
  onHide,
  onResize,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onContextMenu,
  className,
  style,
  ...attrs
}: TriggerProps) {
  const prefix = usePrefix('trigger');
  const id = useId();
  const config = useConfig();
  const theme = useContext(ThemeContext);
  const parent = useContext(TriggerContext);
  const [localVisible, setLocalVisible] = useState(defaultPopupVisible);
  const visible = popupVisible ?? localVisible;
  const [childReference, setReference] = useState<HTMLElement | null>(null);
  const reference = referenceElement ?? childReference;
  useImperativeHandle(ref, () => reference!, [reference]);
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const [container, setContainer] = useState<HTMLElement>();
  const [hiddenReference, setHiddenReference] = useState(false);
  const [targetWidth, setTargetWidth] = useState(0);
  const [zIndex, setZIndex] = useState(0);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const descendants = useRef(new Set<HTMLElement>());
  const methods = Array.isArray(trigger) ? trigger : [trigger];
  const options = {
    disabled,
    alignPoint,
    clickToClose,
    blurToClose,
    clickOutsideToClose,
    escToClose,
    mouseEnterDelay,
    mouseLeaveDelay,
    focusDelay,
    preventFocus,
    unmountOnClose,
    scrollToCloseDistance,
  };
  const live = useRef({
    visible,
    popupVisible,
    methods,
    options,
    parent,
    popup,
    reference,
    onPopupVisibleChange,
    onShow,
    onHide,
    onResize,
    zIndex,
  });
  live.current = {
    visible,
    popupVisible,
    methods,
    options,
    parent,
    popup,
    reference,
    onPopupVisibleChange,
    onShow,
    onHide,
    onResize,
    zIndex,
  };
  const [foundation] = useState(() =>
    createTriggerFoundation({
      get options() {
        return live.current.options;
      },
      get visible() {
        return live.current.visible;
      },
      get methods() {
        return live.current.methods;
      },
      scrollToClose: false,
      mounted: false,
      get parentPopupHidden() {
        return live.current.parent?.hidden;
      },
      setVisible: (next) => {
        if (live.current.popupVisible === undefined) live.current.visible = next;
        setLocalVisible(next);
      },
      onVisible: (next) => live.current.onPopupVisibleChange?.(next),
      afterOpen: () => {},
      resetScroll: () => {},
      setMousePosition: (y, x) => setPoint({ x, y }),
      setTimer: (task, delay) => window.setTimeout(task, delay),
      clearTimer: (timer) => window.clearTimeout(timer),
      onNativeClick: () => {},
      onNativeMouseenter: () => {},
      onNativeMouseleave: () => {},
      onNativeFocusin: () => {},
      onNativeFocusout: () => {},
      onNativeContextmenu: () => {},
      isInsidePopupOrChildren: (event) => inside(event.target),
      setAnimation: () => {},
      setMounted: () => {},
      onShow: () => live.current.onShow?.(),
      onHide: () => live.current.onHide?.(),
    }),
  );
  function inside(target: EventTarget | null) {
    return (
      target instanceof Node &&
      Boolean(
        live.current.popup?.contains(target) ||
        [...descendants.current].some((element) => element.contains(target)),
      )
    );
  }
  const [entry] = useState(() =>
    createPopupEntry('popup', {
      get zIndex() {
        return live.current.zIndex;
      },
      setZIndex: (next) => {
        live.current.zIndex = next;
        setZIndex(next);
      },
    }),
  );
  useLayoutEffect(() => {
    if (visible) entry.open();
    else entry.close();
    return entry.close;
  }, [visible, entry]);
  useLayoutEffect(() => () => foundation.cleanDelayTimer(), [foundation]);
  const methodKey = methods.join(',');
  useLayoutEffect(() => {
    foundation.cleanDelayTimer();
    if (disabled || parent?.hidden) foundation.changeVisible(false);
  }, [disabled, parent?.hidden, methodKey, foundation]);
  useLayoutEffect(() => {
    setContainer(
      resolvePopupContainer({
        popupContainer: popupContainer ?? theme.popupContainer ?? undefined,
        defaultContainer: document.body,
      }),
    );
  }, [popupContainer, theme.popupContainer, visible]);
  useLayoutEffect(() => {
    if (visible && container === theme.popupContainer && container)
      container.style.zIndex = String(zIndex);
  }, [visible, container, theme.popupContainer, zIndex]);
  useLayoutEffect(() => {
    if (!reference) return;
    setTargetWidth(reference.getBoundingClientRect().width);
    const update = () => {
      if (autoFixPosition) setTargetWidth(reference.getBoundingClientRect().width);
      const hidden = !reference.isConnected || reference.getClientRects().length === 0;
      setHiddenReference(hidden);
      if (hidden && live.current.visible) foundation.changeVisible(false);
      if (autoFixPosition) live.current.onResize?.();
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(reference);
    return () => observer.disconnect();
  }, [reference, foundation, autoFixPosition]);
  useLayoutEffect(() => {
    if (!popup) return;
    return parent?.register(popup);
  }, [popup, parent]);
  useLayoutEffect(() => {
    if (!visible) return;
    const onClick = (event: MouseEvent) => {
      if (inside(event.target)) return;
      if (
        !live.current.methods.includes('contextMenu') &&
        event.target instanceof Node &&
        reference?.contains(event.target)
      )
        return;
      foundation.outsideClick();
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('contextmenu', foundation.outsideContextmenu, true);
    document.addEventListener('keydown', foundation.keydown);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('contextmenu', foundation.outsideContextmenu, true);
      document.removeEventListener('keydown', foundation.keydown);
    };
  }, [visible, reference, foundation]);
  useLayoutEffect(() => {
    if (!visible || !(scrollToClose ?? config.scrollToClose)) return;
    const elements = [...getScrollElements(reference ?? undefined), document.documentElement];
    const initial = new Map(
      elements.map((element) => [
        element,
        [element.scrollTop, element.scrollLeft] as [number, number],
      ]),
    );
    const onScroll = (event: Event) => {
      const element =
        event.target === document ? document.documentElement : (event.target as HTMLElement);
      const start = initial.get(element);
      if (start && foundation.isExceedThreshold(start, element)) foundation.changeVisible(false);
    };
    document.addEventListener('scroll', onScroll, true);
    return () => document.removeEventListener('scroll', onScroll, true);
  }, [visible, scrollToClose, config.scrollToClose, reference, foundation]);
  const virtual = useMemo(
    () => ({
      contextElement: reference ?? undefined,
      getBoundingClientRect: () => ({
        ...point,
        left: point.x,
        right: point.x,
        top: point.y,
        bottom: point.y,
        width: 0,
        height: 0,
      }),
    }),
    [point, reference],
  );
  const floating = useFloatingPosition(
    alignPoint ? virtual : reference,
    popup,
    arrowElement,
    visible && !parent?.hidden,
    {
      position,
      popupOffset,
      popupTranslate,
      autoFitPosition,
      autoFitPopupSize,
      showArrow,
      autoFixPosition,
      updateAtScroll: updateAtScroll ?? config.updateAtScroll ?? false,
      floatingOptions,
    },
  );
  const placement = floating?.placement ?? toFloatingPlacement(position);
  const resolvedPosition = fromFloatingPlacement(placement);
  const presence = useTransitionPresence(
    visible,
    wrapper,
    animationName,
    duration,
    foundation.show,
    foundation.hide,
  );
  const context = useMemo<TriggerContextValue>(
    () => ({
      hidden: !visible || !!parent?.hidden,
      register(element) {
        descendants.current.add(element);
        const unregister = parent?.register(element);
        return () => {
          descendants.current.delete(element);
          unregister?.();
        };
      },
      mouseenter(event) {
        parent?.mouseenter(event);
        foundation.mouseenter(event);
      },
      mouseleave(event) {
        parent?.mouseleave(event);
        foundation.mouseleave(event);
      },
    }),
    [visible, parent, foundation],
  );
  while (children.type === Fragment) {
    const parts = Children.toArray((children.props as { children?: React.ReactNode }).children);
    children = parts.length === 1 && isValidElement(parts[0]) ? parts[0] : <span>{parts}</span>;
  }
  const childProps = children.props as HTMLAttributes<HTMLElement> & { ref?: Ref<unknown> };
  const childRef = childProps.ref;
  const attach = useCallback(
    (element: unknown) => {
      const node =
        element instanceof HTMLElement
          ? element
          : element && typeof element === 'object' && 'inputRef' in element
            ? element.inputRef
            : null;
      setReference(node instanceof HTMLElement ? node : null);
      const cleanup = typeof childRef === 'function' ? childRef(element) : undefined;
      if (childRef && typeof childRef !== 'function') childRef.current = element;
      return () => {
        setReference(null);
        if (typeof cleanup === 'function') cleanup();
        else if (typeof childRef === 'function') childRef(null);
        else if (childRef) childRef.current = null;
      };
    },
    [childRef],
  );
  const target = cloneElement(children as React.ReactElement<typeof childProps>, {
    ref: attach,
    className:
      [childProps.className, visible && openedClass].filter(Boolean).join(' ') || undefined,
    ...(ariaHasPopup !== undefined
      ? {
          'aria-haspopup': ariaHasPopup,
          'aria-expanded': visible,
          'aria-controls': visible ? id : undefined,
        }
      : {}),
    ...(ariaDescribedbyPopup
      ? {
          'aria-describedby': visible
            ? [childProps['aria-describedby'], id].filter(Boolean).join(' ')
            : childProps['aria-describedby'],
        }
      : {}),
    onClick: (event) => {
      childProps.onClick?.(event);
      onClick?.(event);
      foundation.click(event.nativeEvent);
    },
    onMouseEnter: (event) => {
      childProps.onMouseEnter?.(event);
      onMouseEnter?.(event);
      foundation.mouseenter(event.nativeEvent);
    },
    onMouseLeave: (event) => {
      childProps.onMouseLeave?.(event);
      onMouseLeave?.(event);
      foundation.mouseleave(event.nativeEvent);
    },
    onFocus: (event) => {
      childProps.onFocus?.(event);
      onFocus?.(event);
      foundation.focusin(event.nativeEvent);
    },
    onBlur: (event) => {
      childProps.onBlur?.(event);
      onBlur?.(event);
      foundation.focusout(event.nativeEvent);
    },
    onContextMenu: (event) => {
      childProps.onContextMenu?.(event);
      onContextMenu?.(event);
      foundation.contextmenu(event.nativeEvent);
    },
  });
  const shouldRender =
    container &&
    (presence.present || !unmountOnClose) &&
    !(hideEmpty && (content == null || content === false || content === ''));
  const overlay = shouldRender ? (
    <TriggerContext.Provider value={context}>
      <div
        {...attrs}
        id={id}
        ref={setPopup}
        className={[`${prefix}-popup`, `${prefix}-position-${resolvedPosition}`, className]
          .filter(Boolean)
          .join(' ')}
        trigger-placement={resolvedPosition}
        style={{
          ...popupStyle,
          ...(autoFitPopupMinWidth ? { minWidth: targetWidth } : {}),
          ...(autoFitPopupWidth ? { width: targetWidth } : {}),
          position: floating?.strategy ?? 'absolute',
          left: floating?.x ?? 0,
          top: floating?.y ?? 0,
          visibility:
            floating && presence.present && !hiddenReference && !parent?.hidden
              ? undefined
              : 'hidden',
          display: presence.present ? undefined : 'none',
          pointerEvents: presence.animating ? 'none' : undefined,
          zIndex,
          ...style,
        }}
        onMouseEnter={(event) => context.mouseenter(event.nativeEvent)}
        onMouseLeave={(event) => context.mouseleave(event.nativeEvent)}
        onMouseDown={(event) => foundation.popupMouseDown(event.nativeEvent)}
      >
        <div
          ref={setWrapper}
          className={`${prefix}-popup-wrapper`}
          style={
            autoFitTransformOrigin
              ? { transformOrigin: getTransformOrigin(resolvedPosition) }
              : undefined
          }
        >
          <div
            className={[`${prefix}-content`, contentClass].filter(Boolean).join(' ')}
            style={contentStyle}
          >
            {content}
          </div>
          {showArrow && (
            <div
              ref={setArrowElement}
              className={[`${prefix}-arrow`, arrowClass].filter(Boolean).join(' ')}
              style={{
                ...arrowStyle,
                ...getArrowFloatingStyle(placement, floating?.middlewareData.arrow),
              }}
            />
          )}
        </div>
      </div>
    </TriggerContext.Provider>
  ) : null;
  return (
    <>
      {target}
      {overlay && renderToBody ? createPortal(overlay, container!) : overlay}
    </>
  );
}

export default Trigger;
