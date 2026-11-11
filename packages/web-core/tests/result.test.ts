import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getResultIllustration } from '../dist/result/illustrations.js';
import { RESULT_STATUS, resolveResultStatus } from '../dist/result/utils.js';

test('result keeps every supported status and falls back for invalid inputs', () => {
  for (const status of RESULT_STATUS) assert.equal(resolveResultStatus(status), status);
  for (const status of [undefined, '', 'invalid', 404, {}])
    assert.equal(resolveResultStatus(status), 'info');
});

test('result artwork keeps internal references within each unique instance', () => {
  for (const status of ['403', '404', '500'] as const) {
    const markup = getResultIllustration(status, 'first');
    const second = getResultIllustration(status, 'second');
    const ids = new Set([...markup.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
    for (const match of markup.matchAll(/(?:href="#|url\(#)([^"')]+)/g))
      assert.ok(ids.has(match[1]), match[1]);
    for (const id of ids) {
      assert.ok(id.startsWith('first-'));
      assert.ok(!second.includes(`id="${id}"`));
    }
    assert.match(markup, /<g /);
    assert.doesNotMatch(markup, /:style=|v-html|<script/);
  }
});
