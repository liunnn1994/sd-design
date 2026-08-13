import { computed, onMounted, shallowRef, toValue, watchEffect, type MaybeRefOrGetter } from 'vue';

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
    const onChange = ({ matches }: MediaQueryListEvent) => {
      reducedMotion.value = matches;
    };
    const query = mediaQuery.value;
    query?.addEventListener('change', onChange);
    onCleanup(() => {
      query?.removeEventListener('change', onChange);
    });
  });

  return computed(
    () => canAnimate.value && (!toValue(respectMotionPreference) || !reducedMotion.value),
  );
}
