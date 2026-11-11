import type { TableDragState } from '@sdata/web-core/table/drag';

import { createDragSort } from '@sdata/web-core/drag-sort/index';
import { createTableDragFoundation } from '@sdata/web-core/table/drag';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { TableDataWithRaw, TableDraggable } from './types.js';

import { usePrefix } from '../config-provider/index.js';

export function useTableDrag(options: {
  root: HTMLElement | null;
  draggable?: TableDraggable;
  getSortedData(): TableDataWithRaw[];
  onChange(): void;
}) {
  const prefix = usePrefix('table');
  const current = useRef(options);
  current.current = options;
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [state] = useState<TableDragState>(() => ({
    dragging: false,
    committing: false,
    sourceKey: undefined,
    sourcePath: [],
    targetPath: [],
    data: {},
  }));
  const [foundation] = useState(() =>
    createTableDragFoundation(state, {
      get draggable() {
        return current.current.draggable;
      },
      get sortedData() {
        return current.current.getSortedData();
      },
      onChange: () => current.current.onChange(),
    }),
  );
  useLayoutEffect(() => {
    if (!options.root || !options.draggable) return;
    const driver = createDragSort(options.root, {
      draggable: '[data-table-drag-path]',
      handle: `.${prefix}-drag-handle`,
      onStart: (item) => {
        foundation.start(JSON.parse(item.dataset.tableDragPath!));
        render();
      },
      onOver: (item) => {
        foundation.over(item ? JSON.parse(item.dataset.tableDragPath!) : []);
        render();
      },
      onEnd: (_, cancelled) => {
        foundation.end(cancelled);
        render();
      },
    });
    return () => {
      driver.destroy();
      const active = state.dragging;
      foundation.end(true);
      if (active) render();
    };
  }, [options.root, !!options.draggable, prefix, foundation, state]);
  return state;
}
