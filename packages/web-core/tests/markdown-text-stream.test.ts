import assert from 'node:assert/strict';
import test from 'node:test';

import { createMarkdownTextStream } from '../dist/markdown/text-stream.js';

test('text deltas coalesce within 50ms and cap at four active segments', () => {
  const stream = createMarkdownTextStream('A');
  stream.update('AB', undefined, true, 0);
  stream.update('ABC', undefined, true, 49);
  assert.deepEqual(
    stream.segments.map((segment) => segment.content),
    ['BC'],
  );
  for (let index = 0; index < 5; index++)
    stream.update('ABC' + 'D'.repeat(index + 1), undefined, true, 100 + index * 100);
  assert.deepEqual(
    stream.segments.map((segment) => segment.content),
    ['BC', 'D', 'D', 'DDD'],
  );
});

test('finishing out of order waits for the leading segment and selection can hold settlement', () => {
  const stream = createMarkdownTextStream('A');
  stream.update('AB', undefined, true, 0);
  stream.update('ABC', undefined, true, 100);
  assert.equal(stream.finish(stream.segments[1].id), false);
  assert.equal(stream.settled, 'A');
  stream.finish(stream.segments[0].id, true);
  assert.equal(stream.segments.length, 2);
  assert.equal(stream.settleFinished(), true);
  assert.equal(stream.settled, 'ABC');
  assert.equal(stream.segments.length, 0);
});

test('unchanged content leaves animations active while replacement and disabled fade settle', () => {
  const stream = createMarkdownTextStream('A');
  stream.update('AB', 'A', true, 0);
  assert.equal(stream.update('AB', 'AB', true, 100), false);
  assert.equal(stream.segments.length, 1);
  stream.update('Replacement', 'AB', true, 200);
  assert.equal(stream.settled, 'Replacement');
  stream.update('Replacement text', undefined, false, 300);
  assert.equal(stream.settled, 'Replacement text');
  assert.equal(stream.segments.length, 0);
});

test('a remounted text node animates only the suffix missing from its cached content', () => {
  const stream = createMarkdownTextStream('ABC');
  stream.update('ABC', 'A', true, 0);
  assert.equal(stream.settled, 'A');
  assert.equal(stream.segments[0].content, 'BC');
});
