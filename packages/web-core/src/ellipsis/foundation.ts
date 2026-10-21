export interface EllipsisFoundationState {
  readonly triggerElement: HTMLElement | undefined;
  readonly expandTrigger: 'click' | undefined;
  readonly tooltipConfig: { disabled?: boolean | undefined; always?: boolean | undefined };
  readonly enableTooltip: boolean;
  measurementHtml: string;
  measurementWidth: number;
  measurementPadding: string;
  text: string;
  isEllipsis: boolean;
  expanded: boolean;
}
export function createEllipsisFoundation(state: EllipsisFoundationState) {
  function isExpandable() {
    return state.expandTrigger === 'click' && (state.isEllipsis || state.expanded);
  }
  function getTooltipDisabled() {
    return (
      state.expanded ||
      Boolean(state.tooltipConfig.disabled) ||
      (!state.isEllipsis && !state.tooltipConfig.always)
    );
  }
  function getNativeTitle() {
    return !state.expanded &&
      (!state.enableTooltip || state.tooltipConfig.disabled) &&
      state.isEllipsis
      ? state.text
      : undefined;
  }
  function syncMeasurement() {
    const triggerElement = state.triggerElement;
    if (!triggerElement) return;

    const clone = triggerElement.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[data-ellipsis-measure]').forEach((probe) => probe.remove());
    const nextHtml = clone.innerHTML;
    const nextText = clone.textContent?.trim() ?? '';
    const computedStyle = window.getComputedStyle(triggerElement);
    const nextPadding = `${computedStyle.paddingTop} ${computedStyle.paddingRight} ${computedStyle.paddingBottom} ${computedStyle.paddingLeft}`;

    if (nextHtml !== state.measurementHtml) state.measurementHtml = nextHtml;
    if (nextText !== state.text) state.text = nextText;
    // 使用缩放前的 fractional 布局宽度：getBoundingClientRect 包含弹窗动画的
    // transform，clientWidth 又会取整，两者都可能让测量副本误报截断。
    const layoutWidth = parseFloat(computedStyle.width);
    const paddingBoxWidth = Number.isFinite(layoutWidth)
      ? layoutWidth +
        (computedStyle.boxSizing === 'border-box'
          ? -(parseFloat(computedStyle.borderLeftWidth) || 0) -
            (parseFloat(computedStyle.borderRightWidth) || 0)
          : (parseFloat(computedStyle.paddingLeft) || 0) +
            (parseFloat(computedStyle.paddingRight) || 0))
      : triggerElement.clientWidth;
    if (paddingBoxWidth !== state.measurementWidth) {
      state.measurementWidth = paddingBoxWidth;
    }
    if (nextPadding !== state.measurementPadding) state.measurementPadding = nextPadding;
  }

  // 等待 RichLineClamp 首次完成测量（收到带真实测量内容的 clampchange），
  // 供 PerformantEllipsis 激活后回放交互前等待测量稳定。
  // 测量副本以 measurementHtml 为 key：内容变化时强制重建一次测量组件，
  // 保证每次内容变化都触发全新的 clampchange（不依赖 vue-clamp 对同尺寸
  // 文本变更的内部重算判定）。
  let measurementSettled = false;
  let measurementTimer = 0;
  let measurementWaiters: Array<() => void> = [];

  function flushMeasurementWaiters() {
    measurementSettled = true;
    window.clearTimeout(measurementTimer);
    const waiters = measurementWaiters;
    measurementWaiters = [];
    waiters.forEach((resolve) => resolve());
  }

  function handleClampChange(clamped: boolean) {
    state.isEllipsis = clamped;
    // setup 期的 immediate clampchange 到达时测量副本还是空内容，不能视为测量完成；
    // 只有携带真实测量内容（measurementHtml 已同步）的 clampchange 才算测量稳定。
    if (!measurementSettled && state.measurementHtml !== '') {
      flushMeasurementWaiters();
    }
  }

  function waitForMeasurement(): Promise<void> {
    if (measurementSettled) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      measurementWaiters.push(resolve);
    });
  }

  // 点击来源为内部交互元素（链接/按钮/输入框等）时不触发展开，交还给元素自身的默认行为。
  // 注意根元素自身可展开时会带 role="button"，因此命中后还需确认是根元素的内部后代而非根元素本身。
  const INTERACTIVE_SELECTOR = 'a,button,input,textarea,select,[role="button"]';

  function handleClick(event?: MouseEvent) {
    if (state.expandTrigger !== 'click') {
      return;
    }
    const triggerElement = state.triggerElement;
    const target = event?.target;
    const interactiveElement =
      target instanceof Element ? target.closest(INTERACTIVE_SELECTOR) : null;
    if (
      interactiveElement &&
      triggerElement &&
      interactiveElement !== triggerElement &&
      triggerElement.contains(interactiveElement)
    ) {
      return;
    }
    if (state.isEllipsis || state.expanded) {
      state.expanded = !state.expanded;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    const target = event.target;
    const interactiveElement =
      target instanceof Element ? target.closest(INTERACTIVE_SELECTOR) : null;
    if (interactiveElement && interactiveElement !== state.triggerElement) return;
    if (isExpandable() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  }

  function observeTrigger(element: HTMLElement | undefined) {
    if (!element) return;
    const observer = new MutationObserver(syncMeasurement);
    observer.observe(element, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }
  function startMeasurementFallback() {
    measurementTimer = window.setTimeout(flushMeasurementWaiters, 200);
  }
  function resetExpanded() {
    state.expanded = false;
  }
  return {
    syncMeasurement,
    flushMeasurementWaiters,
    handleClampChange,
    waitForMeasurement,
    handleClick,
    handleKeydown,
    isExpandable,
    getTooltipDisabled,
    getNativeTitle,
    observeTrigger,
    startMeasurementFallback,
    resetExpanded,
  };
}
