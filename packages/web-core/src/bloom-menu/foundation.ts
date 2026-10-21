import type {
  BloomMenuItem,
  BloomMenuOffset,
  TriggerStyleSnapshot,
  BloomMenuMotionTarget,
  BloomMenuTransition,
  BloomMenuCenterState,
} from './types.js';
export function getBloomMenuInitialState(modelValue: boolean | undefined, defaultOpen: boolean) {
  return {
    internalOpen: defaultOpen,
    popupVisible: modelValue ?? defaultOpen,
    triggerStyle: {
      width: 144,
      height: 44,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderRadius: '16px',
      boxShadow: 'none',
      color: 'currentColor',
    },
  };
}
export interface BloomMenuFoundationState<Item extends BloomMenuItem> {
  readonly props: {
    readonly items: readonly Item[];
    readonly columns: number;
    readonly modelValue: boolean | undefined;
    readonly offset: BloomMenuOffset | undefined;
  };
  readonly prefixCls: string;
  readonly buttonElement: HTMLElement | undefined;
  readonly panelElement: HTMLElement | undefined;
  readonly hasCustomTrigger: boolean;
  readonly reducedMotion: boolean | null | undefined;
  readonly normalizedColumns: number;
  readonly rowCount: number;
  readonly isOpen: boolean;
  readonly panelCollapsed: BloomMenuMotionTarget;
  readonly panelAnimate: BloomMenuMotionTarget;
  internalOpen: boolean;
  popupVisible: boolean;
  triggerStyle: TriggerStyleSnapshot;
}
export function createBloomMenuFoundation<Item extends BloomMenuItem>(
  state: BloomMenuFoundationState<Item>,
  callbacks: {
    afterRender(task: () => void): void;
    requestFrame(task: () => void): void;
    update(value: boolean): void;
    opened(): void;
    closed(): void;
    select(item: Item, index: number): void;
  },
) {
  let closeTimer = 0;

  function getNormalizedColumns() {
    return Math.max(1, Math.floor(state.props.columns));
  }

  function getRowCount() {
    return Math.max(1, Math.ceil(state.props.items.length / state.normalizedColumns));
  }

  function getIsOpen() {
    return state.props.modelValue ?? state.internalOpen;
  }

  function getCenterMiddleware() {
    const left = state.props.offset?.left ?? 0;
    const top = state.props.offset?.top ?? 0;
    return {
      name: 'bloomMenuCenter',
      options: { left, top },
      fn: ({ rects }: BloomMenuCenterState) => ({
        x: rects.reference.x + (rects.reference.width - rects.floating.width) / 2 + left,
        y: rects.reference.y + (rects.reference.height - rects.floating.height) / 2 + top,
      }),
    };
  }

  function getPanelCollapsed() {
    return state.reducedMotion
      ? {}
      : {
          width: 'var(--bloom-menu-source-width)',
          height: 'var(--bloom-menu-source-height)',
          color: 'var(--bloom-menu-source-color)',
          backgroundColor: 'var(--bloom-menu-source-background)',
          borderColor: 'var(--bloom-menu-source-border-color)',
          borderRadius: 'var(--bloom-menu-source-border-radius)',
          boxShadow: 'var(--bloom-menu-source-box-shadow)',
          opacity: 0.98,
        };
  }

  function getPanelInitial() {
    return {
      ...state.panelCollapsed,
      opacity: state.reducedMotion ? 0 : 0.98,
    };
  }

  function getPanelAnimate() {
    return {
      width: 'var(--bloom-menu-panel-width)',
      height: 'auto',
      color: 'var(--bloom-menu-panel-color)',
      backgroundColor: 'var(--bloom-menu-panel-background)',
      borderColor: 'var(--bloom-menu-panel-border-color)',
      borderRadius: 'var(--bloom-menu-panel-border-radius)',
      boxShadow: 'var(--bloom-menu-panel-shadow)',
      opacity: 1,
    };
  }

  function getPanelTarget() {
    return state.reducedMotion
      ? { ...state.panelAnimate, opacity: state.isOpen ? 1 : 0 }
      : state.isOpen
        ? state.panelAnimate
        : state.panelCollapsed;
  }

  function getMorphTransition(): BloomMenuTransition {
    return state.reducedMotion
      ? { duration: 0.15 }
      : { type: 'spring', stiffness: 320, damping: 28, mass: 0.9 };
  }

  function getContentTransition(): BloomMenuTransition {
    return {
      delay: state.isOpen && !state.reducedMotion ? 0.12 : 0,
      duration: state.reducedMotion ? 0.15 : state.isOpen ? 0.2 : 0.12,
    };
  }

  function getGridInitial(): false | { clipPath: string } {
    return state.reducedMotion ? false : { clipPath: 'inset(45% 34% 45% 34%)' };
  }

  function getGridTransition(): BloomMenuTransition {
    return {
      delay: state.reducedMotion ? 0 : 0.08,
      duration: state.reducedMotion ? 0.15 : 0.45,
      ease: [0.16, 1, 0.3, 1],
    };
  }

  function getTriggerElement(event?: Event): HTMLElement | undefined {
    if (event?.currentTarget instanceof HTMLElement) return event.currentTarget;
    const buttonEl = state.buttonElement;
    if (!state.hasCustomTrigger) return buttonEl;
    // 自定义 trigger 插槽：morph 源取插槽根元素（实际可见的触发器），
    // 而不是回退到硬编码的 144×44 默认快照
    const slotRoot = buttonEl?.querySelector<HTMLElement>(
      `:scope .${state.prefixCls}-trigger-content > *`,
    );
    return slotRoot ?? buttonEl;
  }

  function captureTriggerStyle(event?: Event) {
    const element = getTriggerElement(event);
    if (!element || typeof window === 'undefined') return;

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    state.triggerStyle = {
      width: rect.width,
      height: rect.height,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      color: style.color,
    };
  }

  function setOpen(nextOpen: boolean) {
    if (nextOpen === state.isOpen) return;
    if (state.props.modelValue === undefined) state.internalOpen = nextOpen;
    callbacks.update(nextOpen);
    if (nextOpen) callbacks.opened();
    else callbacks.closed();
  }

  function handlePopupVisibleChange(visible: boolean) {
    if (visible) {
      const reopening = state.isOpen && !state.popupVisible;
      // 受控开启被父级忽略后 popupVisible 可能被强制复位过，这里同步回来
      window.clearTimeout(closeTimer);
      captureTriggerStyle();
      setOpen(true);
      if (state.isOpen) {
        state.popupVisible = true;
        if (reopening) focusPanel();
      }
    } else {
      // popup 即将卸载,若焦点在面板内(Esc 关闭)则还给触发器,避免焦点丢失
      if (
        document.activeElement instanceof HTMLElement &&
        state.panelElement?.contains(document.activeElement)
      ) {
        focusTrigger();
      }
      setOpen(false);
      if (state.props.modelValue !== undefined && state.isOpen) {
        // 强制受控开启：父级忽略 update:modelValue(false) 时 Trigger 已在关闭，
        // 内部 popupVisible 必须同步复位，避免 Trigger 与内部弹层状态失同步
        state.popupVisible = false;
        window.clearTimeout(closeTimer);
      }
    }
  }

  function schedulePopupHide() {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(
      () => {
        if (!state.isOpen) state.popupVisible = false;
      },
      state.reducedMotion ? 150 : 450,
    );
  }

  function open() {
    captureTriggerStyle();
    setOpen(true);
  }

  function focusTrigger() {
    state.buttonElement?.focus();
  }

  function close(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) callbacks.afterRender(focusTrigger);
  }

  // header 插槽的 close 需要稳定包装：直接把 close 传给 @click 时 MouseEvent
  // 会漏进 restoreFocus 参数（truthy 恰好无害，但签名失真），这里固定为关闭并还焦点
  function closeHeaderSlot() {
    close(true);
  }

  function focusPanel(attempt = 0) {
    callbacks.afterRender(() => {
      if (!state.isOpen || !state.popupVisible) return;
      const firstItem = state.panelElement?.querySelector<HTMLButtonElement>(
        `.${state.prefixCls}-item:not(:disabled)`,
      );
      const closeButton = state.panelElement?.querySelector<HTMLButtonElement>(
        `.${state.prefixCls}-close`,
      );
      const target = firstItem ?? closeButton;

      // defaultOpen 时 popup 挂在 ClientOnly 内尚未渲染;内容 Motion 从 opacity:0 淡入,
      // opacity 为 0 时 motion 会置 visibility:hidden,此时 focus() 会静默失败。
      // 两种情况都等就绪后再聚焦
      if (!target || getComputedStyle(target).visibility === 'hidden') {
        if (attempt < 30) callbacks.requestFrame(() => focusPanel(attempt + 1));
        return;
      }
      target.focus();
    });
  }

  function selectItem(item: Item, index: number) {
    if (item.disabled) return;
    callbacks.select(item, index);
    close(true);
  }

  function getItemInitial() {
    return state.reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, filter: 'blur(6px)' };
  }

  function getItemTransition(index: number): BloomMenuTransition {
    const column = index % state.normalizedColumns;
    const row = Math.floor(index / state.normalizedColumns);
    const distance = Math.hypot(
      column - (state.normalizedColumns - 1) / 2,
      row - (state.rowCount - 1) / 2,
    );

    return {
      delay: state.reducedMotion ? 0 : 0.1 + distance * 0.07,
      type: 'spring',
      stiffness: 440,
      damping: 34,
    };
  }

  function syncOpen(openState: boolean) {
    if (typeof window === 'undefined') return;
    if (!openState) {
      schedulePopupHide();
      return;
    }
    window.clearTimeout(closeTimer);
    state.popupVisible = true;
    captureTriggerStyle();
    // 不依赖 Trigger 的 @show:animation-name 置空后其 Transition 的
    // after-enter 不会触发,@show 永远不发出
    focusPanel();
  }

  function getItemLayout(item: Item, index: number) {
    const column = index % state.normalizedColumns,
      row = Math.floor(index / state.normalizedColumns);
    return {
      borderRight: column < state.normalizedColumns - 1,
      borderBottom: row < state.rowCount - 1,
      disabled: item.disabled,
    };
  }
  function dispose() {
    window.clearTimeout(closeTimer);
  }

  return {
    getNormalizedColumns,
    getRowCount,
    getIsOpen,
    getCenterMiddleware,
    getPanelCollapsed,
    getPanelInitial,
    getPanelAnimate,
    getPanelTarget,
    getMorphTransition,
    getContentTransition,
    getGridInitial,
    getGridTransition,
    getTriggerElement,
    captureTriggerStyle,
    setOpen,
    handlePopupVisibleChange,
    schedulePopupHide,
    open,
    focusTrigger,
    close,
    closeHeaderSlot,
    focusPanel,
    selectItem,
    getItemInitial,
    getItemTransition,
    getItemLayout,
    syncOpen,
    dispose,
  };
}
