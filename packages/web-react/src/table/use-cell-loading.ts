import type { TableCellLoadingContext, TableCellRecord } from '@sdata/web-core/table/cell';
import type { MouseEvent } from 'react';

import { createTableCellLoadingFoundation } from '@sdata/web-core/table/cell';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

export function useTableCellLoading<Raw, Row extends TableCellRecord<Raw>>(
  record: Row,
  context: TableCellLoadingContext<Raw, Row>,
) {
  const current = useRef({ record, context });
  current.current = { record, context };
  const loading = useRef(false);
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [foundation] = useState(() =>
    createTableCellLoadingFoundation<Raw, Row>(
      {
        get record() {
          return current.current.record;
        },
        get isLoading() {
          return loading.current;
        },
        set isLoading(value) {
          if (loading.current !== value) {
            loading.current = value;
            render();
          }
        },
      },
      {
        get loadMore() {
          return current.current.context.loadMore;
        },
        get addLazyLoadData() {
          return current.current.context.addLazyLoadData;
        },
      },
    ),
  );
  useLayoutEffect(() => {
    foundation.reset();
    return foundation.reset;
  }, [foundation, record.raw]);
  return {
    isLoading: loading.current,
    handleClick(event: MouseEvent) {
      foundation.handleClick(event.nativeEvent);
      event.stopPropagation();
    },
  };
}
