import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getSkeletonLines } from '../dist/skeleton/foundation.js';

test('skeleton lines resolve pixel, CSS and omitted widths with spacing only after the first row', () => {
  assert.deepEqual(
    getSkeletonLines({ rows: 3, widths: [100, '60%'], lineHeight: 12, lineSpacing: 8 }),
    [
      { width: '100px', height: '12px', marginBottom: '0' },
      { width: '60%', height: '12px', marginBottom: '0', marginTop: '8px' },
      { height: '12px', marginBottom: '0', marginTop: '8px' },
    ],
  );
  assert.deepEqual(getSkeletonLines({}), [{ height: '20px', marginBottom: '0' }]);
  assert.deepEqual(getSkeletonLines({ rows: 0 }), []);
  assert.equal(getSkeletonLines({ rows: 2, widths: [0], lineSpacing: 0 })[0].width, '0px');
});
