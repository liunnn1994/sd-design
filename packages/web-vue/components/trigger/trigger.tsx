import type { Middleware, Placement, ReferenceElement, VirtualElement } from '@floating-ui/vue';
import type { Simplify } from 'type-fest';

import type { PropType, CSSProperties, Ref, ComponentPublicInstance } from 'vue';
import {
  defineComponent,
  getCurrentInstance,
  ref,
  reactive,
  computed,
  nextTick,
  watch,
  inject,
  provide,
  Teleport,
  Transition,
  onMounted,
  onBeforeUnmount,
  onDeactivated,
} from 'vue';

import { arrow, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue';
import { onClickOutside, useEventListener } from '@vueuse/core';

import type { TriggerEvent, TriggerPosition } from '../_utils/constant';
import type { FloatingOptions } from '../_utils/floating';

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
import { TriggerPopupTranslate } from './interface';
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
  onClick?: (e: MouseEvent) => void;
  onMouseenter?: (e: MouseEvent) => void;
  onMouseleave?: (e: MouseEvent) => void;
  onFocusin?: (e: FocusEvent) => void;
  onFocusout?: (e: FocusEvent) => void;
  onContextmenu?: (e: MouseEvent) => void;
}>;

type ChildRef = Ref<HTMLElement | undefined> | HTMLElement;

