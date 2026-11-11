import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createCardFoundation, getCardSize, getCardScrollMode } from '../dist/card/foundation.js';

test('card keeps layout until the last child unregisters and supports remounting', () => {
  const state = { metaCount: 0, gridCount: 0 };
  const card = createCardFoundation(state);
  const removeMeta = card.registerMeta();
  const removeOtherMeta = card.registerMeta();
  const removeGrid = card.registerGrid();
  removeMeta();
  assert.equal(card.hasMeta, true);
  removeOtherMeta();
  assert.equal(card.hasMeta, false);
  assert.equal(card.hasGrid, true);
  removeGrid();
  assert.equal(card.hasGrid, false);
  card.registerGrid()();
  assert.deepEqual(state, { metaCount: 0, gridCount: 0 });
});

test('card normalizes provider sizes and enables scrolling only at full height', () => {
  assert.deepEqual(['mini', 'small', 'medium', 'large', undefined].map(getCardSize), [
    'small',
    'small',
    'medium',
    'medium',
    'medium',
  ]);
  assert.equal(getCardScrollMode(false, {}), 'none');
  assert.equal(getCardScrollMode(true, false), 'native');
  assert.equal(getCardScrollMode(true, { type: 'track' }), 'custom');
});
