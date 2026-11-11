import assert from 'node:assert/strict';
import { test } from 'node:test';

import { setFormModelValue } from '../dist/form/model.js';

test('immutable form writeback preserves nested originals and unsafe path protection', () => {
  const model = { rows: [{ name: 'original' }], date: new Date(0) };
  const next = setFormModelValue(model, 'rows[0].name', 'next');
  assert.equal(next.rows[0].name, 'next');
  assert.equal(model.rows[0].name, 'original');
  assert.deepEqual(next.date, model.date);
  assert.deepEqual(setFormModelValue(model, '__proto__.polluted', true), model);
});
