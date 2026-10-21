export type EllipsisInteraction = 'hover' | 'focus' | 'click';
export interface PerformantEllipsisState {
  activated: boolean;
  readonly expandTrigger: 'click' | undefined;
  readonly triggerElement: HTMLElement | undefined;
  afterRender: () => Promise<unknown>;
  waitForMeasurement: () => Promise<void> | undefined;
  toggleExpanded: () => void;
}
export function createPerformantEllipsisFoundation(state: PerformantEllipsisState) {
  const getActivatedTriggerElement = () => state.triggerElement;

  const replayInteraction = (type?: 'hover' | 'focus' | 'click') => {
    const triggerElement = getActivatedTriggerElement();
    if (!triggerElement || !type) {
      return;
    }

    if (type === 'hover') {
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

  const activate = async (interactionType?: 'hover' | 'focus' | 'click') => {
    if (state.activated) {
      return;
    }

    state.activated = true;
    await state.afterRender();
    await state.afterRender();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    // 等 RichLineClamp 首次测量稳定（带真实内容的 clampchange 到达）后再回放交互，
    // 否则 hover 的 tooltip / click 的展开判定会读到未就绪的 clamp 状态。
    const measurement = state.waitForMeasurement();
    if (measurement) {
      await measurement;
    }

    replayInteraction(interactionType);
  };

  const handleMouseenter = () => {
    void activate('hover');
  };

  const handleFocus = () => {
    void activate('focus');
  };

  const handleClick = (event: MouseEvent) => {
    const target = event.target;
    const interactive =
      target instanceof Element
        ? target.closest('a,button,input,textarea,select,[role="button"]')
        : null;
    const isInnerControl = interactive && interactive !== event.currentTarget;
    void activate(state.expandTrigger === 'click' && !isInnerControl ? 'click' : undefined);
  };
  return { activate, replayInteraction, handleMouseenter, handleFocus, handleClick };
}
