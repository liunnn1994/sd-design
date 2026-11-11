import type { ThemeMode } from '@sdata/web-core/config-provider/theme-mode';
import type { RefObject } from 'react';

import { createThemeModeFoundation, THEME_ATTR } from '@sdata/web-core/config-provider/theme-mode';
import { useLayoutEffect, useRef, useState } from 'react';
export function useThemeMode(target: RefObject<HTMLElement | null>, fallback?: () => ThemeMode) {
  const [mode, setMode] = useState<ThemeMode>(() => fallback?.() ?? 'light');
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const current = useRef(mode);
  const [foundation] = useState(() =>
    createThemeModeFoundation({
      get target() {
        return target.current;
      },
      get fallbackMode() {
        return fallbackRef.current?.();
      },
      get mode() {
        return current.current;
      },
      set mode(value) {
        if (value !== current.current) {
          current.current = value;
          setMode(value);
        }
      },
    }),
  );
  useLayoutEffect(() => foundation.resolveTheme());
  useLayoutEffect(() => {
    const observer = new MutationObserver(foundation.handleMutations);
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: fallback === undefined ? [THEME_ATTR] : [THEME_ATTR, 'data-theme'],
    });
    return () => observer.disconnect();
  }, [foundation, fallback === undefined]);
  return mode;
}
