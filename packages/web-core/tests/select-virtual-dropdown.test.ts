import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveDropdownVirtualListProps } from '../dist/select/virtual-dropdown.js';

test('virtual dropdown defaults preserve explicit sizing and copy rather than mutate caller options', () => {
  assert.equal(resolveDropdownVirtualListProps(undefined), undefined);
  const source = { buffer: 50, height: undefined, itemSize: undefined, minItemSize: undefined };
  assert.deepEqual(resolveDropdownVirtualListProps(source, undefined, 36), {
    ...source,
    height: '200px',
    itemSize: 36,
  });
  assert.equal(source.height, undefined);
  assert.deepEqual(
    resolveDropdownVirtualListProps(
      { itemSize: 0 },
      { popupStyle: { maxHeight: 180, height: 100 } },
      36,
    ),
    { itemSize: 0, height: 180 },
  );
  assert.deepEqual(
    resolveDropdownVirtualListProps({ minItemSize: 24 }, { popupStyle: { height: '30vh' } }, 36),
    { minItemSize: 24, height: '30vh' },
  );
  assert.deepEqual(
    resolveDropdownVirtualListProps({ height: 0 }, { popupStyle: { height: 300 } }, 36),
    { height: 0, itemSize: 36 },
  );
});
