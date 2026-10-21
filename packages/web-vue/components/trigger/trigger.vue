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
  import type { Middleware, ReferenceElement, VirtualElement } from '@floating-ui/vue';
  import type { Simplify } from 'type-fest';

  import type { ComponentPublicInstance, CSSProperties, Ref, VNodeChild } from 'vue';
  import {
    computed,
    getCurrentInstance,
    inject,
    mergeProps,
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

  import { arrow, autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/vue';
  import { createTriggerFoundation } from '@sdata/web-core/trigger/foundation';
  import {
    toFloatingPlacement,
    fromFloatingPlacement,
    getArrowFloatingStyle,
  } from '@sdata/web-core/trigger/position';
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
    autoFitPopupSize?: boolean;
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
    autoFitPopupSize: false,
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
    ariaHasPopup: undefined,
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
  const targetWidth = ref(0);
  watch(firstElement, (element) => {
    targetWidth.value = element?.getBoundingClientRect().width ?? 0;
  });
  const popupRef = ref<HTMLElement>();
  const popupVisible = ref(props.defaultPopupVisible);
  const popupPosition = ref(props.position);
  const arrowRef = ref<HTMLElement>();
  const mousePosition = ref({ top: 0, left: 0 });
  let scrollPositions = new WeakMap<HTMLElement, [number, number]>();
  let windowScrollPosition: [number, number] | null = null;
  const computedVisible = computed(() => props.popupVisible ?? popupVisible.value);
  const parentPopupHidden = computed(() =>
    Boolean(firstElement.value && triggerCtx?.isPopupHidden(firstElement.value)),
  );
  const referenceHidden = ref(false);
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
    const padding = props.autoFitPopupSize ? 8 : 0;
    if (props.autoFitPosition) middleware.push(flip({ padding }), shift({ padding }));
    if (props.autoFitPopupSize) {
      middleware.push(
        size({
          padding,
          apply({ availableWidth, availableHeight, elements }) {
            elements.floating.style.setProperty(
              '--sd-trigger-available-width',
              `${Math.max(0, availableWidth)}px`,
            );
            elements.floating.style.setProperty(
              '--sd-trigger-available-height',
              `${Math.max(0, availableHeight)}px`,
            );
          },
        }),
      );
    }
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
      ? { minWidth: `${targetWidth.value}px` }
      : {}),
    ...(props.autoFitPopupWidth && firstElement.value ? { width: `${targetWidth.value}px` } : {}),
    ...floatingStyles.value,
  }));
  const transformStyle = computed<CSSProperties>(() =>
    props.autoFitTransformOrigin
      ? { transformOrigin: getTransformOrigin(popupPosition.value) }
      : {},
  );
  const arrowStyle = computed<CSSProperties>(() => ({
    ...props.arrowStyle,
    ...getArrowFloatingStyle(floatingPlacement.value, middlewareData.value.arrow),
  }));
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
  let windowListener = false;
  const foundation = createTriggerFoundation({
    get options() {
      return props;
    },
    get visible() {
      return computedVisible.value;
    },
    get methods() {
      return triggerMethods.value;
    },
    get scrollToClose() {
      return props.scrollToClose || Boolean(configCtx?.scrollToClose);
    },
    get parentPopupHidden() {
      return parentPopupHidden.value;
    },
    get mounted() {
      return mounted.value;
    },
    setVisible: (value) => {
      popupVisible.value = value;
    },
    onVisible: (value) => {
      emit('update:popupVisible', value);
      emit('popupVisibleChange', value);
    },
    afterOpen: () => {
      void nextTick(updateFloatingPosition);
    },
    resetScroll: () => {
      scrollPositions = new WeakMap();
      windowScrollPosition = null;
    },
    setMousePosition: (top, left) => {
      mousePosition.value = { top, left };
    },
    setTimer: (callback, delay) => window.setTimeout(callback, delay),
    clearTimer: (timer) => window.clearTimeout(timer),
    onNativeClick: (event) => triggerEventAttrs.onClick?.(event),
    onNativeMouseenter: (event) => triggerEventAttrs.onMouseenter?.(event),
    onNativeMouseleave: (event) => triggerEventAttrs.onMouseleave?.(event),
    onNativeFocusin: (event) => triggerEventAttrs.onFocusin?.(event),
    onNativeFocusout: (event) => triggerEventAttrs.onFocusout?.(event),
    onNativeContextmenu: (event) => triggerEventAttrs.onContextmenu?.(event),
    isInsidePopupOrChildren: (event) => {
      const target = event.target as HTMLElement;
      return Boolean(
        popupRef.value?.contains(target) ||
        getChildElements().some((element) => element.contains(target)),
      );
    },
    setAnimation: (value) => {
      isAnimation.value = value;
    },
    setMounted: (value) => {
      mounted.value = value;
    },
    onShow: () => emit('show'),
    onHide: () => emit('hide'),
  });
  const changeVisible = foundation.changeVisible;
  const cleanDelayTimer = foundation.cleanDelayTimer;
  watch([() => props.disabled, triggerMethods], cleanDelayTimer);
  watch(
    parentPopupHidden,
    (hidden) => {
      if (hidden) {
        referenceHidden.value = true;
        changeVisible(false);
      }
    },
    { flush: 'sync' },
  );
  watch(
    () => props.disabled,
    (disabled) => {
      if (disabled) changeVisible(false);
    },
  );
  watch(
    [computedVisible, firstElement, parentPopupHidden],
    ([visible, element], _oldValue, onCleanup) => {
      if (!visible) return;
      const checkReference = () => {
        if (!computedVisible.value) return;
        referenceHidden.value =
          parentPopupHidden.value || !element?.isConnected || element.getClientRects().length === 0;
        if (referenceHidden.value) changeVisible(false);
      };
      checkReference();
      if (!element) return;
      // Hiding an ancestor (e.g. a dropdown) does not dispatch mouseleave.
      const observer = new window.ResizeObserver(checkReference);
      observer.observe(element);
      onCleanup(() => observer.disconnect());
    },
    { flush: 'post' },
  );
  const handleClick = foundation.click;
  const handleMouseEnter = foundation.mouseenter;
  const handleMouseLeave = foundation.mouseleave;
  const handleFocusin = foundation.focusin;
  const handleFocusout = foundation.focusout;
  const handleContextmenu = foundation.contextmenu;
  const handleMouseEnterWithContext = (event: MouseEvent) => {
    triggerCtx?.onMouseenter(event);
    handleMouseEnter(event);
  };
  const handleMouseLeaveWithContext = (event: MouseEvent) => {
    triggerCtx?.onMouseleave(event);
    handleMouseLeave(event);
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
    foundation.outsideContextmenu(event);
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
      // Only popup descendants follow its visibility; trigger-slot children remain usable.
      isPopupHidden: (element: HTMLElement): boolean =>
        Boolean(
          popupRef.value?.contains(element) && (!computedVisible.value || parentPopupHidden.value),
        ) || Boolean(triggerCtx?.isPopupHidden(element)),
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
  onClickOutside(popupRef, foundation.outsideClick, { ignore: getOutsideIgnoreElements });
  const handleOutsideContextmenu = foundation.outsideContextmenu;
  const documentRef = computed(() => (typeof document === 'undefined' ? undefined : document));
  useEventListener(documentRef, 'contextmenu', handleOutsideContextmenu, { capture: true });
  useEventListener(documentRef, 'keydown', foundation.keydown);
  const isExceedThreshold = foundation.isExceedThreshold;
  const handleScroll = throttleByRaf((event: Event) => {
    if (foundation.shouldListenForScroll(computedVisible.value)) {
      const element = event.target as HTMLElement;
      const position = scrollPositions.get(element);
      if (position && isExceedThreshold(position, element)) changeVisible(false);
    }
  });
  const removeWindowScroll = () => {
    off(window, 'scroll', onWindowScroll);
    windowListener = false;
  };
  const updateWindowScrollListener = (visible: boolean) => {
    if (foundation.shouldListenForScroll(visible)) {
      if (!windowListener) {
        const element = document.documentElement;
        windowScrollPosition = [element.scrollTop, element.scrollLeft];
        on(window, 'scroll', onWindowScroll);
        windowListener = true;
      }
    } else if (windowListener) {
      removeWindowScroll();
    }
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
    targetWidth.value = firstElement.value?.getBoundingClientRect().width ?? 0;
    handleResize();
    emit('resize');
  };
  const handlePopupMouseDown = foundation.popupMouseDown;
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
  watch(
    [
      computedVisible,
      () => props.updateAtScroll || configCtx?.updateAtScroll,
      () => props.scrollToClose || configCtx?.scrollToClose,
      firstElement,
    ],
    ([value, updateAtScroll, scrollToClose]) => {
      updateWindowScrollListener(value);
      if (scrollElements) {
        for (const item of scrollElements) item.removeEventListener('scroll', handleScroll);
        scrollElements = undefined;
      }
      scrollPositions = new WeakMap();
      if (value && (updateAtScroll || scrollToClose)) {
        scrollElements = getScrollElements(firstElement.value);
        for (const item of scrollElements) {
          scrollPositions.set(item, [item.scrollTop, item.scrollLeft]);
          item.addEventListener('scroll', handleScroll);
        }
      }
      if (value) mounted.value = true;
    },
    { flush: 'post' },
  );
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
    }
  });
  onDeactivated(() => changeVisible(false));
  onBeforeUnmount(() => {
    cleanDelayTimer();
    triggerCtx?.removeChildRef(popupRef.value as HTMLElement);
    destroyResizeObserver();
    if (windowListener) removeWindowScroll();
    if (scrollElements) {
      for (const item of scrollElements) item.removeEventListener('scroll', handleScroll);
      scrollElements = undefined;
    }
  });
  const isAnimation = ref(false);
  const onAnimationStart = foundation.animationStart;
  const handleShow = foundation.show;
  const handleHide = foundation.hide;
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
  const popupElementAttrs = computed<Record<string, unknown>>(() =>
    mergeProps(
      {
        'id': popupId,
        'class': [`${prefixCls}-popup`, `${prefixCls}-position-${popupPosition.value}`],
        'style': {
          ...mergedPopupStyle.value,
          ...(isPositioned.value && !referenceHidden.value && !parentPopupHidden.value
            ? {}
            : { visibility: 'hidden' }),
          zIndex: zIndex.value,
          pointerEvents: isAnimation.value ? 'none' : undefined,
        },
        'trigger-placement': popupPosition.value,
      },
      popupAttrs.value,
    ),
  );
  const shouldRenderPopup = computed(() => foundation.shouldRenderPopup(hidePopup.value));
</script>
