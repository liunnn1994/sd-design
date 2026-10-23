import type { SkeletonRevealAdapter } from './types.js';

import { measureSkeletonReveal } from './geometry.js';

export function createSkeletonRevealFoundation(adapter: SkeletonRevealAdapter) {
  let animations: { cancel(): void }[] = [];
  let epoch = 0;
  let disposed = false;
  let started = false;
  let disconnect = () => {};

  function finish() {
    epoch++;
    for (const animation of animations) animation.cancel();
    animations = [];
    adapter.shapes = [];
    if (adapter.content) adapter.content.style.opacity = '1';
    const wasDrawing = adapter.state === 'drawing';
    adapter.state = 'complete';
    if (wasDrawing && !disposed) adapter.onFinish();
  }

  async function replay() {
    finish();
    const { duration, disabled } = adapter.props;
    if (
      disposed ||
      disabled ||
      adapter.reducedMotion ||
      !Number.isFinite(duration) ||
      duration <= 0 ||
      adapter.root?.ownerDocument.hidden
    )
      return;
    const pending = epoch;
    await adapter.afterRender();
    const body = adapter.content;
    if (!adapter.root || !body || disposed || pending !== epoch) return;
    const geometry = measureSkeletonReveal(body);
    if (!geometry) return;
    const token = ++epoch;
    adapter.box = geometry.box;
    adapter.shapes = geometry.shapes;
    adapter.state = 'drawing';
    body.style.opacity = '0';
    await adapter.afterRender();
    if (disposed || token !== epoch) return;
    const overlay = adapter.overlay;
    if (!overlay) {
      finish();
      return;
    }
    const seconds = Math.min(duration, 10000) / 1000;
    const paths = overlay.querySelectorAll('[data-reveal-draw]');
    paths.forEach((path, index) => {
      animations.push(
        adapter.animate(
          path,
          { strokeDashoffset: [1, 0] },
          {
            duration: seconds * 0.72,
            delay: (index / paths.length) * seconds * 0.16,
            ease: [0.22, 1, 0.36, 1],
          },
        ),
      );
    });
    animations.push(
      adapter.animate(
        body,
        { opacity: [0, 1] },
        {
          delay: seconds * 0.58,
          duration: seconds * 0.3,
          ease: 'easeOut',
        },
      ),
    );
    animations.push(
      adapter.animate(
        overlay,
        { opacity: [1, 0] },
        {
          delay: seconds * 0.65,
          duration: seconds * 0.35,
          onComplete: () => {
            if (token === epoch) finish();
          },
        },
      ),
    );
  }

  function syncOptions() {
    if (adapter.props.disabled || adapter.reducedMotion) finish();
  }

  function connect() {
    disconnect();
    const root = adapter.root;
    const document = root?.ownerDocument;
    const view = document?.defaultView;
    if (disposed || !root || !document || !view) return;
    const onVisibilityChange = () => {
      if (document.hidden) finish();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    const interactions = ['pointerdown', 'keydown', 'focusin'] as const;
    for (const event of interactions) root.addEventListener(event, finish, true);
    let size: { width: number; height: number } | undefined;
    const resizeObserver = new view.ResizeObserver(([entry]) => {
      const next = entry.contentRect;
      if (
        size &&
        (Math.abs(size.width - next.width) > 1 || Math.abs(size.height - next.height) > 1)
      )
        finish();
      size = { width: next.width, height: next.height };
    });
    resizeObserver.observe(root);
    const observer = new view.IntersectionObserver(([entry]) => {
      if (
        entry.isIntersecting &&
        !started &&
        adapter.props.autoplay &&
        !adapter.props.disabled &&
        !adapter.reducedMotion
      ) {
        started = true;
        void replay();
      } else if (!entry.isIntersecting && adapter.state === 'drawing') finish();
    });
    observer.observe(root);
    disconnect = () => {
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      for (const event of interactions) root.removeEventListener(event, finish, true);
    };
  }

  function dispose() {
    disposed = true;
    finish();
    disconnect();
  }
  return { replay, finish, syncOptions, connect, dispose };
}
