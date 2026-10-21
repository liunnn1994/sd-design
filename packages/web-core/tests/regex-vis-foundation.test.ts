import assert from 'node:assert/strict';
import test from 'node:test';

import type { RegexVisFlag, RegexVisSelectInfo } from '../dist/regex-vis/types.js';

import { createRegexVisFoundation } from '../dist/regex-vis/foundation.js';
import { createRegexVisDiagram } from '../dist/regex-vis/layout.js';
import { parseRegex } from '../dist/regex-vis/parser/index.js';

const translate = (key: string, ...args: unknown[]) => `${key}:${args.join(',')}`;
function subject(value = 'a', flags: RegexVisFlag[] = []) {
  const state = {
    modelValue: value,
    flags,
    selectedId: undefined as string | undefined,
    selectable: true,
    parseResult: parseRegex(value, { flags }),
  };
  const events: RegexVisSelectInfo[] = [];
  const api = createRegexVisFoundation(state, translate, (info) => events.push(info));
  return { state, api, events };
}

for (const [pattern, flags] of [
  ['abc', []],
  ['a|bc', []],
  ['(?:ab)+', []],
  ['(?<name>ab){2,4}?', []],
  ['^a$', []],
  [String.raw`[a-z\d]`, []],
  ['[^a-z]', []],
  ['(?=a)b', []],
  ['(?<!a)b', []],
  [String.raw`(a)\1`, []],
  [String.raw`\p{Script=Han}+`, ['u']],
  ['😀{2}', ['u']],
  ['[一-龥]+', []],
  ['', []],
] as [string, RegexVisFlag[]][]) {
  test(`portable layout retains finite geometry, node identity and unique deterministic ids: ${pattern || '<empty>'}`, () => {
    const parsed = parseRegex(pattern, { flags });
    assert.equal(parsed.type, 'regex');
    if (parsed.type !== 'regex') return;
    const diagram = createRegexVisDiagram(parsed.body, translate);
    assert.ok(Number.isFinite(diagram.width) && diagram.width > 0);
    assert.ok(Number.isFinite(diagram.height) && diagram.height > 0);
    const ids = [...diagram.nodes, ...diagram.labels, ...diagram.quantifiers, ...diagram.paths].map(
      (item) => item.id,
    );
    assert.equal(new Set(ids).size, ids.length);
    for (const node of diagram.nodes) {
      assert.ok([node.x, node.y, node.width, node.height].every(Number.isFinite));
      assert.ok(node.x >= 0 && node.y >= 0 && node.width > 0 && node.height > 0);
      assert.ok(node.x + node.width <= diagram.width && node.y + node.height <= diagram.height);
      assert.ok(node.node && node.label.length > 0);
    }
    assert.ok(diagram.paths.every((path) => path.d.length > 0 && !/NaN|Infinity/.test(path.d)));
    const other = parseRegex('z');
    if (other.type === 'regex') createRegexVisDiagram(other.body, translate);
    assert.deepEqual(createRegexVisDiagram(parsed.body, translate), diagram);
  });
}

test('diagram creation preserves parser node references for selection payloads', () => {
  const parsed = parseRegex('abc');
  assert.equal(parsed.type, 'regex');
  if (parsed.type !== 'regex') return;
  const diagram = createRegexVisDiagram(parsed.body, translate);
  assert.ok(diagram.nodes.some((node) => node.node === parsed.body[0]));
});

test('foundation distinguishes parser error and empty input without invoking translation', () => {
  for (const value of ['[', '']) {
    const { state } = subject(value);
    const api = createRegexVisFoundation(
      state,
      () => {
        throw new Error('Unexpected layout');
      },
      () => {},
    );
    assert.equal(api.getDiagram(), undefined);
    assert.equal(
      api.getParseError(),
      state.parseResult.type === 'error' ? state.parseResult : undefined,
    );
  }
});

test('effective flags retain the literal or model array identity', () => {
  const plain = subject('a', ['g']);
  assert.equal(plain.api.getEffectiveFlags(), plain.state.flags);
  assert.equal(plain.api.getLiteralFlags(), undefined);
  const literal = subject('/a/i', ['g']);
  assert.equal(literal.state.parseResult.type, 'regex');
  if (literal.state.parseResult.type !== 'regex') return;
  assert.equal(literal.api.getEffectiveFlags(), literal.state.parseResult.flags);
  assert.equal(literal.api.getLiteralFlags(), literal.state.parseResult.flags);
});

