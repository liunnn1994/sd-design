function scrollRoot(element: HTMLElement): HTMLElement | null {
  const view = element.ownerDocument.defaultView;
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (/auto|scroll|overlay/.test(view?.getComputedStyle(parent).overflowY ?? '')) return parent;
  }
  return null;
}

/** One renderer's pending slots share observers and an idle drain. */
export function createMarkdownViewportScheduler(rootMargin = '400px') {
  const pending = new Map<HTMLElement, () => void>();
  const observers = new Map<HTMLElement | null, IntersectionObserver>();
  let idle: number | undefined;
  let view: Window | null = null;
  let cancelIdle: (() => void) | undefined;
  function activate(element: HTMLElement) {
    const callback = pending.get(element);
    if (!callback) return;
    pending.delete(element);
    for (const observer of observers.values()) observer.unobserve(element);
    callback();
    if (!pending.size) cancelIdle?.();
  }
  function drain() {
    if (idle != null || !pending.size || !view) return;
    const currentView = view;
    const callback = () => {
      idle = undefined;
      const next = pending.keys().next().value;
      if (next) activate(next);
      drain();
    };
    if (typeof currentView.requestIdleCallback === 'function') {
      idle = currentView.requestIdleCallback(callback, { timeout: 1200 });
      cancelIdle = () => {
        if (idle != null) currentView.cancelIdleCallback(idle);
        idle = undefined;
      };
    } else {
      idle = currentView.setTimeout(callback, 16);
      cancelIdle = () => {
        if (idle != null) currentView.clearTimeout(idle);
        idle = undefined;
      };
    }
  }
  return {
    watch(element: HTMLElement, callback: () => void) {
      view = element.ownerDocument.defaultView;
      const root = scrollRoot(element);
      let observer = observers.get(root);
      if (!observer) {
        try {
          observer = new IntersectionObserver(
            (entries) => {
              for (const entry of entries)
                if (entry.isIntersecting || entry.intersectionRatio > 0)
                  activate(entry.target as HTMLElement);
            },
            { root, rootMargin, threshold: 0 },
          );
          observers.set(root, observer);
        } catch {
          callback();
          return;
        }
      }
      pending.set(element, callback);
      observer.observe(element);
      drain();
    },
    dispose() {
      pending.clear();
      cancelIdle?.();
      for (const observer of observers.values()) observer.disconnect();
      observers.clear();
    },
  };
}
