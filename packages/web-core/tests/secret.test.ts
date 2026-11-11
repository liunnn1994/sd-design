import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSecretFoundation } from '../dist/secret/foundation.js';

test('secret toggle and label read the current adapter state', () => {
  const state = { visible: false };
  const foundation = createSecretFoundation(state);
  assert.equal(foundation.labelKey, 'a11y.secretShow');
  foundation.toggle();
  assert.equal(state.visible, true);
  assert.equal(foundation.labelKey, 'a11y.secretHide');
  foundation.toggle();
  assert.equal(state.visible, false);
  state.visible = true;
  foundation.toggle();
  assert.equal(state.visible, false);
});
