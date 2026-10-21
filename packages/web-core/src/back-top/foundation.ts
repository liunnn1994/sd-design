import type { ScrollTween } from '../_utils/tween.js';

import { on, off } from '../_utils/dom.js';
import { isString } from '../_utils/is.js';
import { throttleByRaf } from '../_utils/throttle-by-raf.js';
import { createScrollTween } from '../_utils/tween.js';

export function createBackTop(adapter: {
  readonly props: {
    visibleHeight: number;
    targetContainer?: string | HTMLElement;
    duration: number;
    easing: string;
  };
  target: HTMLElement | undefined;
  setVisible(value: boolean): void;
}) {
  let tween: ScrollTween | undefined;
  const scroll = throttleByRaf(() => {
    if (adapter.target) adapter.setVisible(adapter.target.scrollTop >= adapter.props.visibleHeight);
  });
  return {
    scroll,
    connect() {
      const container = adapter.props.targetContainer;
      adapter.target = container
        ? isString(container)
          ? (document.querySelector(container) as HTMLElement)
          : container
        : document.documentElement;
      adapter.setVisible(false);
      if (!adapter.target) return undefined;
      const eventTarget = container ? adapter.target : window;
      on(eventTarget, 'scroll', scroll);
      scroll();
      return () => {
        off(eventTarget, 'scroll', scroll);
        scroll.cancel();
        tween?.stop();
      };
    },
    toTop() {
      tween?.stop();
      if (!adapter.target) return;
      if (
        adapter.props.duration <= 0 ||
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ) {
        adapter.target.scrollTop = 0;
        return;
      }
      tween = createScrollTween({
        from: { scrollTop: adapter.target.scrollTop },
        to: { scrollTop: 0 },
        easing: adapter.props.easing,
        duration: adapter.props.duration,
        onUpdate: (keys) => {
          if (adapter.target) adapter.target.scrollTop = keys.scrollTop;
        },
      });
      tween.start();
    },
    dispose() {
      scroll.cancel();
      tween?.stop();
    },
  };
}
