import type { GridColumnContext } from '@sdata/web-core/grid/column';
import type {
  RowProps as CoreRowProps,
  ColProps as CoreColProps,
  GridProps as CoreGridProps,
  GridItemProps as CoreGridItemProps,
  GridItemData,
} from '@sdata/web-core/grid/types';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { resolveResponsiveValue } from '@sdata/web-core/_utils/responsive';
import {
  getAllowableFlexValue,
  getGridColumnClassNames,
  getGridColumnPadding,
} from '@sdata/web-core/grid/column';
import {
  getGridRowMargins,
  getGridStyle,
  getGridItemStyle,
  resolveItemData,
  setItemVisible,
} from '@sdata/web-core/grid/layout';
import {
  createContext,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useItemIndex } from '../_shared/use-item-index.js';
import { useResponsiveState } from '../_shared/use-responsive-state.js';
import { usePrefix } from '../config-provider/index.js';

export type { ResponsiveValue, ColResponsiveConfig } from '@sdata/web-core/grid/types';
export interface RowProps extends ComponentPropsWithRef<'div'>, CoreRowProps {}
export interface ColProps extends ComponentPropsWithRef<'div'>, CoreColProps {}
export interface GridProps extends ComponentPropsWithRef<'div'>, CoreGridProps {}
export interface GridItemProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children'>, CoreGridItemProps {
  children?: ReactNode | ((props: { overflow: boolean }) => ReactNode);
}

const RowContext = createContext<GridColumnContext>({});
const GridContext = createContext({
  cols: 24,
  colGap: 0,
  overflow: false,
  displayIndexList: [] as number[],
});
const CollectorContext = createContext<
  | {
      collect(id: string, index: number, data: GridItemData): void;
      remove(id: string): void;
    }
  | undefined
>(undefined);

export function Row({
  gutter = 0,
  justify = 'start',
  align = 'start',
  div = false,
  wrap = true,
  children,
  className,
  style,
  ...attrs
}: RowProps) {
  const prefix = usePrefix('row');
  const horizontal = useResponsiveState(Array.isArray(gutter) ? gutter[0] : gutter, 0);
  const vertical = useResponsiveState(Array.isArray(gutter) ? gutter[1] : 0, 0);
  return (
    <RowContext.Provider value={{ gutter: [horizontal, vertical], div }}>
      <div
        {...attrs}
        className={
          [
            !div && prefix,
            !div && !wrap && `${prefix}-nowrap`,
            !div && `${prefix}-align-${align}`,
            !div && `${prefix}-justify-${justify}`,
            className,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        style={{ ...getGridRowMargins([horizontal, vertical], div), ...style }}
      >
        {children}
      </div>
    </RowContext.Provider>
  );
}

export function Col({
  span = 24,
  offset,
  order,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  flex,
  children,
  className,
  style,
  ...attrs
}: ColProps) {
  const prefix = usePrefix('col');
  const row = useContext(RowContext);
  const props = { span, offset, order, xs, sm, md, lg, xl, xxl };
  const responsiveSpan = useResponsiveState(
    resolveResponsiveValue({ val: span, key: 'span', xs, sm, md, lg, xl, xxl }),
    24,
    true,
  );
  const flexValue = getAllowableFlexValue(flex);
  if (!row.div && !responsiveSpan) return null;
  const classes = row.div
    ? []
    : flexValue !== undefined
      ? [prefix]
      : Object.entries(getGridColumnClassNames(prefix, props, row))
          .filter(([, enabled]) => enabled)
          .map(([name]) => name);
  return (
    <div
      {...attrs}
      className={[...classes, className].filter(Boolean).join(' ') || undefined}
      style={{
        ...(!row.div
          ? {
              ...getGridColumnPadding(row),
              ...(flexValue !== undefined ? { flex: flexValue } : {}),
            }
          : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function GridRoot({
  cols = 24,
  rowGap = 0,
  colGap = 0,
  collapsed = false,
  collapsedRows = 1,
  children,
  className,
  style,
  ...attrs
}: GridProps) {
  const prefix = usePrefix('grid');
  const columns = useResponsiveState(cols, 24);
  const horizontal = useResponsiveState(colGap, 0);
  const vertical = useResponsiveState(rowGap, 0);
  const [items, setItems] = useState(new Map<string, { index: number; data: GridItemData }>());
  const collector = useMemo(
    () => ({
      collect(id: string, index: number, data: GridItemData) {
        setItems((current) => {
          const previous = current.get(id);
          if (
            previous?.index === index &&
            previous.data.span === data.span &&
            previous.data.offset === data.offset &&
            previous.data.suffix === data.suffix
          )
            return current;
          return new Map(current).set(id, { index, data });
        });
      },
      remove(id: string) {
        setItems((current) => {
          if (!current.has(id)) return current;
          const next = new Map(current);
          next.delete(id);
          return next;
        });
      },
    }),
    [],
  );
  const entries = [...items.values()].sort((a, b) => a.index - b.index);
  const display = setItemVisible({
    cols: columns,
    collapsed,
    collapsedRows,
    itemDataList: entries.map((item) => item.data),
  });
  const context = {
    cols: columns,
    colGap: horizontal,
    overflow: display.overflow,
    displayIndexList: display.displayIndexList.map((index) => entries[index].index),
  };
  return (
    <GridContext.Provider value={context}>
      <CollectorContext.Provider value={collector}>
        <div
          {...attrs}
          className={[prefix, className].filter(Boolean).join(' ')}
          style={{ ...getGridStyle(columns, vertical, horizontal), ...style }}
        >
          {children}
        </div>
      </CollectorContext.Provider>
    </GridContext.Provider>
  );
}

export function GridItem({
  span = 1,
  offset = 0,
  suffix = false,
  children,
  className,
  style,
  ref,
  ...attrs
}: GridItemProps) {
  const prefix = usePrefix('grid-item');
  const root = useRef<HTMLDivElement>(null);
  const index = useItemIndex(root, `.${prefix}`);
  const id = useId();
  const grid = useContext(GridContext);
  const collector = useContext(CollectorContext);
  const resolvedSpan = useResponsiveState(span, 1);
  const resolvedOffset = useResponsiveState(offset, 0);
  const data = useMemo(
    () => resolveItemData(grid.cols, { span: resolvedSpan, offset: resolvedOffset, suffix }),
    [grid.cols, resolvedSpan, resolvedOffset, suffix],
  );
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => {
    if (index !== -1) collector?.collect(id, index, data);
  }, [collector, id, index, data]);
  useLayoutEffect(() => () => collector?.remove(id), [collector, id]);
  return (
    <div
      {...attrs}
      ref={root}
      className={[prefix, className].filter(Boolean).join(' ')}
      style={{
        ...(index !== -1
          ? getGridItemStyle(grid.cols, grid.colGap, data, grid.displayIndexList.includes(index))
          : {}),
        ...style,
      }}
    >
      {typeof children === 'function' ? children({ overflow: grid.overflow }) : children}
    </div>
  );
}

export const Grid = Object.assign(GridRoot, { Row, Col, Item: GridItem });
export default Grid;

export type GridColInstance = ReactComponentRef<typeof Col>;
export type GridInstance = ReactComponentRef<typeof Grid>;
export type GridItemInstance = ReactComponentRef<typeof GridItem>;
export type GridRowInstance = ReactComponentRef<typeof Row>;
