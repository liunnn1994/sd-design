import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getSpinDelay, isSpinRequested, scheduleSpinLoading } from '../dist/spin/foundation.js';

test('spin normalizes delays and standalone mode always requests loading', () => {
  assert.equal(getSpinDelay(true), 400);
  assert.equal(getSpinDelay(-1), 0);
  assert.equal(getSpinDelay(false), 0);
  assert.equal(isSpinRequested(false, false), true);
  assert.equal(isSpinRequested(true, false), false);
});

test('spin timer shows loading only after the delay and cancels cleanly', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let active = false;
  const cancel = scheduleSpinLoading(true, 400, (value) => {
    active = value;
  });
  context.mock.timers.tick(399);
  assert.equal(active, false);
  context.mock.timers.tick(1);
  assert.equal(active, true);
  cancel();
  const cancelNext = scheduleSpinLoading(true, 400, (value) => {
    active = value;
  });
  cancelNext();
  context.mock.timers.tick(400);
  assert.equal(active, false);
});
