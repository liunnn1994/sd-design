import type { GridItemData } from './types.js';

export function getGridRowMargins(gutter: readonly [number, number], div = false) {
  if (div) return {};
  const horizontal = -gutter[0] / 2;
  const vertical = -gutter[1] / 2;
  return {
    ...(horizontal ? { marginLeft: `${horizontal}px`, marginRight: `${horizontal}px` } : {}),
    ...(vertical ? { marginTop: `${vertical}px`, marginBottom: `${vertical}px` } : {}),
  };
}

export function getGridStyle(cols: number, rowGap: number, colGap: number) {
  return {
    gap: `${rowGap}px ${colGap}px`,
    gridTemplateColumns: `repeat(${cols}, minmax(0px, 1fr))`,
  };
}

export function getGridItemStyle(
  cols: number,
  colGap: number,
  item: GridItemData,
  visible: boolean,
) {
  const { offset, span, suffix } = item;
  const start = suffix ? `${cols - span + 1}` : `span ${span}`;
  return {
    gridColumn: `${start} / span ${span}`,
    ...(offset > 0
      ? {
          marginLeft: `calc(((100% - ${colGap * (span - 1)}px) / ${span} * ${offset}) + ${colGap * offset}px)`,
        }
      : {}),
    ...(!visible || span === 0 ? { display: 'none' as const } : {}),
  };
}

export function resolveItemData(cols: number, props: GridItemData): GridItemData {
  const originSpan = props.span ?? 1;
  const originOffset = props.offset ?? 0;
  const offset = Math.min(originOffset, cols);
  const span = Math.min(offset > 0 ? originSpan + originOffset : originSpan, cols);
  return {
    span,
    offset,
    suffix: 'suffix' in props ? props.suffix !== false : false,
  };
}

export function setItemVisible({
  cols,
  collapsed,
  collapsedRows,
  itemDataList,
}: {
  cols: number;
  collapsed: boolean;
  collapsedRows: number;
  itemDataList: GridItemData[];
}) {
  let overflow = false;
  let displayIndexList: number[] = [];

  function isOverflow(span: number) {
    return Math.ceil(span / cols) > collapsedRows;
  }

  if (collapsed) {
    let spanSum = 0;

    for (let i = 0; i < itemDataList.length; i++) {
      if (itemDataList[i].suffix) {
        spanSum += itemDataList[i].span;
        displayIndexList.push(i);
      }
    }

    if (!isOverflow(spanSum)) {
      let current = 0;
      let occupied = 0;
      while (current < itemDataList.length) {
        const item = itemDataList[current];

        if (!item.suffix) {
          const column = occupied % cols;
          if (column + item.span > cols) {
            occupied += cols - column;
          }
          occupied += item.span;

          if (isOverflow(occupied + spanSum)) {
            break;
          }

          displayIndexList.push(current);
        }

        current++;
      }
    }

    overflow = itemDataList.some(
      (item, index) => !item.suffix && !displayIndexList.includes(index),
    );
  } else {
    displayIndexList = itemDataList.map((_, index) => index);
  }

  return {
    overflow,
    displayIndexList,
  };
}
