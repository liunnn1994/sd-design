import type { ScrollTween } from './tween.js';

import { isUndefined } from './is.js';
import { createScrollTween } from './tween.js';

const scrollIds = new WeakMap<HTMLElement, number>();
const scrollTweens = new WeakMap<HTMLElement, ScrollTween>();

export function scrollTo(element: HTMLElement, to: number, duration: number) {
  const scrollId = scrollIds.get(element);
  if (!isUndefined(scrollId)) cancelAnimationFrame(scrollId);
  scrollTweens.get(element)?.stop();
  scrollTweens.delete(element);
  if (duration <= 0) {
    element.scrollTop = to;
    return;
  }
  scrollIds.set(
    element,
    requestAnimationFrame(() => {
      const tween = createScrollTween({
        from: { scrollTop: element.scrollTop },
        to: { scrollTop: to },
        duration,
        onUpdate: (keys) => {
          element.scrollTop = keys.scrollTop;
        },
      });
      scrollTweens.set(element, tween);
      tween.start();
    }),
  );
}
