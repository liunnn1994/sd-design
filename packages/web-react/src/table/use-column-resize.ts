import { createColumnResizeFoundation } from '@sdata/web-core/table/column-resize';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

export function useTableColumnResize(
  elements: Record<string, HTMLElement>,
  onColumnResize?: (field: string, width: number) => void,
) {
  const current = useRef({ elements, onColumnResize });
  current.current = { elements, onColumnResize };
  const state = useRef({ resizing: '', widths: Object.create(null) as Record<string, number> });
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [foundation] = useState(() =>
    createColumnResizeFoundation(
      {
        get thElements() {
          return current.current.elements;
        },
        get resizingColumn() {
          return state.current.resizing;
        },
        set resizingColumn(value) {
          state.current.resizing = value;
          render();
        },
        get columnWidth() {
          return state.current.widths;
        },
      },
      (_, field, width) => {
        render();
        current.current.onColumnResize?.(field, width);
      },
    ),
  );
  useLayoutEffect(() => foundation.dispose, [foundation]);
  return {
    ...foundation,
    resizingColumn: state.current.resizing,
    columnWidth: state.current.widths,
  };
}
