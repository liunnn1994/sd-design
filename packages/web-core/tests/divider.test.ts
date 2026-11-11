import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getDividerStyle } from '../dist/divider/foundation.js';

test('divider leaves unspecified values to shared stylesheet', () => {
  assert.deepEqual(getDividerStyle({}), {});
});

test('divider preserves zero width and numeric margins', () => {
  assert.deepEqual(getDividerStyle({ size: 0, margin: 0, type: 'dashed' }), {
    borderBottomWidth: '0px',
    borderBottomStyle: 'dashed',
    margin: '0px 0',
  });
});

test('vertical divider uses left border and preserves CSS margin units', () => {
  assert.deepEqual(
    getDividerStyle({ direction: 'vertical', size: 2, margin: '1rem', type: 'double' }),
    {
      borderLeftWidth: '2px',
      borderLeftStyle: 'double',
      margin: '0 1rem',
    },
  );
});
