import type { TriggerEvent } from '../_utils/constant.js';

import { KEYBOARD_KEY } from '../_utils/keyboard.js';

export interface TriggerOptions {
  disabled: boolean;
  alignPoint: boolean;
  clickToClose: boolean;
  blurToClose: boolean;
  clickOutsideToClose: boolean;
  escToClose: boolean;
  mouseEnterDelay: number;
  mouseLeaveDelay: number;
  focusDelay: number;
  preventFocus: boolean;
  unmountOnClose: boolean;
  scrollToCloseDistance: number;
}
export interface TriggerAdapter {
  readonly options: TriggerOptions;
  readonly visible: boolean;
  readonly methods: TriggerEvent[];
  readonly scrollToClose: boolean;
  readonly mounted: boolean;
  setVisible(visible: boolean): void;
  onVisible(visible: boolean): void;
  afterOpen(): void;
  resetScroll(): void;
  setMousePosition(top: number, left: number): void;
  setTimer(callback: () => void, delay: number): number;
  clearTimer(timer: number): void;
  onNativeClick(event: MouseEvent): void;
  onNativeMouseenter(event: MouseEvent): void;
  onNativeMouseleave(event: MouseEvent): void;
  onNativeFocusin(event: FocusEvent): void;
  onNativeFocusout(event: FocusEvent): void;
  onNativeContextmenu(event: MouseEvent): void;
  isInsidePopupOrChildren(event: MouseEvent): boolean;
  setAnimation(value: boolean): void;
  setMounted(value: boolean): void;
  onShow(): void;
  onHide(): void;
}
export function createTriggerFoundation(adapter: TriggerAdapter) {
  let delayTimer = 0;
  const cleanDelayTimer = () => {
    if (delayTimer) {
      adapter.clearTimer(delayTimer);
      delayTimer = 0;
    }
  };
  const updateMousePosition = (event: MouseEvent) => {
    if (adapter.options.alignPoint) {
      adapter.setMousePosition(event.clientY, event.clientX);
    }
  };
  const changeVisible = (visible: boolean, delay?: number) => {
    if (visible === adapter.visible && delayTimer === 0) return;
    cleanDelayTimer();
    const update = () => {
      adapter.setVisible(visible);
      adapter.onVisible(visible);
      if (visible) adapter.afterOpen();
    };
    if (!visible) {
      adapter.resetScroll();
    }
    if (delay) {
      if (visible !== adapter.visible) delayTimer = adapter.setTimer(update, delay);
    } else {
      update();
    }
  };
  const handleClick = (event: MouseEvent) => {
    adapter.onNativeClick(event);
    if (adapter.options.disabled || (adapter.visible && !adapter.options.clickToClose)) return;
    if (adapter.methods.includes('click')) {
      updateMousePosition(event);
      changeVisible(!adapter.visible);
    } else if (adapter.methods.includes('contextMenu') && adapter.visible) {
      changeVisible(false);
    }
  };
  const handleMouseEnter = (event: MouseEvent) => {
    adapter.onNativeMouseenter(event);
    if (adapter.options.disabled || !adapter.methods.includes('hover')) return;
    updateMousePosition(event);
    changeVisible(true, adapter.options.mouseEnterDelay);
  };
  const handleMouseLeave = (event: MouseEvent) => {
    adapter.onNativeMouseleave(event);
    if (adapter.options.disabled || !adapter.methods.includes('hover')) return;
    changeVisible(false, adapter.options.mouseLeaveDelay);
  };
  const handleFocusin = (event: FocusEvent) => {
    adapter.onNativeFocusin(event);
    if (!adapter.options.disabled && adapter.methods.includes('focus')) {
      changeVisible(true, adapter.options.focusDelay);
    }
  };
  const handleFocusout = (event: FocusEvent) => {
    adapter.onNativeFocusout(event);
    if (
      !adapter.options.disabled &&
      adapter.methods.includes('focus') &&
      adapter.options.blurToClose
    ) {
      changeVisible(false);
    }
  };
  const handleContextmenu = (event: MouseEvent) => {
    adapter.onNativeContextmenu(event);
    if (
      adapter.options.disabled ||
      !adapter.methods.includes('contextMenu') ||
      (adapter.visible && !adapter.options.clickToClose)
    )
      return;
    updateMousePosition(event);
    changeVisible(!adapter.visible);
    event.preventDefault();
  };

  function outsideClick() {
    if (adapter.options.clickOutsideToClose && adapter.visible) changeVisible(false);
  }
  function outsideContextmenu(event: MouseEvent) {
    if (!adapter.options.clickOutsideToClose || !adapter.visible) return;
    if (!adapter.methods.includes('contextMenu')) return;
    if (adapter.isInsidePopupOrChildren(event)) return;
    changeVisible(false);
  }
  function keydown(event: KeyboardEvent) {
    if (adapter.options.escToClose && adapter.visible && event.key === KEYBOARD_KEY.ESC)
      changeVisible(false);
  }
  function popupMouseDown(event: Event) {
    if (adapter.options.preventFocus) event.preventDefault();
  }
  function isExceedThreshold(
    previous: [number, number],
    current: { scrollTop: number; scrollLeft: number },
  ) {
    return (
      Math.abs(current.scrollTop - previous[0]) >= adapter.options.scrollToCloseDistance ||
      Math.abs(current.scrollLeft - previous[1]) >= adapter.options.scrollToCloseDistance
    );
  }
  function shouldListenForScroll(visible: boolean) {
    return visible && adapter.scrollToClose;
  }
  function animationStart() {
    adapter.setAnimation(true);
  }
  function show() {
    adapter.setAnimation(false);
    if (adapter.visible) adapter.onShow();
  }
  function hide() {
    adapter.setAnimation(false);
    if (!adapter.visible) {
      adapter.setMounted(false);
      adapter.onHide();
    }
  }
  function shouldRenderPopup(hidden: boolean) {
    return (!adapter.options.unmountOnClose || adapter.visible || adapter.mounted) && !hidden;
  }
  return {
    changeVisible,
    cleanDelayTimer,
    click: handleClick,
    mouseenter: handleMouseEnter,
    mouseleave: handleMouseLeave,
    focusin: handleFocusin,
    focusout: handleFocusout,
    contextmenu: handleContextmenu,
    outsideClick,
    outsideContextmenu,
    keydown,
    popupMouseDown,
    isExceedThreshold,
    shouldListenForScroll,
    animationStart,
    show,
    hide,
    shouldRenderPopup,
  };
}
