import assert from 'node:assert/strict';
import { test } from 'node:test';

import { groupDescriptions, resolveDescriptionAlign } from '../dist/descriptions/foundation.js';
const group = (spans: (number | null | undefined)[], column: number) =>
  groupDescriptions(
    spans,
    (span) => span,
    () => column,
  ).map((row) => row.map((item) => ({ span: item.span, index: item.index })));

test('empty data never reads the span or column ports', () => {
  assert.deepEqual(
    groupDescriptions(
      [],
      () => {
        throw Error('span');
      },
      () => {
        throw Error('column');
      },
    ),
    [],
  );
});
test('default spans retain identity and indexes, fill only the last item and do not mutate inputs', () => {
  const data = Object.freeze([Object.freeze({ name: 'first' }), Object.freeze({ name: 'second' })]);
  const rows = groupDescriptions(
    data,
    () => undefined,
    () => 3,
  );
  assert.deepEqual(
    rows.map((row) => row.map((item) => item.span)),
    [[1, 2]],
  );
  assert.equal(rows[0][0].data, data[0]);
  assert.equal(rows[0][1].data, data[1]);
  assert.deepEqual(
    rows[0].map((item) => item.index),
    [0, 1],
  );
  assert.deepEqual(data, [{ name: 'first' }, { name: 'second' }]);
});
test('overflow starts a new row and pads each previous final entry', () => {
  assert.deepEqual(group([2, 2, undefined, 1], 3), [
    [{ span: 3, index: 0 }],
    [
      { span: 2, index: 1 },
      { span: 1, index: 2 },
    ],
    [{ span: 3, index: 3 }],
  ]);
  assert.deepEqual(group([99, undefined], 3), [[{ span: 3, index: 0 }], [{ span: 3, index: 1 }]]);
});
test('nullish spans default while zero and negative spans retain existing arithmetic', () => {
  assert.deepEqual(group([null, undefined], 3), [
    [
      { span: 1, index: 0 },
      { span: 2, index: 1 },
    ],
  ]);
  assert.deepEqual(group([0, 1], 3), [
    [
      { span: 0, index: 0 },
      { span: 3, index: 1 },
    ],
  ]);
  assert.deepEqual(group([-1, 1], 3), [
    [
      { span: -1, index: 0 },
      { span: 4, index: 1 },
    ],
  ]);
});
test('fractional and nonpositive column values are not silently normalized', () => {
  assert.deepEqual(group([1.5, 1.5], 2.5), [[{ span: 2.5, index: 0 }], [{ span: 2.5, index: 1 }]]);
  assert.deepEqual(group([1, 1], 0), [
    [
      { span: 0, index: 0 },
      { span: 0, index: 1 },
    ],
  ]);
  assert.deepEqual(group([1, 1], -2), [
    [
      { span: -2, index: 0 },
      { span: 0, index: 1 },
    ],
  ]);
});
test('non-finite values preserve prior Math.min and tail-padding behavior', () => {
  assert.deepEqual(group([NaN, 1], 3), [
    [
      { span: NaN, index: 0 },
      { span: NaN, index: 1 },
    ],
  ]);
  assert.deepEqual(group([1, 1], NaN), [
    [
      { span: NaN, index: 0 },
      { span: NaN, index: 1 },
    ],
  ]);
  assert.deepEqual(group([1, 1], Infinity), [
    [
      { span: 1, index: 0 },
      { span: Infinity, index: 1 },
    ],
  ]);
});
test('sparse arrays retain source indexes without manufacturing empty cells', () => {
  const data = new Array<{ span: number }>(4);
  data[1] = { span: 1 };
  data[3] = { span: 2 };
  const rows = groupDescriptions(
    data,
    (item) => item.span,
    () => 3,
  );
  assert.deepEqual(
    rows[0].map((item) => item.index),
    [1, 3],
  );
  assert.equal(rows[0][1].data, data[3]);
});
test('opaque renderer nodes are passed through a span port without framework assumptions', () => {
  const first = Symbol('node'),
    second = Symbol('node');
  const rows = groupDescriptions(
    [first, second],
    (item) => (item === first ? 2 : 1),
    () => 3,
  );
  assert.equal(rows[0][0].data, first);
  assert.equal(rows[0][1].data, second);
  assert.deepEqual(
    rows[0].map((item) => item.span),
    [2, 1],
  );
});
test('live column access order remains unchanged across overflow and final padding', () => {
  const events: string[] = [],
    columns = [3, 3, 2, 2, 5, 4];
  const rows = groupDescriptions(
    ['a', 'b'],
    (item) => {
      events.push('span:' + item);
      return 2;
    },
    () => {
      const column = columns.shift()!;
      events.push('column:' + column);
      return column;
    },
  );
  assert.deepEqual(events, [
    'span:a',
    'column:3',
    'column:3',
    'span:b',
    'column:2',
    'column:2',
    'column:5',
    'column:4',
  ]);
  assert.deepEqual(
    rows.map((row) => row.map((item) => item.span)),
    [[5], [4]],
  );
});
test('alignment preserves side-specific fallbacks and reads only the requested side', () => {
  for (const part of ['label', 'value'] as const) {
    assert.equal(resolveDescriptionAlign(undefined, part), 'left');
    assert.equal(resolveDescriptionAlign(null, part), 'left');
    assert.equal(resolveDescriptionAlign('right', part), 'right');
    assert.equal(resolveDescriptionAlign({}, part), 'left');
  }
  assert.equal(resolveDescriptionAlign({ label: 'center' }, 'label'), 'center');
  assert.equal(resolveDescriptionAlign({ label: 'center' }, 'value'), 'left');
  assert.equal(
    resolveDescriptionAlign(
      {
        label: 'right',
        get value() {
          throw Error('other side');
        },
      },
      'label',
    ),
    'right',
  );
});
