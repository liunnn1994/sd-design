import type { Orientation } from '@sdata/web-core/panel-group/axes';
import type { EngineGroup } from '@sdata/web-core/panel-group/group';

import { AXES } from '@sdata/web-core/panel-group/axes';
import { createEngineGroup } from '@sdata/web-core/panel-group/group';
import { createContext, useContext, useSyncExternalStore } from 'react';

export function createPanelGroupStore(orientation: Orientation) {
  let version = 0;
  const listeners = new Set<() => void>();
  const changed = () => {
    version++;
    listeners.forEach((listener) => listener());
  };
  // Mirror Vue's reactive engine fields without resynchronizing controllers on each write.
  const observe = <T extends object>(value: T): T =>
    new Proxy(value, {
      set(target, key, next) {
        if (Reflect.get(target, key) === next) return true;
        Reflect.set(target, key, next);
        changed();
        return true;
      },
    });
  const group = createEngineGroup(orientation, {
    axes: observe({ ...AXES[orientation] }),
    fill: observe<EngineGroup['fill']>({ anchor: 'flex-start', size: '100%' }),
  });
  group.subscribe(changed);
  return {
    group,
    getSnapshot: () => version,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const PanelGroupContext = createContext<ReturnType<typeof createPanelGroupStore> | null>(
  null,
);

export function usePanelGroup() {
  const store = useContext(PanelGroupContext);
  if (!store) throw new Error('Panel components must be used inside PanelGroup');
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return store.group;
}
