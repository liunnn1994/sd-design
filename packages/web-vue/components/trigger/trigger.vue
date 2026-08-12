<template>
  <ResizeObserver v-if="props.autoFixPosition" @resize="onTargetResize">
    <VNodeRenderer :content="getTriggerChildren()" />
  </ResizeObserver>
  <VNodeRenderer v-else :content="getTriggerChildren()" />

  <ClientOnly>
    <Teleport :to="teleportContainer" :disabled="!props.renderToBody">
      <ResizeObserver v-if="shouldRenderPopup" @resize="handleResize">
        <div
          ref="popupRef"
          v-bind="popupElementAttrs"
          @mouseenter="handleMouseEnterWithContext"
          @mouseleave="handleMouseLeaveWithContext"
          @mousedown="handlePopupMouseDown"
        >
          <Transition
            :name="props.animationName"
            :duration="props.duration"
            appear
            @before-enter="onAnimationStart"
            @after-enter="handleShow"
            @before-leave="onAnimationStart"
            @after-leave="handleHide"
          >
            <div
              v-show="computedVisible"
              :class="`${prefixCls}-popup-wrapper`"
              :style="transformStyle"
            >
              <div
                :class="[`${prefixCls}-content`, props.contentClass]"
                :style="props.contentStyle"
              >
                <slot name="content" />
              </div>
              <div
                v-if="props.showArrow"
                ref="arrowRef"
                :class="[`${prefixCls}-arrow`, props.arrowClass]"
                :style="arrowStyle"
              />
            </div>
          </Transition>
        </div>
      </ResizeObserver>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
  import type { Middleware, Placement, ReferenceElement, VirtualElement } from '@floating-ui/vue';
  import type { Simplify } from 'type-fest';

  import type { ComponentPublicInstance, CSSProperties, Ref, VNodeChild } from 'vue';
  import {
    computed,
    getCurrentInstance,
    inject,
    nextTick,
    onBeforeUnmount,
    onDeactivated,
    onMounted,
    provide,
    reactive,
    ref,
    useAttrs,
    useSlots,
    watch,
  } from 'vue';

  import { arrow, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue';
  import { onClickOutside, useEventListener } from '@vueuse/core';

  import type { TriggerEvent, TriggerPosition } from '../_utils/constant';
  import type { FloatingOptions } from '../_utils/floating';
  import type { ClassName } from '../_utils/types';
  import type { TriggerPopupTranslate } from './interface';

  import ClientOnly from '../_components/client-only.vue';
  import ResizeObserver from '../_components/resize-observer-v2';
  import { useFirstElement } from '../_hooks/use-first-element';
  import usePickSlots from '../_hooks/use-pick-slots';
  import usePopupManager from '../_hooks/use-popup-manager';
  import { useResizeObserver } from '../_hooks/use-resize-observer';
  import { useTeleportContainer } from '../_hooks/use-teleport-container';
  import { off, on } from '../_utils/dom';
  import { createFloatingOptions } from '../_utils/floating';
  import { getPrefixCls } from '../_utils/global-config';
  import { KEYBOARD_KEY } from '../_utils/keyboard';
  import { omit } from '../_utils/omit';
  import { throttleByRaf } from '../_utils/throttle-by-raf';
  import { isEmptyChildren, mergeFirstChild } from '../_utils/vue-utils';
  import {
    configProviderInjectionKey,
    themePopupContainerInjectionKey,
  } from '../config-provider/context';
  import { triggerInjectionKey } from './context';
  import { getScrollElements, getTransformOrigin } from './utils';

  const TRIGGER_EVENTS = [
    'onClick',
    'onMouseenter',
    'onMouseleave',
    'onFocusin',
    'onFocusout',
    'onContextmenu',
  ];
  type TriggerEventAttrs = Simplify<{
    onClick?: (event: MouseEvent) => void;
    onMouseenter?: (event: MouseEvent) => void;
    onMouseleave?: (event: MouseEvent) => void;
    onFocusin?: (event: FocusEvent) => void;
    onFocusout?: (event: FocusEvent) => void;
    onContextmenu?: (event: MouseEvent) => void;
  }>;
  type ChildRef = Ref<HTMLElement | undefined> | HTMLElement;
  type TriggerClass = ClassName | (ClassName | undefined)[];
  type TriggerProps = {
    floatingOptions?: FloatingOptions;
    popupVisible?: boolean;
    defaultPopupVisible?: boolean;
    trigger?: TriggerEvent | TriggerEvent[];
    position?: TriggerPosition;
    disabled?: boolean;
    popupOffset?: number;
    popupTranslate?: TriggerPopupTranslate;
    showArrow?: boolean;
    alignPoint?: boolean;
    popupHoverStay?: boolean;
    blurToClose?: boolean;
    clickToClose?: boolean;
    clickOutsideToClose?: boolean;
    unmountOnClose?: boolean;
    contentClass?: TriggerClass;
    contentStyle?: CSSProperties;
    arrowClass?: TriggerClass;
    arrowStyle?: CSSProperties;
    popupStyle?: CSSProperties;
    animationName?: string;
    duration?: number | { enter: number; leave: number };
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    focusDelay?: number;
    autoFitPopupWidth?: boolean;
    autoFitPopupMinWidth?: boolean;
    autoFixPosition?: boolean;
    popupContainer?: string | HTMLElement;
    updateAtScroll?: boolean;
    autoFitTransformOrigin?: boolean;
    hideEmpty?: boolean;
    openedClass?: TriggerClass;
    autoFitPosition?: boolean;
    renderToBody?: boolean;
    preventFocus?: boolean;
    scrollToClose?: boolean;
    scrollToCloseDistance?: number;
    escToClose?: boolean;
    ariaHasPopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    ariaDescribedbyPopup?: boolean;
  };

  const toFloatingPlacement = (position: TriggerPosition): Placement => {
    const map: Record<TriggerPosition, Placement> = {
      top: 'top',
      tl: 'top-start',
      tr: 'top-end',
      bottom: 'bottom',
      bl: 'bottom-start',
      br: 'bottom-end',
      left: 'left',
      lt: 'left-start',
      lb: 'left-end',
      right: 'right',
      rt: 'right-start',
      rb: 'right-end',
    };
    return map[position];
  };
  const fromFloatingPlacement = (placement: Placement): TriggerPosition => {
    const map: Record<Placement, TriggerPosition> = {
      'top': 'top',
      'top-start': 'tl',
      'top-end': 'tr',
      'bottom': 'bottom',
      'bottom-start': 'bl',
      'bottom-end': 'br',
      'left': 'left',
      'left-start': 'lt',
      'left-end': 'lb',
      'right': 'right',
      'right-start': 'rt',
      'right-end': 'rb',
    };
    return map[placement];
  };
  const getArrowFloatingStyle = (
    placement: Placement,
    data: { x?: number; y?: number } | undefined,
    customStyle: CSSProperties | undefined,
  ): CSSProperties => {
    const side = placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
    const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side];
    const transforms = {
      top: 'translateY(50%) rotate(45deg)',
      right: 'translateX(-50%) rotate(45deg)',
      bottom: 'translateY(-50%) rotate(45deg)',
      left: 'translateX(50%) rotate(45deg)',
    };
    return {
      ...customStyle,
      left: data?.x == null ? undefined : `${data.x}px`,
      top: data?.y == null ? undefined : `${data.y}px`,
      [staticSide]: 0,
      transform: transforms[side],
    };
  };

  defineOptions({ name: 'Trigger', inheritAttrs: false });
  const props = withDefaults(defineProps<TriggerProps>(), {
    popupVisible: undefined,
    defaultPopupVisible: false,
    trigger: 'hover',
    position: 'bottom',
    disabled: false,
    popupOffset: 0,
    showArrow: false,
    alignPoint: false,
    popupHoverStay: true,
    blurToClose: true,
    clickToClose: true,
    clickOutsideToClose: true,
    unmountOnClose: true,
    animationName: 'fade-in',
    mouseEnterDelay: 100,
    mouseLeaveDelay: 100,
    focusDelay: 0,
    autoFitPopupWidth: false,
    autoFitPopupMinWidth: false,
    autoFixPosition: true,
    updateAtScroll: false,
    autoFitTransformOrigin: false,
    hideEmpty: false,
    autoFitPosition: true,
    renderToBody: true,
    preventFocus: false,
    scrollToClose: false,
    scrollToCloseDistance: 0,
    escToClose: false,
    ariaDescribedbyPopup: false,
  });
  const emit = defineEmits<{
    'update:popupVisible': [visible: boolean];
    'popupVisibleChange': [visible: boolean];
    'show': [];
    'hide': [];
    'resize': [];
  }>();
  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;

  const attrs = useAttrs();
  const slots = useSlots();
  const triggerEventAttrs = attrs as TriggerEventAttrs;
  const prefixCls = getPrefixCls('trigger');
  const popupId = `${prefixCls}-popup-${getCurrentInstance()!.uid}`;
  const popupAttrs = computed(() => omit(attrs, TRIGGER_EVENTS));
  const configCtx = inject(configProviderInjectionKey, undefined);
  const themePopupContainer = inject(themePopupContainerInjectionKey, undefined);
  const mergedPopupContainer = computed(() => props.popupContainer ?? themePopupContainer?.value);
  const triggerMethods = computed(() => ([] as TriggerEvent[]).concat(props.trigger));
  const childrenRefs = new Set<ChildRef>();
  const triggerCtx = inject(triggerInjectionKey, undefined);
  const { children, firstElement } = useFirstElement();
  const popupRef = ref<HTMLElement>();
  const popupVisible = ref(props.defaultPopupVisible);
  const popupPosition = ref(props.position);
  const arrowRef = ref<HTMLElement>();
  const mousePosition = ref({ top: 0, left: 0 });
  let scrollPosition: [number, number] | null = null;
  let windowScrollPosition: [number, number] | null = null;
  const computedVisible = computed(() => props.popupVisible ?? popupVisible.value);
  const pointReference: VirtualElement = {
    getBoundingClientRect: () => {
      const { left, top } = mousePosition.value;
      return { x: left, y: top, top, right: left, bottom: top, left, width: 0, height: 0 };
    },
    get contextElement() {
      return firstElement.value;
    },
  };
  const floatingReference = computed<ReferenceElement | null>(() =>
    props.alignPoint ? pointReference : (firstElement.value ?? null),
  );
  const floatingElement = computed(() => (computedVisible.value ? popupRef.value : null));
  const legacyMiddleware = computed<Middleware[]>(() => {
    const middleware: Middleware[] = [offset(props.popupOffset)];
    const translate = Array.isArray(props.popupTranslate)
      ? props.popupTranslate
      : props.popupTranslate?.[props.position];
    if (translate) {
      middleware.push({
        name: 'sdTriggerTranslate',
        options: translate,
        fn: ({ x, y }) => ({ x: x + translate[0], y: y + translate[1] }),
      });
    }
    if (props.autoFitPosition) middleware.push(flip(), shift());
    if (props.showArrow) middleware.push(arrow({ element: arrowRef }));
    return middleware;
  });
  const defaultWhileElementsMounted: NonNullable<FloatingOptions['whileElementsMounted']> = (
    reference,
    floating,
    update,
  ) =>
    autoUpdate(reference, floating, update, {
      ancestorScroll: props.updateAtScroll || Boolean(configCtx?.updateAtScroll),
      ancestorResize: true,
      elementResize: props.autoFixPosition,
      layoutShift: props.autoFixPosition,
    });
  const floatingOptions = createFloatingOptions(() => props.floatingOptions, {
    open: computedVisible,
    placement: () => toFloatingPlacement(props.position),
    middleware: legacyMiddleware,
    whileElementsMounted: defaultWhileElementsMounted,
  });
  const {
    floatingStyles,
    placement: floatingPlacement,
    middlewareData,
    isPositioned,
    update: updateFloatingPosition,
  } = useFloating(floatingReference, floatingElement, floatingOptions);
  const mergedPopupStyle = computed<CSSProperties>(() => ({
    ...props.popupStyle,
    ...(props.autoFitPopupMinWidth && firstElement.value
      ? { minWidth: `${firstElement.value.getBoundingClientRect().width}px` }
      : {}),
    ...(props.autoFitPopupWidth && firstElement.value
      ? { width: `${firstElement.value.getBoundingClientRect().width}px` }
      : {}),
    ...floatingStyles.value,
  }));
  const transformStyle = computed<CSSProperties>(() =>
    props.autoFitTransformOrigin
      ? { transformOrigin: getTransformOrigin(popupPosition.value) }
      : {},
  );
  const arrowStyle = computed<CSSProperties>(() =>
    getArrowFloatingStyle(floatingPlacement.value, middlewareData.value.arrow, props.arrowStyle),
  );
  watch(
    floatingPlacement,
    (placement) => {
      popupPosition.value = fromFloatingPlacement(placement);
    },
    { immediate: true },
  );
  const firstChildAria = computed(() => {
    const aria: Record<string, unknown> = {};
    if (props.ariaHasPopup !== undefined) {
      aria['aria-haspopup'] = props.ariaHasPopup === true ? 'true' : props.ariaHasPopup;
      aria['aria-expanded'] = computedVisible.value;
      aria['aria-controls'] = computedVisible.value ? popupId : undefined;
    }
    if (props.ariaDescribedbyPopup) {
      aria['aria-describedby'] = computedVisible.value ? popupId : undefined;
    }
    return aria;
  });
  const { teleportContainer, containerRef } = useTeleportContainer({
    popupContainer: mergedPopupContainer,
    visible: computedVisible,
    documentContainer: true,
  });
  const { zIndex } = usePopupManager('popup', { visible: computedVisible });
  const syncThemePopupContainerZIndex = () => {
    if (
      computedVisible.value &&
      zIndex.value > 0 &&
      themePopupContainer?.value &&
      mergedPopupContainer.value === themePopupContainer.value
    ) {
      themePopupContainer.value.style.zIndex = String(zIndex.value);
    }
  };
  watch([computedVisible, zIndex, mergedPopupContainer], syncThemePopupContainerZIndex, {
    immediate: true,
  });
  let delayTimer = 0;
  let windowListener = false;
  const cleanDelayTimer = () => {
    if (delayTimer) {
      window.clearTimeout(delayTimer);
      delayTimer = 0;
    }
  };
  const updateMousePosition = (event: MouseEvent) => {
    if (props.alignPoint) {
      mousePosition.value = { top: event.clientY, left: event.clientX };
    }
  };
  const changeVisible = (visible: boolean, delay?: number) => {
    if (visible === computedVisible.value && delayTimer === 0) return;
    const update = () => {
      popupVisible.value = visible;
      emit('update:popupVisible', visible);
      emit('popupVisibleChange', visible);
      if (visible) nextTick(updateFloatingPosition);
    };
    if (!visible) {
      scrollPosition = null;
      windowScrollPosition = null;
    }
    if (delay) {
      cleanDelayTimer();
      if (visible !== computedVisible.value) delayTimer = window.setTimeout(update, delay);
    } else {
      update();
    }
  };
  const handleClick = (event: MouseEvent) => {
    triggerEventAttrs.onClick?.(event);
    if (props.disabled || (computedVisible.value && !props.clickToClose)) return;
    if (triggerMethods.value.includes('click')) {
      updateMousePosition(event);
      changeVisible(!computedVisible.value);
    } else if (triggerMethods.value.includes('contextMenu') && computedVisible.value) {
      changeVisible(false);
    }
  };
  const handleMouseEnter = (event: MouseEvent) => {
    triggerEventAttrs.onMouseenter?.(event);
    if (props.disabled || !triggerMethods.value.includes('hover')) return;
    updateMousePosition(event);
    changeVisible(true, props.mouseEnterDelay);
  };
  const handleMouseEnterWithContext = (event: MouseEvent) => {
    triggerCtx?.onMouseenter(event);
    handleMouseEnter(event);
  };
  const handleMouseLeave = (event: MouseEvent) => {
    triggerEventAttrs.onMouseleave?.(event);
    if (props.disabled || !triggerMethods.value.includes('hover')) return;
    changeVisible(false, props.mouseLeaveDelay);
  };
  const handleMouseLeaveWithContext = (event: MouseEvent) => {
    triggerCtx?.onMouseleave(event);
    handleMouseLeave(event);
  };
  const handleFocusin = (event: FocusEvent) => {
    triggerEventAttrs.onFocusin?.(event);
    if (!props.disabled && triggerMethods.value.includes('focus')) {
      changeVisible(true, props.focusDelay);
    }
  };
  const handleFocusout = (event: FocusEvent) => {
    triggerEventAttrs.onFocusout?.(event);
    if (!props.disabled && triggerMethods.value.includes('focus') && props.blurToClose) {
      changeVisible(false);
    }
  };
  const handleContextmenu = (event: MouseEvent) => {
    triggerEventAttrs.onContextmenu?.(event);
    if (
      props.disabled ||
      !triggerMethods.value.includes('contextMenu') ||
      (computedVisible.value && !props.clickToClose)
    )
      return;
    updateMousePosition(event);
    changeVisible(!computedVisible.value);
    event.preventDefault();
  };

  const getChildElements = () => {
    const elements: HTMLElement[] = [];
    for (const item of childrenRefs) {
      if (!item) continue;
      const element = 'value' in item ? item.value : item;
      if (element) elements.push(element);
    }
    return elements;
  };
  const handleChildContextmenu = (event: MouseEvent) => {
    triggerCtx?.onContextmenu(event);
    if (!props.clickOutsideToClose || !computedVisible.value) return;
    if (!triggerMethods.value.includes('contextMenu')) return;
    const target = event.target as HTMLElement;
    if (popupRef.value?.contains(target)) return;
    if (getChildElements().some((element) => element.contains(target))) return;
    changeVisible(false);
  };
  const handleContextmenuWithContext = (event: MouseEvent) => {
    triggerCtx?.onContextmenu(event);
    handleContextmenu(event);
  };
  const addChildRef = (childRef: ChildRef) => {
    childrenRefs.add(childRef);
    triggerCtx?.addChildRef(childRef as HTMLElement | ComponentPublicInstance);
  };
  const removeChildRef = (childRef: ChildRef) => {
    childrenRefs.delete(childRef);
    triggerCtx?.removeChildRef(childRef as HTMLElement | ComponentPublicInstance);
  };
  provide(
    triggerInjectionKey,
    reactive({
      onMouseenter: handleMouseEnterWithContext,
      onMouseleave: handleMouseLeaveWithContext,
      onContextmenu: handleChildContextmenu,
      addChildRef: addChildRef as (childRef: HTMLElement | ComponentPublicInstance) => void,
      removeChildRef: removeChildRef as (childRef: HTMLElement | ComponentPublicInstance) => void,
    }),
  );
  const contentSlot = usePickSlots(slots, 'content');
  const hidePopup = computed(() => props.hideEmpty && isEmptyChildren(contentSlot.value?.()));
  const getOutsideIgnoreElements = () => [
    ...(triggerMethods.value.includes('contextMenu') || !firstElement.value
      ? []
      : [firstElement.value]),
    ...getChildElements(),
  ];
  onClickOutside(
    popupRef,
    () => {
      if (props.clickOutsideToClose && computedVisible.value) changeVisible(false);
    },
    { ignore: getOutsideIgnoreElements },
  );
  const handleOutsideContextmenu = (event: MouseEvent) => {
    if (!props.clickOutsideToClose || !computedVisible.value) return;
    if (!triggerMethods.value.includes('contextMenu')) return;
    const target = event.target as HTMLElement;
    if (popupRef.value?.contains(target)) return;
    if (getChildElements().some((element) => element.contains(target))) return;
    changeVisible(false);
  };
  const documentRef = computed(() => (typeof document === 'undefined' ? undefined : document));
  useEventListener(documentRef, 'contextmenu', handleOutsideContextmenu, { capture: true });
  useEventListener(documentRef, 'keydown', (event: KeyboardEvent) => {
    if (props.escToClose && computedVisible.value && event.key === KEYBOARD_KEY.ESC) {
      changeVisible(false);
    }
  });
  const isExceedThreshold = (oldPosition: [number, number], element: HTMLElement) => {
    const [scrollTop, scrollLeft] = oldPosition;
    return (
      Math.abs(element.scrollTop - scrollTop) >= props.scrollToCloseDistance ||
      Math.abs(element.scrollLeft - scrollLeft) >= props.scrollToCloseDistance
    );
  };
  const handleScroll = throttleByRaf((event: Event) => {
    if (computedVisible.value && (props.scrollToClose || configCtx?.scrollToClose)) {
      const element = event.target as HTMLElement;
      scrollPosition ??= [element.scrollTop, element.scrollLeft];
      if (isExceedThreshold(scrollPosition, element)) changeVisible(false);
    }
  });
  const removeWindowScroll = () => {
    off(window, 'scroll', onWindowScroll);
    windowListener = false;
  };
  const onWindowScroll = throttleByRaf((event: Event) => {
    const element = (event.target as Document).documentElement;
    windowScrollPosition ??= [element.scrollTop, element.scrollLeft];
    if (isExceedThreshold(windowScrollPosition, element)) {
      changeVisible(false);
      removeWindowScroll();
    }
  });
  const handleResize = () => {
    if (computedVisible.value) updateFloatingPosition();
  };
  const onTargetResize = () => {
    handleResize();
    emit('resize');
  };
  const handlePopupMouseDown = (event: Event) => {
    if (props.preventFocus) event.preventDefault();
  };
  watch(
    popupRef,
    (element, _oldElement, onCleanup) => {
      if (!element) return;
      triggerCtx?.addChildRef(element);
      onCleanup(() => triggerCtx?.removeChildRef(element));
    },
    { immediate: true },
  );
  const triggerCls = computed(() => (computedVisible.value ? props.openedClass : undefined));
  let scrollElements: HTMLElement[] | undefined;
  const mounted = ref(computedVisible.value);
  watch(computedVisible, (value) => {
    if (props.scrollToClose || configCtx?.scrollToClose) {
      on(window, 'scroll', onWindowScroll);
      windowListener = true;
    }
    if (props.updateAtScroll || configCtx?.updateAtScroll) {
      if (value) {
        scrollElements = getScrollElements(firstElement.value);
        for (const item of scrollElements) item.addEventListener('scroll', handleScroll);
      } else if (scrollElements) {
        for (const item of scrollElements) item.removeEventListener('scroll', handleScroll);
        scrollElements = undefined;
      }
    }
    if (value) mounted.value = true;
  });
  watch(
    () => [props.autoFitPopupWidth, props.autoFitPopupMinWidth],
    () => {
      if (computedVisible.value) updateFloatingPosition();
    },
  );
  const { createResizeObserver, destroyResizeObserver } = useResizeObserver({
    elementRef: containerRef,
    onResize: handleResize,
  });
  onMounted(() => {
    createResizeObserver();
    if (computedVisible.value) {
      updateFloatingPosition();
      if (props.updateAtScroll || configCtx?.updateAtScroll) {
        scrollElements = getScrollElements(firstElement.value);
        for (const item of scrollElements) item.addEventListener('scroll', handleScroll);
      }
    }
  });
  onDeactivated(() => changeVisible(false));
  onBeforeUnmount(() => {
    triggerCtx?.removeChildRef(popupRef.value as HTMLElement);
    destroyResizeObserver();
    if (windowListener) removeWindowScroll();
    if (scrollElements) {
      for (const item of scrollElements) item.removeEventListener('scroll', handleScroll);
      scrollElements = undefined;
    }
  });
  const isAnimation = ref(false);
  const onAnimationStart = () => {
    isAnimation.value = true;
  };
  const handleShow = () => {
    isAnimation.value = false;
    if (computedVisible.value) emit('show');
  };
  const handleHide = () => {
    isAnimation.value = false;
    if (!computedVisible.value) {
      mounted.value = false;
      emit('hide');
    }
  };
  const getTriggerChildren = () => {
    children.value = slots.default?.() ?? [];
    mergeFirstChild(children.value, {
      class: triggerCls.value,
      ...firstChildAria.value,
      onClick: handleClick,
      onMouseenter: handleMouseEnter,
      onMouseleave: handleMouseLeave,
      onFocusin: handleFocusin,
      onFocusout: handleFocusout,
      onContextmenu: handleContextmenuWithContext,
    });
    return children.value;
  };
  const popupElementAttrs = computed<Record<string, unknown>>(() => ({
    'id': popupId,
    'class': [`${prefixCls}-popup`, `${prefixCls}-position-${popupPosition.value}`],
    'style': {
      ...mergedPopupStyle.value,
      ...(isPositioned.value ? {} : { visibility: 'hidden' }),
      zIndex: zIndex.value,
      pointerEvents: isAnimation.value ? 'none' : undefined,
    },
    'trigger-placement': popupPosition.value,
    ...popupAttrs.value,
  }));
  const shouldRenderPopup = computed(
    () => (!props.unmountOnClose || computedVisible.value || mounted.value) && !hidePopup.value,
  );
</script>
