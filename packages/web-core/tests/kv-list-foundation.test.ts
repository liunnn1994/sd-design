import assert from 'node:assert/strict';
import test from 'node:test';

import type { KvListState } from '../dist/kv-list/foundation.js';

import { createKvListFoundation } from '../dist/kv-list/foundation.js';
import { normalizeKvList, parseBulkKvList, stringifyKvList } from '../dist/kv-list/utils.js';

function subject(json: KvListState['json'] = [], bulk = '') {
  const state: KvListState = { rows: [], json, bulk, disabled: false };
  const api = createKvListFoundation(state);
  return { state, api };
}

test('normalization preserves whitespace, duplicate order and strips working ids', () => {
  const items = [
    { key: ' a ', value: ' b ', id: 4 },
    { key: ' ', value: 'ignored', id: 5 },
    { key: ' a ', value: 'c', id: 6 },
  ];
  assert.deepEqual(normalizeKvList(items), [
    { key: ' a ', value: ' b ' },
    { key: ' a ', value: 'c' },
  ]);
  assert.equal(stringifyKvList(items), ' a :  b \n a : c');
  assert.deepEqual(normalizeKvList(undefined), []);
});

test('bulk parser splits first colon and retains duplicates and empty values', () => {
  assert.deepEqual(parseBulkKvList(' a : b:c  \r\n a: \n bare \n :bad\n\n'), [
    { key: 'a', value: 'b:c' },
    { key: 'a', value: '' },
    { key: 'bare', value: '' },
  ]);
});

test('construction is lazy and initialization reads both models with JSON priority', () => {
  const trace: string[] = [];
  const state = {
    rows: [],
    get json() {
      trace.push('json');
      return [{ key: 'json', value: '1' }];
    },
    get bulk() {
      trace.push('bulk');
      return 'bulk: 2';
    },
    set bulk(value: string) {
      trace.push(value);
    },
    disabled: false,
  };
  const api = createKvListFoundation(state);
  assert.deepEqual(trace, []);
  api.initialize();
  assert.deepEqual(trace, ['json', 'bulk', 'json: 1']);
});

test('bulk fallback writes JSON without rewriting raw bulk input', () => {
  const { state, api } = subject([], ' a : b  ');
  api.initialize();
  assert.deepEqual(state.json, [{ key: 'a', value: 'b' }]);
  assert.equal(state.bulk, ' a : b  ');
  assert.deepEqual(state.rows, [{ id: 0, key: 'a', value: 'b' }]);
});

test('empty initialization provides a blank row without normalizing models', () => {
  const { state, api } = subject([{ key: ' ', value: 'x' }], '\n :bad');
  api.initialize();
  assert.deepEqual(state.rows, [{ id: 0, key: '', value: '' }]);
  assert.equal(state.bulk, '\n :bad');
  assert.deepEqual(state.json, [{ key: ' ', value: 'x' }]);
});

test('equal JSON and semantically equal bulk preserve array and row identity', () => {
  const { state, api } = subject([{ key: 'a', value: 'b' }]);
  api.initialize();
  const rows = state.rows;
  const row = rows[0];
  api.syncJson([{ key: 'a', value: 'b' }]);
  api.syncBulk(' a : b ');
  assert.equal(state.rows, rows);
  assert.equal(state.rows[0], row);
});

test('bulk JSON echo is suppressed once even after intervening different rows', () => {
  const { state, api } = subject();
  api.initialize();
  api.syncBulk('a: 1');
  api.syncJson([{ key: 'b', value: '2' }]);
  const rows = state.rows;
  api.syncJson([{ key: 'a', value: '1' }]);
  assert.equal(state.rows, rows);
  api.syncJson([{ key: 'a', value: '1' }]);
  assert.notEqual(state.rows, rows);
  assert.equal(state.rows[0]?.key, 'a');
});

test('removing last row recreates a blank with monotonic id and clears models', () => {
  const { state, api } = subject([{ key: 'a', value: 'b' }]);
  api.initialize();
  api.removeItem(0);
  assert.deepEqual(state.rows, [{ id: 1, key: '', value: '' }]);
  assert.deepEqual(state.json, []);
  assert.equal(state.bulk, '');
  api.clearItems();
  assert.equal(state.rows[0]?.id, 2);
});

test('reorder copies the collection and preserves working object identities', () => {
  const { state, api } = subject([
    { key: 'a', value: '1' },
    { key: 'b', value: '2' },
  ]);
  api.initialize();
  const rows = state.rows;
  const first = rows[0];
  const second = rows[1];
  api.moveItem(0, 1);
  assert.notEqual(state.rows, rows);
  assert.equal(state.rows[0], second);
  assert.equal(state.rows[1], first);
  assert.equal(state.bulk, 'b: 2\na: 1');
});

test('disabled gates edit actions while external synchronization remains active', () => {
  const { state, api } = subject([{ key: 'a', value: '1' }]);
  api.initialize();
  Object.defineProperty(state, 'disabled', { value: true });
  const rows = state.rows;
  api.addItem();
  api.updateItem(0, { id: 100, key: 'x', value: 'x' });
  api.removeItem(0);
  api.clearItems();
  assert.equal(state.rows, rows);
  api.syncBulk('b: 2');
  assert.equal(state.rows[0]?.key, 'b');
  api.syncJson([{ key: 'c', value: '3' }]);
  assert.equal(state.bulk, 'c: 3');
});

test('commit writes JSON before bulk and stops at a rejected JSON setter', () => {
  const { state, api } = subject();
  api.initialize();
  const events: string[] = [];
  Object.defineProperty(state, 'json', {
    get: () => [],
    set: () => {
      events.push('json');
      throw new Error('rejected');
    },
  });
  Object.defineProperty(state, 'bulk', { get: () => '', set: () => events.push('bulk') });
  assert.throws(() => api.updateItem(0, { id: 0, key: 'a', value: '1' }), /rejected/);
  assert.deepEqual(events, ['json']);
  assert.equal(state.rows[0]?.key, 'a');
});

test('instances do not share ids or pending echoes', () => {
  const first = subject();
  const second = subject();
  first.api.initialize();
  second.api.initialize();
  first.api.syncBulk('a: 1');
  second.api.syncJson([{ key: 'a', value: '1' }]);
  assert.equal(second.state.rows[0]?.id, 1);
  first.api.addItem();
  assert.equal(second.state.rows.length, 1);
});
