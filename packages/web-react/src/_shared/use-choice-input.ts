import { useLayoutEffect, useRef } from 'react';

import { useAfterRender } from './use-after-render.js';

export function useChoiceInput(checked: boolean, indeterminate = false) {
  const input = useRef<HTMLInputElement>(null);
  const current = useRef({ checked, indeterminate });
  current.current = { checked, indeterminate };
  const afterRender = useAfterRender();
  const sync = () => {
    if (input.current) {
      input.current.checked = current.current.checked;
      input.current.indeterminate = current.current.indeterminate;
    }
  };
  useLayoutEffect(sync);
  return {
    input,
    restore: () => {
      void afterRender().then(sync);
    },
  };
}
