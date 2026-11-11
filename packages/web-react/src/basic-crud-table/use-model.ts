import { useReducer, useRef, useState } from 'react';

export function useCrudModel<Value>(
  value: Value | undefined,
  initial: Value,
  onChange: ((value: Value) => void) | undefined,
) {
  const [, redraw] = useReducer((version: number) => version + 1, 0);
  const inner = useRef(initial);
  const current = useRef({ value, onChange });
  current.current = { value, onChange };
  const [model] = useState(() => ({
    get value() {
      return current.current.value ?? inner.current;
    },
    set value(next: Value) {
      if (Object.is(next, current.current.value ?? inner.current)) return;
      inner.current = next;
      redraw();
      current.current.onChange?.(next);
    },
  }));
  return model;
}
