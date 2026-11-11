import assert from 'node:assert/strict';
import { test } from 'node:test';

import { animateSkeletonReveal } from '../dist/skeleton-reveal/animation.js';
test('SkeletonReveal native driver preserves seconds, curve, delayed fill and cancels completion', () => {
  let keyframes: PropertyIndexedKeyframes | undefined;
  let timing: KeyframeAnimationOptions | undefined;
  let completed = 0;
  let cancelled = 0;
  const animation = { onfinish: null as (() => void) | null, cancel: () => cancelled++ };
  const element = {
    animate(values: PropertyIndexedKeyframes, options: KeyframeAnimationOptions) {
      keyframes = values;
      timing = options;
      return animation;
    },
  } as unknown as Element;
  const control = animateSkeletonReveal(
    element,
    { strokeDashoffset: [1, 0] },
    { duration: 0.72, delay: 0.16, ease: [0.22, 1, 0.36, 1], onComplete: () => completed++ },
  );
  assert.deepEqual(keyframes, { strokeDashoffset: [1, 0] });
  assert.deepEqual(timing, {
    duration: 720,
    delay: 160,
    easing: 'cubic-bezier(0.22,1,0.36,1)',
    fill: 'both',
  });
  animation.onfinish?.();
  assert.equal(completed, 1);
  control.cancel();
  assert.equal(cancelled, 1);
  assert.equal(animation.onfinish, null);
  animateSkeletonReveal(element, { opacity: [1, 0] }, { duration: 1 });
  assert.equal(timing?.easing, 'ease-out');
});
