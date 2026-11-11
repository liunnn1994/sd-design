import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSelectViewFoundation } from '../dist/select/view.js';

test('select view derives clear visibility, input availability and icon priority from live state', () => {
  const state = {
    multiple: false,
    allowSearch: false,
    allowCreate: false,
    allowClear: true,
    disabled: false,
    valueCount: 0,
    loading: false,
    opened: false,
  };
  const view = createSelectViewFoundation(state);
  assert.equal(view.getMode(), 'single');
  assert.equal(view.getEnabledInput(), false);
  assert.equal(view.getShowClear(), false);
  state.valueCount = 1;
  assert.equal(view.getShowClear(), true);
  state.disabled = true;
  assert.equal(view.getShowClear(), false);
  state.allowCreate = true;
  state.multiple = true;
  assert.equal(view.getEnabledInput(), true);
  assert.equal(view.getMode(), 'multiple');
  state.opened = true;
  assert.equal(view.getIconMode(), 'arrow');
  state.allowSearch = true;
  assert.equal(view.getIconMode(), 'search');
  state.loading = true;
  assert.equal(view.getIconMode(), 'loading');
  state.disabled = false;
  state.allowClear = false;
  assert.equal(view.getShowClear(), false);
});
