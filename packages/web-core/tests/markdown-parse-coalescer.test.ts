import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createMarkdownParseCoalescer,
  shouldFlushMarkdownParse,
} from '../dist/markdown/parse-coalescer.js';

const initial = 'An ordinary paragraph '.repeat(5);
test('Markdown parsing flushes structural boundaries and replacements but coalesces long plain appends', () => {
  assert.equal(shouldFlushMarkdownParse(initial, initial + ' next word'), false);
  for (const delta of [
    '\n\n',
    '\n# Heading',
    '\n- Item',
    '\n1. Item',
    '\n> Quote',
    '\n```ts',
    '\n~~~',
    '\n---',
    '\n===',
    '\n| :-- | --: |',
  ])
    assert.equal(shouldFlushMarkdownParse(initial, initial + delta), true, delta);
  for (const next of ['', 'short', initial.slice(1), initial.replace('ordinary', 'different')])
    assert.equal(shouldFlushMarkdownParse(initial, next), true, next);
  assert.equal(shouldFlushMarkdownParse(initial, initial + '\n| value | content |'), false);
});
test('Markdown coalescing commits the latest value at the original deadline and flushes final/options changes', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let now = 0;
  t.mock.method(performance, 'now', () => now);
  const commits: string[] = [];
  const parser = createMarkdownParseCoalescer(initial, (value) => commits.push(value));
  parser.update(initial + ' one', { enabled: true, interval: 80 });
  now = 40;
  t.mock.timers.tick(40);
  parser.update(initial + ' one two', { enabled: true, interval: 80 });
  assert.deepEqual(commits, []);
  now = 80;
  t.mock.timers.tick(40);
  assert.deepEqual(commits, [initial + ' one two']);
  parser.update(initial + ' one two final', { enabled: true, final: true });
  assert.equal(commits.at(-1), initial + ' one two final');
  parser.update(initial + ' one two final options', { enabled: true, reset: true });
  assert.equal(commits.at(-1), initial + ' one two final options');
  now = 120;
  parser.update(commits.at(-1)!, { enabled: true, reset: true });
  const before = commits.length;
  now = 160;
  parser.update(initial + ' one two final options next', { enabled: true, interval: 80 });
  t.mock.timers.tick(39);
  assert.equal(commits.length, before);
  now = 200;
  t.mock.timers.tick(1);
  assert.equal(commits.at(-1), initial + ' one two final options next');
  parser.cancel();
});
test('Markdown coalescing supports disabled/zero/default intervals and cancels work on release', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(performance, 'now', () => 0);
  const commits: string[] = [];
  const parser = createMarkdownParseCoalescer(initial, (value) => commits.push(value));
  parser.update(initial + ' disabled', { enabled: false });
  parser.update(initial + ' disabled zero', { enabled: true, interval: 0 });
  assert.equal(commits.length, 2);
  parser.update(initial + ' disabled zero queued', { enabled: true, interval: NaN });
  t.mock.timers.tick(79);
  assert.equal(commits.length, 2);
  parser.cancel();
  t.mock.timers.tick(1000);
  assert.equal(commits.length, 2);
});
