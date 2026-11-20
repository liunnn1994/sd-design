import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createFitWidthMeasurer } from '../dist/text/fit-width.js';

test('leaves width unset while the input has no computed font', () => {
  const style = { fontSize: '', fontFamily: '' } as CSSStyleDeclaration;
  assert.equal(createFitWidthMeasurer().measure('Name', style), undefined);
});
