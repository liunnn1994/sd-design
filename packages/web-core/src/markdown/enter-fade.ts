const classes = ['fade-enter-from', 'fade-enter-active', 'fade-enter-to'];
export function getMarkdownFadeTimeout(style: {
  transitionDuration: string;
  transitionDelay: string;
}) {
  const milliseconds = (value: string) =>
    (Number.parseFloat(value) || 0) * (value.trim().endsWith('ms') ? 1 : 1000);
  const durations = style.transitionDuration.split(',').map(milliseconds);
  const delays = style.transitionDelay.split(',').map(milliseconds);
  return Math.max(
    0,
    ...durations.map((duration, index) => duration + delays[index % delays.length]),
  );
}

export function createMarkdownEnterFade() {
  let seen = new WeakMap<HTMLElement, Element | null>();
  const active = new Map<Element, { phase: 'from' | 'to'; cancel(): void }>();
  function enter(element: Element) {
    const view = element.ownerDocument.defaultView;
    if (!view) return;
    let frame: number | undefined;
    let timer: number | undefined;
    const useFrame = typeof view.requestAnimationFrame === 'function';
    const nextFrame = (callback: () => void) =>
      useFrame ? view.requestAnimationFrame(callback) : view.setTimeout(callback, 16);
    const done = () => {
      if (frame != null) {
        if (useFrame) view.cancelAnimationFrame(frame);
        else view.clearTimeout(frame);
      }
      if (timer != null) view.clearTimeout(timer);
      element.removeEventListener('transitionend', ended);
      element.classList.remove(...classes);
      active.delete(element);
    };
    const ended = (event: Event) => {
      if (event.target === element && (event as TransitionEvent).propertyName === 'opacity') done();
    };
    const state = { phase: 'from' as 'from' | 'to', cancel: done };
    active.set(element, state);
    element.classList.add('fade-enter-from');
    // React's content root is already inserted; commit the initial opacity before enabling transition.
    element.getBoundingClientRect();
    element.classList.add('fade-enter-active');
    frame = nextFrame(() => {
      frame = nextFrame(() => {
        frame = undefined;
        if (!active.has(element)) return;
        state.phase = 'to';
        element.classList.remove('fade-enter-from');
        element.classList.add('fade-enter-to');
        element.addEventListener('transitionend', ended);
        timer = view.setTimeout(done, getMarkdownFadeTimeout(view.getComputedStyle(element)) + 1);
      });
    });
  }
  return {
    sync(slots: Iterable<HTMLElement>, options: { enabled: boolean; appear: boolean }) {
      const live = new Set<Element>();
      for (const slot of slots) {
        const content = slot.querySelector<HTMLElement>(':scope > .node-content');
        if (!content) continue;
        const child =
          content.childNodes.length === 1 && content.firstChild?.nodeType === 1
            ? content.firstElementChild
            : null;
        const previous = seen.get(content);
        seen.set(content, child);
        if (!child || slot.dataset.nodeType === 'code_block') continue;
        live.add(child);
        if (options.enabled && child !== previous && (previous !== undefined || options.appear))
          enter(child);
        const state = active.get(child);
        if (state)
          child.classList.add(
            'fade-enter-active',
            state.phase === 'from' ? 'fade-enter-from' : 'fade-enter-to',
          );
      }
      for (const [element, state] of active) if (!live.has(element)) state.cancel();
    },
    dispose() {
      for (const state of active.values()) state.cancel();
      seen = new WeakMap();
    },
  };
}
