import { onMounted, onUnmounted, shallowRef } from 'vue';

/** Shared browser preferences for visual beam components. */
export function useBeamPreferences() {
  const systemTheme = shallowRef<'dark' | 'light'>('dark');
  const reducedMotion = shallowRef(false);
  let cleanup: (() => void) | undefined;

  onMounted(() => {
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateTheme = () => {
      systemTheme.value = themeQuery.matches ? 'dark' : 'light';
    };
    const updateMotion = () => {
      reducedMotion.value = motionQuery.matches;
    };
    updateTheme();
    updateMotion();
    themeQuery.addEventListener('change', updateTheme);
    motionQuery.addEventListener('change', updateMotion);
    cleanup = () => {
      themeQuery.removeEventListener('change', updateTheme);
      motionQuery.removeEventListener('change', updateMotion);
    };
  });
  onUnmounted(() => cleanup?.());

  return { systemTheme, reducedMotion };
}
