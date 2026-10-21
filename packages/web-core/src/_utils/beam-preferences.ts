export function observeBeamPreferences(callbacks: {
  theme(theme: 'dark' | 'light'): void;
  motion(reduce: boolean): void;
}) {
  const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateTheme = () => callbacks.theme(themeQuery.matches ? 'dark' : 'light');
  const updateMotion = () => callbacks.motion(motionQuery.matches);
  updateTheme();
  updateMotion();
  themeQuery.addEventListener('change', updateTheme);
  motionQuery.addEventListener('change', updateMotion);
  return () => {
    themeQuery.removeEventListener('change', updateTheme);
    motionQuery.removeEventListener('change', updateMotion);
  };
}