const toFloatingPlacement = (position: TriggerPosition): Placement => {
  const placementMap: Record<TriggerPosition, Placement> = {
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
  return placementMap[position];
};

const fromFloatingPlacement = (placement: Placement): TriggerPosition => {
  const placementMap: Record<Placement, TriggerPosition> = {
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
  return placementMap[placement];
};

const getArrowFloatingStyle = (
  placement: Placement,
  data: { x?: number; y?: number } | undefined,
  customStyle: CSSProperties | undefined,
): CSSProperties => {
  const side = placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[side];
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

export default defineComponent({
  name: 'Trigger',
  inheritAttrs: false,
  props: {
    /**
     * @zh Floating UI Vue 的完整配置。与旧定位参数冲突时以此配置为准。
     * @en Complete Floating UI Vue options. These options take precedence over legacy positioning props.
     */
    floatingOptions: {
      type: Object as PropType<FloatingOptions>,
    },
    /**
     * @zh 弹出框是否可见
     * @en Whether the popup is visible
     * @vModel
     */
    popupVisible: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 弹出框默认是否可见（非受控模式）
     * @en Whether the popup is visible by default (uncontrolled mode)
     */
    defaultPopupVisible: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 触发方式
     * @en Trigger method
     * @values 'hover','click','focus','contextMenu'
     */
    trigger: {
      type: [String, Array] as PropType<TriggerEvent | TriggerEvent[]>,
      default: 'hover',
    },
    /**
     * @zh 弹出位置
     * @en Popup position
     * @values 'top','tl','tr','bottom','bl','br','left','lt','lb','right','rt','rb'
     */
    position: {
      type: String as PropType<TriggerPosition>,
      default: 'bottom',
    },
    /**
     * @zh 触发器是否禁用
     * @en Whether the trigger is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 弹出框的偏移量（弹出框距离触发器的偏移距离）
     * @en The offset of the popup (the offset distance of the popup from the trigger)
     */
    popupOffset: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 弹出框的移动距离
     * @en The moving distance of the popup
     */
    popupTranslate: {
      type: [Array, Object] as PropType<TriggerPopupTranslate>,
    },
    /**
     * @zh 弹出框是否显示箭头
     * @en Whether the popup shows an arrow
     */
    showArrow: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 弹出框是否跟随鼠标
     * @en Whether the popup follows the mouse
     */
    alignPoint: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否在移出触发器，并移入弹出框时保持弹出框显示
     * @en Whether to keep the popup displayed when the trigger is moved out and moved into the popup
     */
    popupHoverStay: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否在触发器失去焦点时关闭弹出框
     * @en Whether to close the popup when the trigger loses focus
     */
    blurToClose: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否在点击触发器时关闭弹出框
     * @en Whether to close the popup when the trigger is clicked
     */
    clickToClose: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否在点击外部区域时关闭弹出框
     * @en Whether to close the popup when clicking on the outer area
     */
    clickOutsideToClose: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否在关闭时卸载弹出框节点
     * @en Whether to uninstall the popup node when closing
     */
    unmountOnClose: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 弹出框内容的类名
     * @en The class name of the popup content
     */
    contentClass: {
      type: [String, Array, Object],
    },
    /**
     * @zh 弹出框内容的样式
     * @en The style of the popup content
     */
    contentStyle: {
      type: Object as PropType<CSSProperties>,
    },
    /**
     * @zh 弹出框箭头的类名
     * @en The class name of the popup arrow
     */
    arrowClass: {
      type: [String, Array, Object],
    },
    /**
     * @zh 弹出框箭头的样式
     * @en The style of the popup arrow
     */
    arrowStyle: {
      type: Object as PropType<CSSProperties>,
    },
    /**
     * @zh 弹出框的样式
     * @en The style of the popup
     */
    popupStyle: {
      type: Object as PropType<CSSProperties>,
    },
    /**
     * @zh 弹出动画的name
     * @en The name of the popup animation
     */
    animationName: {
      type: String,
      default: 'fade-in',
    },
    /**
     * @zh 弹出动画的持续时间
     * @en The duration of the popup animation
     */
    duration: {
      type: [Number, Object] as PropType<
        | number
        | {
            enter: number;
            leave: number;
          }
      >,
    },
    /**
     * @zh mouseenter事件延时触发的时间（毫秒）
     * @en Delay trigger time of mouseenter event (ms)
     */
    mouseEnterDelay: {
      type: Number,
      default: 100,
    },
    /**
     * @zh mouseleave事件延时触发的时间（毫秒）
     * @en Delay trigger time of mouseleave event (ms)
     */
    mouseLeaveDelay: {
      type: Number,
      default: 100,
    },
    /**
     * @zh focus事件延时触发的时间（毫秒）
     * @en Delay trigger time of focus event (ms)
     */
    focusDelay: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 是否将弹出框宽度设置为触发器宽度
     * @en Whether to set the width of the popup to the width of the trigger
     */
    autoFitPopupWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否将弹出框的最小宽度设置为触发器宽度
     * @en Whether to set the minimum width of the popup to the trigger width
     */
    autoFitPopupMinWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 当触发器的尺寸发生变化时，是否重新计算弹出框位置
     * @en When the size of the trigger changes, whether to recalculate the position of the popup
     */
    autoFixPosition: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 弹出框的挂载容器
     * @en Mount container for popup
     */
    popupContainer: {
      type: [String, Object] as PropType<string | HTMLElement>,
    },
    /**
     * @zh 是否在容器滚动时更新弹出框的位置
     * @us Whether to update the position of the popup when the container is scrolled
     */
    updateAtScroll: {
      type: Boolean,
      default: false,
    },
    autoFitTransformOrigin: {
      type: Boolean,
      default: false,
    },
    hideEmpty: {
      type: Boolean,
      default: false,
    },
    openedClass: {
      type: [String, Array, Object],
    },
    /**
     * @zh 是否自动调整弹出框位置，以适应窗口大小
     * @en Whether to automatically adjust the position of the popup to fit the window size
     */
    autoFitPosition: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否挂载在 `body` 元素下
     * @en Whether to mount under the `body` element
     */
    renderToBody: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否阻止弹出层中的元素点击时获取焦点
     * @en Whether to prevent elements in the pop-up layer from gaining focus when clicked
     */
    preventFocus: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否在滚动时关闭弹出框
     * @en Whether to close the popover when scrolling
     * @version 2.46.0
     */
    scrollToClose: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 滚动阈值，当滚动距离超过该值时触发关闭
     * @en Scroll threshold, trigger close when the scroll distance exceeds this value
     */
    scrollToCloseDistance: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 是否支持 ESC 键关闭弹出层
     * @en Whether to close the popup with the ESC key
     */
    escToClose: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 弹出层类型，用于触发器的 `aria-haspopup`。设置后会自动给触发器加 `aria-haspopup` / `aria-expanded` / `aria-controls`，并给弹出层加 id。
     * @en Popup type for the trigger's `aria-haspopup`. When set, the trigger automatically gets `aria-haspopup` / `aria-expanded` / `aria-controls`, and the popup gets an id.
     * @values true, 'menu', 'listbox', 'tree', 'grid', 'dialog'
     */
    ariaHasPopup: {
      type: [Boolean, String] as PropType<
        boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
      >,
      default: undefined,
    },
    /**
     * @zh 是否给触发器加 `aria-describedby` 指向弹出层（tooltip 模式用）。弹出层显示时才挂。
     * @en Whether to add `aria-describedby` on the trigger pointing to the popup (tooltip pattern). Only applied while the popup is visible.
     */
    ariaDescribedbyPopup: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:popupVisible': (_visible: boolean) => true,
    /**
     * @zh 弹出框显示状态改变时触发
     * @en Emitted when the status of the popup changes
     * @param {boolean} visible
     */
    'popupVisibleChange': (_visible: boolean) => true,
    /**
     * @zh 弹出框显示后（动画结束）触发
     * @en Triggered after the trigger is shown (the animation ends)
     * @version 2.18.0
     */
    'show': () => true,
    /**
     * @zh 弹出框隐藏后（动画结束）触发
     * @en Triggered after the popup is hidden (the animation ends)
     * @version 2.18.0
     */
    'hide': () => true,
    // for internal
    'resize': () => true,
  },
  /**
   * @zh 弹出框内容
   * @en Popup content
   * @slot content
   */
  setup(props, { emit, slots, attrs }) {
    const triggerEventAttrs = attrs as TriggerEventAttrs;
    const prefixCls = getPrefixCls('trigger');
    const instance = getCurrentInstance()!;
    const popupId = `${prefixCls}-popup-${instance.uid}`;
    const popupAttrs = computed(() => omit(attrs, TRIGGER_EVENTS));
    const configCtx = inject(configProviderInjectionKey, undefined);
    const themePopupContainer = inject(themePopupContainerInjectionKey, undefined);
    const mergedPopupContainer = computed(() => {
      return props.popupContainer ?? themePopupContainer?.value;
    });

    const triggerMethods = computed(() => ([] as Array<TriggerEvent>).concat(props.trigger));
    // 用于多个trigger嵌套时，保持打开状态
    const childrenRefs = new Set<ChildRef>();
    const triggerCtx = inject(triggerInjectionKey, undefined);
    // trigger相关变量
    const { children, firstElement } = useFirstElement();
    // popup相关变量
    const popupRef = ref<HTMLElement>();
    const popupVisible = ref(props.defaultPopupVisible);
    const popupPosition = ref(props.position);
    // 鼠标相关变量
    const arrowRef = ref<HTMLElement>();
    const mousePosition = ref({
      top: 0,
      left: 0,
    });

    let scrollPosition: [number, number] | null = null;
    let windowScrollPosition: [number, number] | null = null;

    const computedVisible = computed(() => props.popupVisible ?? popupVisible.value);
    const pointReference: VirtualElement = {
      getBoundingClientRect: () => {
        const { left, top } = mousePosition.value;
        return {
          x: left,
          y: top,
          top,
          right: left,
          bottom: top,
          left,
          width: 0,
          height: 0,
        };
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
      if (props.autoFitPosition) {
        middleware.push(flip(), shift());
      }
      if (props.showArrow) {
        middleware.push(arrow({ element: arrowRef }));
      }

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

    // 当指定 ariaHasPopup 时，自动给触发器加 aria-haspopup/expanded/controls（弹出层 id 互连）
    const firstChildAria = computed(() => {
      const aria: Record<string, unknown> = {};
      if (props.ariaHasPopup !== undefined) {
        aria['aria-haspopup'] = props.ariaHasPopup === true ? 'true' : props.ariaHasPopup;
        aria['aria-expanded'] = computedVisible.value;
        aria['aria-controls'] = computedVisible.value ? popupId : undefined;
      }
      // tooltip 模式：弹出层显示时，触发器 aria-describedby 指向弹出层
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

    const updateMousePosition = (e: MouseEvent) => {
      if (props.alignPoint) {
        const { clientX, clientY } = e;
        mousePosition.value = {
          top: clientY,
          left: clientX,
        };
      }
    };

    const changeVisible = (visible: boolean, delay?: number) => {
      if (visible === computedVisible.value && delayTimer === 0) {
        return;
      }

      const update = () => {
        popupVisible.value = visible;
        emit('update:popupVisible', visible);
        emit('popupVisibleChange', visible);
        if (visible) {
          nextTick(() => {
            updateFloatingPosition();
          });
        }
      };

      if (!visible) {
        scrollPosition = null;
        windowScrollPosition = null;
      }

      if (delay) {
        cleanDelayTimer();
        if (visible !== computedVisible.value) {
          delayTimer = window.setTimeout(update, delay);
        }
      } else {
        update();
      }
    };

    const handleClick = (e: MouseEvent) => {
      triggerEventAttrs.onClick?.(e);
      if (props.disabled || (computedVisible.value && !props.clickToClose)) {
        return;
      }
      if (triggerMethods.value.includes('click')) {
        updateMousePosition(e);
        changeVisible(!computedVisible.value);
      } else if (triggerMethods.value.includes('contextMenu') && computedVisible.value) {
        changeVisible(false);
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      triggerEventAttrs.onMouseenter?.(e);
      if (props.disabled || !triggerMethods.value.includes('hover')) {
        return;
      }
      updateMousePosition(e);
      changeVisible(true, props.mouseEnterDelay);
    };

    const handleMouseEnterWithContext = (e: MouseEvent) => {
      triggerCtx?.onMouseenter(e);
      handleMouseEnter(e);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      triggerEventAttrs.onMouseleave?.(e);
      if (props.disabled || !triggerMethods.value.includes('hover')) {
        return;
      }
      changeVisible(false, props.mouseLeaveDelay);
    };

    const handleMouseLeaveWithContext = (e: MouseEvent) => {
      triggerCtx?.onMouseleave(e);
      handleMouseLeave(e);
    };

    const handleFocusin = (e: FocusEvent) => {
      triggerEventAttrs.onFocusin?.(e);
      if (props.disabled || !triggerMethods.value.includes('focus')) {
        return;
      }
      changeVisible(true, props.focusDelay);
    };

    const handleFocusout = (e: FocusEvent) => {
      triggerEventAttrs.onFocusout?.(e);
      if (props.disabled || !triggerMethods.value.includes('focus')) {
        return;
      }
      if (!props.blurToClose) {
        return;
      }
      changeVisible(false);
    };

    const handleContextmenu = (e: MouseEvent) => {
      triggerEventAttrs.onContextmenu?.(e);
      if (
        props.disabled ||
        !triggerMethods.value.includes('contextMenu') ||
        (computedVisible.value && !props.clickToClose)
      ) {
        return;
      }
      updateMousePosition(e);
      changeVisible(!computedVisible.value);
      e.preventDefault();
    };

    const handleChildContextmenu = (e: MouseEvent) => {
      triggerCtx?.onContextmenu(e);
      if (!props.clickOutsideToClose || !computedVisible.value) return;
      if (!triggerMethods.value.includes('contextMenu')) return;

      const target = e.target as HTMLElement;
      if (popupRef.value?.contains(target)) return;
      if (getChildElements().some((element) => element.contains(target))) return;

      changeVisible(false);
    };

    const handleContextmenuWithContext = (e: MouseEvent) => {
      triggerCtx?.onContextmenu(e);
      handleContextmenu(e);
    };

    const addChildRef = (ref: ChildRef) => {
      childrenRefs.add(ref);
      triggerCtx?.addChildRef(ref as HTMLElement | ComponentPublicInstance);
    };
    const removeChildRef = (ref: ChildRef) => {
      childrenRefs.delete(ref);
      triggerCtx?.removeChildRef(ref as HTMLElement | ComponentPublicInstance);
    };

    // 添加triggerCtx，用于嵌套时保持状态
    provide(
      triggerInjectionKey,
      reactive({
        onMouseenter: handleMouseEnterWithContext,
        onMouseleave: handleMouseLeaveWithContext,
        onContextmenu: handleChildContextmenu,
        addChildRef: addChildRef as (ref: HTMLElement | ComponentPublicInstance) => void,
        removeChildRef: removeChildRef as (ref: HTMLElement | ComponentPublicInstance) => void,
      }),
    );

    const contentSlot = usePickSlots(slots, 'content');

    const hidePopup = computed(() => {
      return props.hideEmpty && isEmptyChildren(contentSlot.value?.());
    });

    const getChildElements = () => {
      const elements: HTMLElement[] = [];
      for (const item of childrenRefs) {
        if (!item) continue;
        const element = 'value' in item ? item.value : item;
        if (element) elements.push(element);
      }

      return elements;
    };

    const getOutsideIgnoreElements = () => [
      ...(triggerMethods.value.includes('contextMenu') || !firstElement.value
        ? []
        : [firstElement.value]),
      ...getChildElements(),
    ];

    onClickOutside(
      popupRef,
      () => {
        if (!props.clickOutsideToClose || !computedVisible.value) return;
        changeVisible(false);
      },
      {
        ignore: getOutsideIgnoreElements,
      },
    );

    const handleOutsideContextmenu = (e: MouseEvent) => {
      if (!props.clickOutsideToClose || !computedVisible.value) return;
      if (!triggerMethods.value.includes('contextMenu')) return;

      const target = e.target as HTMLElement;
      if (popupRef.value?.contains(target)) return;
      if (getChildElements().some((element) => element.contains(target))) return;

      changeVisible(false);
    };

    const documentRef = computed(() => (typeof document === 'undefined' ? undefined : document));

    useEventListener(documentRef, 'contextmenu', handleOutsideContextmenu, { capture: true });

    const handleKeydown = (ev: KeyboardEvent) => {
      if (props.escToClose && computedVisible.value && ev.key === KEYBOARD_KEY.ESC) {
        changeVisible(false);
      }
    };

    useEventListener(documentRef, 'keydown', handleKeydown);

    const isExceedThreshold = (oldPosition: [number, number], element: HTMLElement) => {
      const [scrollTop, scrollLeft] = oldPosition;
      const { scrollTop: newScrollTop, scrollLeft: newScrollLeft } = element;
      return (
        Math.abs(newScrollTop - scrollTop) >= props.scrollToCloseDistance ||
        Math.abs(newScrollLeft - scrollLeft) >= props.scrollToCloseDistance
      );
    };

    // 滚动时的重新定位由 autoUpdate(ancestorScroll) 接管，这里只保留
    // scrollToClose 的阈值关闭逻辑。
    const handleScroll = throttleByRaf((e: Event) => {
      if (computedVisible.value && (props.scrollToClose || configCtx?.scrollToClose)) {
        const element = e.target as HTMLElement;
        if (!scrollPosition) {
          scrollPosition = [element.scrollTop, element.scrollLeft];
        }
        if (isExceedThreshold(scrollPosition, element)) {
          changeVisible(false);
        }
      }
    });

    const removeWindowScroll = () => {
      off(window, 'scroll', onWindowScroll);
      windowListener = false;
    };

    const onWindowScroll = throttleByRaf((e: Event) => {
      const element = (e.target as Document).documentElement;
      if (!windowScrollPosition) {
        windowScrollPosition = [element.scrollTop, element.scrollLeft];
      }
      if (isExceedThreshold(windowScrollPosition, element)) {
        changeVisible(false);
        removeWindowScroll();
      }
    });

    const handleResize = () => {
      if (computedVisible.value) {
        updateFloatingPosition();
      }
    };

    const onTargetResize = () => {
      handleResize();
      emit('resize');
    };

    const handlePopupMouseDown = (e: Event) => {
      if (props.preventFocus) {
        e.preventDefault();
      }
    };

    // Register this popup with the parent trigger so clicks inside it (e.g. a
    // nested Select dropdown) are not treated as outside clicks. popupRef is
    // only assigned after mount, so register/unregister via a watch instead of
    // reading popupRef.value eagerly during setup.
    watch(
      popupRef,
      (el, _oldEl, onCleanup) => {
        if (!el) return;
        triggerCtx?.addChildRef(el);
        onCleanup(() => triggerCtx?.removeChildRef(el));
      },
      { immediate: true },
    );

    const triggerCls = computed(() => {
      return computedVisible.value ? props.openedClass : undefined;
    });

    let scrollElements: HTMLElement[] | undefined;

    watch(computedVisible, (value) => {
      if (props.scrollToClose || configCtx?.scrollToClose) {
        on(window, 'scroll', onWindowScroll);
        windowListener = true;
      }

      if (props.updateAtScroll || configCtx?.updateAtScroll) {
        if (value) {
          scrollElements = getScrollElements(firstElement.value);
          for (const item of scrollElements) {
            item.addEventListener('scroll', handleScroll);
          }
        } else if (scrollElements) {
          for (const item of scrollElements) {
            item.removeEventListener('scroll', handleScroll);
          }
          scrollElements = undefined;
        }
      }

      if (value) {
        mounted.value = true;
      }
    });

    // 影响popup显示的参数变化时，更新popup样式
    watch(
      () => [props.autoFitPopupWidth, props.autoFitPopupMinWidth],
      () => {
        if (computedVisible.value) {
          updateFloatingPosition();
        }
      },
    );

    const { createResizeObserver, destroyResizeObserver } = useResizeObserver({
      elementRef: containerRef,
      onResize: handleResize,
    });

    onMounted(() => {
      createResizeObserver();

      // 默认显示时，更新popup位置
      if (computedVisible.value) {
        updateFloatingPosition();
        if (props.updateAtScroll || configCtx?.updateAtScroll) {
          scrollElements = getScrollElements(firstElement.value);
          for (const item of scrollElements) {
            item.addEventListener('scroll', handleScroll);
          }
        }
      }
    });

    onDeactivated(() => {
      changeVisible(false);
    });

    onBeforeUnmount(() => {
      triggerCtx?.removeChildRef(popupRef.value as HTMLElement);
      destroyResizeObserver();
      if (windowListener) {
        removeWindowScroll();
      }
      if (scrollElements) {
        for (const item of scrollElements) {
          item.removeEventListener('scroll', handleScroll);
        }
        scrollElements = undefined;
      }
    });

    const mounted = ref(computedVisible.value);
    const isAnimation = ref(false);

    const onAnimationStart = () => {
      isAnimation.value = true;
    };

    const handleShow = () => {
      isAnimation.value = false;
      if (computedVisible.value) {
        emit('show');
      }
    };

    const handleHide = () => {
      isAnimation.value = false;
      if (!computedVisible.value) {
        mounted.value = false;
        emit('hide');
      }
    };

    return () => {
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

      return (
        <>
          {props.autoFixPosition ? (
            <ResizeObserver onResize={onTargetResize}>{children.value}</ResizeObserver>
          ) : (
            children.value
          )}
          <ClientOnly>
            <Teleport to={teleportContainer.value} disabled={!props.renderToBody}>
              {(!props.unmountOnClose || computedVisible.value || mounted.value) &&
                !hidePopup.value && (
                  <ResizeObserver onResize={handleResize}>
                    <div
                      id={popupId}
                      ref={popupRef}
                      class={[`${prefixCls}-popup`, `${prefixCls}-position-${popupPosition.value}`]}
                      style={{
                        ...mergedPopupStyle.value,
                        // Floating UI 的定位在微任务里异步算出，首次定位完成前
                        // floatingStyles 会落在视口左上角 (0,0)。用 visibility 而非
                        // display 隐藏：元素仍在布局中可被测量，定位算完后才显形，
                        // 避免开启动画时出现从左上角闪到目标位置的跳变。
                        ...(isPositioned.value ? {} : { visibility: 'hidden' }),
                        zIndex: zIndex.value,
                        pointerEvents: isAnimation.value ? 'none' : 'auto',
                      }}
                      trigger-placement={popupPosition.value}
                      onMouseenter={handleMouseEnterWithContext}
                      onMouseleave={handleMouseLeaveWithContext}
                      onMousedown={handlePopupMouseDown}
                      {...popupAttrs.value}
                    >
                      <Transition
                        name={props.animationName}
                        duration={props.duration}
                        appear
                        onBeforeEnter={onAnimationStart}
                        onAfterEnter={handleShow}
                        onBeforeLeave={onAnimationStart}
                        onAfterLeave={handleHide}
                      >
                        <div
                          class={`${prefixCls}-popup-wrapper`}
                          style={transformStyle.value}
                          v-show={computedVisible.value}
                        >
                          <div
                            class={[`${prefixCls}-content`, props.contentClass]}
                            style={props.contentStyle}
                          >
                            {slots.content?.()}
                          </div>
                          {props.showArrow && (
                            <div
                              ref={arrowRef}
                              class={[`${prefixCls}-arrow`, props.arrowClass]}
                              style={arrowStyle.value}
                            />
                          )}
                        </div>
                      </Transition>
                    </div>
                  </ResizeObserver>
                )}
            </Teleport>
          </ClientOnly>
        </>
      );
    };
  },
});
