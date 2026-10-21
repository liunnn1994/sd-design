import { computed, onMounted, shallowRef, toValue, watchEffect, type MaybeRefOrGetter } from 'vue';

import { observeNumberFlowMotion } from '@sdata/web-core/number-flow/motion';

/**
 * SSR-safe composable that returns whether number-flow animations can run.
 * Respects `prefers-reduced-motion` and listens for changes.
 */
export function useCanAnimate({
  respectMotionPreference = true,
}: {
  respectMotionPreference?: MaybeRefOrGetter<boolean>;
} = {}) {
  const canAnimate = shallowRef(false);
  const reducedMotion = shallowRef(false);
  const mediaQuery = shallowRef<MediaQueryList>();

  onMounted(() => {
    canAnimate.value = typeof window !== 'undefined';
    mediaQuery.value = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.value = mediaQuery.value.matches;
  });

  watchEffect((onCleanup) => {
    if (!toValue(respectMotionPreference)) return;
    onCleanup(
      observeNumberFlowMotion(mediaQuery.value, (matches) => {
        reducedMotion.value = matches;
      }),
    );
  });

  return computed(
    () => canAnimate.value && (!toValue(respectMotionPreference) || !reducedMotion.value),
  );
}
