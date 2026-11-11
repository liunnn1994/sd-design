import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getSiderStyle, getSiderOverlayStyle } from '../dist/layout/sider.js';

test('rail reserves its width while the expanded overlay is removed from flow', () => {
  assert.deepEqual(getSiderStyle(false, true, '240px', '60px'), {
    flex: '0 0 60px',
    width: '60px',
    minWidth: '60px',
    maxWidth: '60px',
  });
  assert.deepEqual(getSiderOverlayStyle(true, '240px', '60px'), {
    position: 'absolute',
    inset: '0',
    width: '240px',
    zIndex: 20,
  });
  assert.equal(getSiderOverlayStyle(false, '240px', '60px').width, '60px');
  assert.deepEqual(getSiderStyle(true, true, '240px', '60px'), { flex: '0 0 auto', width: 'auto' });
});
