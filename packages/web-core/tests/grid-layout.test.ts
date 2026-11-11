import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getGridRowMargins,
  getGridItemStyle,
  resolveItemData,
  setItemVisible,
} from '../dist/grid/layout.js';

test('collapsed grid accounts for gaps caused by row wrapping and reserves suffix space', () => {
  const items = [2, 2, 1].map((span) => ({ span, offset: 0 }));
  assert.deepEqual(
    setItemVisible({
      cols: 3,
      collapsed: true,
      collapsedRows: 2,
      itemDataList: [...items, { span: 1, offset: 0, suffix: true }],
    }),
    { overflow: true, displayIndexList: [3, 0, 1] },
  );
  assert.deepEqual(
    setItemVisible({ cols: 3, collapsed: false, collapsedRows: 1, itemDataList: items }),
    { overflow: false, displayIndexList: [0, 1, 2] },
  );
});

test('grid style rules preserve offsets, suffix alignment, zero spans and div mode', () => {
  const data = resolveItemData(4, { span: 2, offset: 1, suffix: true });
  assert.deepEqual(data, { span: 3, offset: 1, suffix: true });
  assert.equal(getGridItemStyle(4, 8, data, true).gridColumn, '2 / span 3');
  assert.equal(getGridItemStyle(4, 8, { span: 0, offset: 0 }, true).display, 'none');
  assert.deepEqual(getGridRowMargins([16, 8]), {
    marginLeft: '-8px',
    marginRight: '-8px',
    marginTop: '-4px',
    marginBottom: '-4px',
  });
  assert.deepEqual(getGridRowMargins([16, 8], true), {});
});
