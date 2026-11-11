import type { MenuData } from '@sdata/web-core/menu/types';

import {
  createMenuCollector,
  type MenuCollectorContext as CoreMenuCollectorContext,
  type MenuCollectorOptions,
} from '@sdata/web-core/menu/collector';
import { createContext, useContext, useLayoutEffect, useMemo, useReducer } from 'react';

interface CollectorContext {
  context: CoreMenuCollectorContext;
  changed(): void;
}

export const MenuCollectorContext = createContext<CollectorContext | undefined>(undefined);

export function useMenuCollector({ key, type }: MenuCollectorOptions) {
  const inherited = useContext(MenuCollectorContext);
  const parent = type === 'menu' ? undefined : inherited;
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const store = useMemo(() => {
    let data: MenuData = [];
    const changed = () => {
      refresh();
      // Core preserves nested array aliases; React ancestors also need an explicit refresh.
      parent?.changed();
    };
    const foundation = createMenuCollector({
      options: { key, type },
      get data() {
        return data;
      },
      parent: parent?.context,
      replace(value) {
        data = value;
      },
      onChange: changed,
    });
    return {
      get data() {
        return data;
      },
      value: { context: foundation.context, changed },
      foundation,
    };
  }, [key, type, parent]);

  useLayoutEffect(() => {
    store.foundation.mount();
    return store.foundation.unmount;
  }, [store]);
  return store;
}
