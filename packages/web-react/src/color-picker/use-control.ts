import { createColorControl } from '@sdata/web-core/color-picker/control';
import { useLayoutEffect, useRef, useState } from 'react';

export function useColorControl(
  value: () => [number, number],
  onChange: (value: [number, number]) => void,
) {
  const block = useRef<HTMLDivElement>(null);
  const live = useRef({ value, onChange });
  live.current = { value, onChange };
  const [control] = useState(() =>
    createColorControl({
      get block() {
        return block.current ?? undefined;
      },
      value: () => live.current.value(),
      onChange: (next) => live.current.onChange(next),
      setActive() {},
    }),
  );
  const lifetime = useRef(0);
  useLayoutEffect(() => {
    lifetime.current++;
    return () => {
      const ending = ++lifetime.current;
      // StrictMode reconnects before this microtask; real unmount still cancels before the next frame.
      queueMicrotask(() => {
        if (lifetime.current === ending) control.dispose();
      });
    };
  }, [control]);
  return { block, down: control.down };
}
