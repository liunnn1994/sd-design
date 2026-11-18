export type EllipsisInteraction = 'hover' | 'focus' | 'click';
export interface PerformantEllipsisState {
  activated: boolean;
  readonly expandTrigger: 'click' | undefined;
  readonly triggerElement: HTMLElement | undefined;
  afterRender: () => Promise<unknown>;
  waitForMeasurement: () => Promise<void> | undefined;
  toggleExpanded: () => void;
  replayHover?: (element: HTMLElement) => void;
  dispatchFocus?: (element: HTMLElement, focused: boolean) => void;
}
export function createPerformantEllipsisFoundation(state: PerformantEllipsisState) {
  const getActivatedTriggerElement = () => state.triggerElement;

  const replayInteraction = (type?: 'hover' | 'focus' | 'click') => {
    const triggerElement = getActivatedTriggerElement();
    if (!triggerElement || !type) {
      return;
    }

    if (type === 'hover') {
      if (!triggerElement.matches(':hover')) return;
      if (state.replayHover) {
        state.replayHover(triggerElement);
        return;
      }
      triggerElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      triggerElement.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
      return;
    }

    if (type === 'focus') {
      triggerElement.focus();
      return;
    }

    state.toggleExpanded();
  };

  let activationPending = false;
  let pendingInteraction: EllipsisInteraction | undefined;
  const activate = async (interactionType?: 'hover' | 'focus' | 'click') => {
    if (state.activated) {
      if (activationPending && interactionType === 'click') pendingInteraction = 'click';
      return;
    }

    activationPending = true;
    pendingInteraction = interactionType;
    state.activated = true;
    try {
      await state.afterRender();
      await state.afterRender();
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      // 等 RichLineClamp 首次测量稳定（带真实内容的 clampchange 到达）后再回放交互，
      // 否则 hover 的 tooltip / click 的展开判定会读到未就绪的 clamp 状态。
      const measurement = state.waitForMeasurement();
      if (measurement) {
        await measurement;
      }

      replayInteraction(pendingInteraction);
    } finally {
      activationPending = false;
    }
  };

  const handleMouseenter = () => {
    void activate('hover');
  };

  const handleFocus = () => {
    void activate('focus');
  };

  // 组合组件的原生控件保留焦点，仅把聚焦交互转交给省略提示。
  let externallyFocused = false;
  const setFocused = async (focused: boolean) => {
    externallyFocused = focused;
    if (focused) {
      await activate();
      await state.afterRender();
      await state.waitForMeasurement();
    }
    if (externallyFocused !== focused) return;
    const element = getActivatedTriggerElement();
    if (!element) return;
    if (state.dispatchFocus) state.dispatchFocus(element, focused);
    else element.dispatchEvent(new FocusEvent(focused ? 'focusin' : 'focusout'));
  };

  const handleClick = (event: Pick<MouseEvent, 'target' | 'currentTarget'>) => {
    const target = event.target;
    const interactive =
      target instanceof Element
        ? target.closest('a,button,input,textarea,select,[role="button"]')
        : null;
    const isInnerControl = interactive && interactive !== event.currentTarget;
    void activate(state.expandTrigger === 'click' && !isInnerControl ? 'click' : undefined);
  };
  return { activate, replayInteraction, handleMouseenter, handleFocus, handleClick, setFocused };
}
