import type { TextAlign } from '../_utils/constant.js';
import type { RenderData } from './types.js';

import { isObject } from '../_utils/is.js';

export function groupDescriptions<T>(
  data: readonly T[],
  getSpan: (item: T) => number | null | undefined,
  getColumn: () => number,
): RenderData<T>[][] {
  const result: RenderData<T>[][] = [];
  let currentRow: RenderData<T>[] = [];
  let currentSpan = 0;

  function addRow() {
    if (!currentRow.length) return;
    currentRow[currentRow.length - 1].span += getColumn() - currentSpan;
    result.push(currentRow);
  }

  data.forEach((item, index) => {
    const itemSpan = Math.min(getSpan(item) ?? 1, getColumn());
    if (currentSpan + itemSpan > getColumn()) {
      addRow();
      currentRow = [];
      currentSpan = 0;
    }
    currentRow.push({ data: item, span: itemSpan, index });
    currentSpan += itemSpan;
  });
  addRow();
  return result;
}

export function resolveDescriptionAlign(
  align:
    | TextAlign
    | { label?: TextAlign | undefined; value?: TextAlign | undefined }
    | null
    | undefined,
  part: 'label' | 'value',
) {
  return (isObject(align) ? align[part] : align) ?? 'left';
}