test('flag updates filter unsupported types and preserve order and duplicates', () => {
  const { state, api } = subject();
  api.updateFlags(['d', true, 1, 'i', 'x', 'i', 'v', 'y']);
  assert.deepEqual(state.flags, ['d', 'i', 'i', 'y']);
  assert.equal(state.modelValue, 'a');
});

test('literal updates publish flags before rewriting from the current expression', () => {
  const trace: string[] = [];
  let model = '/a/g';
  let flags: RegexVisFlag[] = ['g'];
  const state = {
    get modelValue() {
      return model;
    },
    set modelValue(value: string) {
      trace.push('model');
      model = value;
    },
    get flags() {
      return flags;
    },
    set flags(value: RegexVisFlag[]) {
      trace.push('flags');
      flags = value;
    },
    selectedId: undefined as string | undefined,
    selectable: true,
    get parseResult() {
      trace.push('parsed');
      return parseRegex(model, { flags });
    },
  };
  const api = createRegexVisFoundation(state, translate, () => {});
  api.updateFlags(['m', 'i']);
  assert.equal(model, '/a/mi');
  assert.deepEqual(flags, ['m', 'i']);
  assert.equal(trace[0], 'flags');
  assert.equal(trace.at(-1), 'model');
});

test('literal rewriting re-reads the parsed state after a controlled flags callback', () => {
  const { state } = subject('/a/g');
  const api = createRegexVisFoundation(
    {
      get modelValue() {
        return state.modelValue;
      },
      set modelValue(value) {
        state.modelValue = value;
      },
      get flags() {
        return state.flags;
      },
      set flags(value) {
        state.flags = value;
        state.parseResult = parseRegex('plain');
      },
      get selectedId() {
        return state.selectedId;
      },
      set selectedId(value) {
        state.selectedId = value;
      },
      selectable: true,
      get parseResult() {
        return state.parseResult;
      },
    },
    translate,
    () => {},
  );
  api.updateFlags(['i']);
  assert.equal(state.modelValue, '/a/g');
  assert.deepEqual(state.flags, ['i']);
});

test('equal literal flags retain local identity; changed flags are copied', () => {
  const { state, api } = subject('a', ['g']);
  const original = state.flags;
  api.syncLiteralFlags(['g']);
  assert.equal(state.flags, original);
  api.syncLiteralFlags(undefined);
  assert.equal(state.flags, original);
  const next: RegexVisFlag[] = ['i', 'g'];
  api.syncLiteralFlags(next);
  assert.deepEqual(state.flags, next);
  assert.notEqual(state.flags, next);
});

test('selection commits before callback and keeps the original parser node', () => {
  const { state, api } = subject();
  const node = api.getDiagram()!.nodes[0]!;
  const error = new Error('selection callback');
  const controller = createRegexVisFoundation(state, translate, (info) => {
    assert.equal(state.selectedId, node.id);
    assert.equal(info.node, node.node);
    assert.equal(info.label, node.label);
    throw error;
  });
  assert.throws(
    () => controller.selectNode(node),
    (candidate) => candidate === error,
  );
  assert.equal(state.selectedId, node.id);
});

test('disabled selection leaves existing state and emits nothing', () => {
  const { state, api, events } = subject();
  const node = api.getDiagram()!.nodes[0]!;
  state.selectedId = 'prior';
  state.selectable = false;
  api.selectNode(node);
  assert.equal(state.selectedId, 'prior');
  assert.deepEqual(events, []);
});

test('diagram synchronization retains surviving ids and clears only missing truthy selections', () => {
  const { state, api } = subject();
  const diagram = api.getDiagram()!;
  state.selectedId = diagram.nodes[0]!.id;
  api.syncDiagram(diagram);
  assert.equal(state.selectedId, diagram.nodes[0]!.id);
  api.syncDiagram(undefined);
  assert.equal(state.selectedId, undefined);
  state.selectedId = '';
  api.syncDiagram(undefined);
  assert.equal(state.selectedId, '');
});

test('a failed flags setter stops parse evaluation and literal rewriting', () => {
  const { state } = subject('/a/g');
  const error = new Error('flags callback');
  const api = createRegexVisFoundation(
    {
      ...state,
      set flags(_value: RegexVisFlag[]) {
        throw error;
      },
      get flags() {
        return state.flags;
      },
      get parseResult() {
        throw new Error('Unexpected parse');
      },
    },
    translate,
    () => {},
  );
  assert.throws(
    () => api.updateFlags(['i']),
    (candidate) => candidate === error,
  );
  assert.equal(state.modelValue, '/a/g');
});
