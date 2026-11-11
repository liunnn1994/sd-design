import type { SkeletonRevealAdapter } from './types.js';

/** Native timing matches the Motion adapter's seconds, fill and easing contract. */
export const animateSkeletonReveal: SkeletonRevealAdapter['animate'] = (
  element,
  values,
  options,
) => {
  const animation = element.animate(values, {
    duration: options.duration * 1000,
    delay: (options.delay ?? 0) * 1000,
    easing: Array.isArray(options.ease) ? `cubic-bezier(${options.ease.join(',')})` : 'ease-out',
    fill: 'both',
  });
  animation.onfinish = () => options.onComplete?.();
  return {
    cancel() {
      animation.onfinish = null;
      animation.cancel();
    },
  };
};
