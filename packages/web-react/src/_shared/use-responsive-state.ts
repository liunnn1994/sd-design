import type { ResponsiveValue } from '@sdata/web-core/_utils/responsive';

import { getScreenSnapshot, resolveResponsiveState } from '@sdata/web-core/_utils/responsive';
import observer, { responsiveArray } from '@sdata/web-core/_utils/responsive-observe';
import { useSyncExternalStore } from 'react';

const serverScreens = Object.fromEntries(responsiveArray.map((key) => [key, true]));
const subscribe = (notify: () => void) => {
  const token = observer.subscribe(notify);
  return () => observer.unsubscribe(token);
};

export function useResponsiveState(
  value: number | ResponsiveValue,
  defaultValue: number,
  fallbackToXs = false,
) {
  return useSyncExternalStore(
    subscribe,
    () =>
      resolveResponsiveState({ value, screens: getScreenSnapshot() }, defaultValue, fallbackToXs),
    () => resolveResponsiveState({ value, screens: serverScreens }, defaultValue, fallbackToXs),
  );
}
