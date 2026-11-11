import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveCommentAlign } from '../dist/comment/foundation.js';

test('comment supports common and independently defaulted alignments', () => {
  assert.deepEqual(resolveCommentAlign(), { datetime: 'left', actions: 'left' });
  assert.deepEqual(resolveCommentAlign('right'), { datetime: 'right', actions: 'right' });
  assert.deepEqual(resolveCommentAlign({ actions: 'right' }), {
    datetime: 'left',
    actions: 'right',
  });
});
