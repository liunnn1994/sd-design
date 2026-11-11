import { observeBeamPreferences } from '@sdata/web-core/_utils/beam-preferences';
import { useLayoutEffect, useRef, useState } from 'react';

export function useBeamPreferences() {
  const preferences = useRef({ systemTheme: 'light' as 'dark' | 'light', reducedMotion: false });
  const [, render] = useState(0);
  useLayoutEffect(
    () =>
      observeBeamPreferences({
        theme(value) {
          if (preferences.current.systemTheme !== value) {
            preferences.current.systemTheme = value;
            render((version) => version + 1);
          }
        },
        motion(value) {
          if (preferences.current.reducedMotion !== value) {
            preferences.current.reducedMotion = value;
            render((version) => version + 1);
          }
        },
      }),
    [],
  );
  return preferences.current;
}
