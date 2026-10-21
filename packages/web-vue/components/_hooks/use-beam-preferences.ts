import { onMounted, onUnmounted, shallowRef } from 'vue';

import { observeBeamPreferences } from '@sdata/web-core/_utils/beam-preferences';

/** Shared browser preferences for visual beam components. */
export function useBeamPreferences() {
  const systemTheme = shallowRef<'dark' | 'light'>('dark');
  const reducedMotion = shallowRef(false);
  let cleanup: (() => void) | undefined;

  onMounted(() => {
    cleanup = observeBeamPreferences({
      theme(value) {
        systemTheme.value = value;
      },
      motion(value) {
        reducedMotion.value = value;
      },
    });
  });
  onUnmounted(() => cleanup?.());

  return { systemTheme, reducedMotion };
}
