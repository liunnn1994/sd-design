import type { CalendarDragHost } from '@sdata/web-core/calendar/drag-host';

import { createCalendarDragSession } from '@sdata/web-core/calendar/drag-and-drop';
import { useLayoutEffect, useRef, useState } from 'react';

// Instances in this adapter share the native drag transfer, including source removal.
const createDragAndDrop = createCalendarDragSession();
type DragAndDrop = ReturnType<typeof createDragAndDrop>;

export function useCalendarDrag(host: CalendarDragHost) {
  const live = useRef(host);
  live.current = host;
  const active = useRef<DragAndDrop | null>(null);
  const [handlers] = useState<DragAndDrop>(() => ({
    eventDragStart: (...args) => active.current?.eventDragStart(...args),
    eventDragEnd: (...args) => active.current?.eventDragEnd(...args),
    cellDragEnter: (...args) => active.current?.cellDragEnter(...args),
    cellDragOver: (...args) => active.current?.cellDragOver(...args),
    cellDragLeave: (...args) => active.current?.cellDragLeave(...args),
    cellDragDrop: async (...args) => {
      await active.current?.cellDragDrop(...args);
    },
  }));
  useLayoutEffect(() => {
    const forward = <T extends object>(read: () => T) =>
      new Proxy({ ...read() }, { get: (_, key) => Reflect.get(read(), key) });
    let dispose = () => {};
    active.current = createDragAndDrop(
      {
        uid: host.uid,
        prefixCls: host.prefixCls,
        emit: (...args) => live.current.emit(...args),
        config: forward(() => live.current.config),
        view: forward(() => live.current.view),
        eventsManager: forward(() => live.current.eventsManager),
        touch: new Proxy(
          { ...host.touch },
          {
            get: (_, key) => Reflect.get(live.current.touch, key),
            set: (_, key, value) => Reflect.set(live.current.touch, key, value),
          },
        ),
      },
      {
        onDispose(callback) {
          dispose = callback;
        },
      },
    );
    return () => {
      dispose();
      active.current = null;
    };
  }, [host.uid, host.prefixCls]);
  return handlers;
}
