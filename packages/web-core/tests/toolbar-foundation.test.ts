import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ToolbarModelValue } from '../dist/toolbar/types.js';

import {
  createToolbarFoundation,
  type ToolbarSchema,
  type ToolbarFoundationState,
} from '../dist/toolbar/foundation.js';
function fixture<Schema extends ToolbarSchema = ToolbarSchema>(
  modelValue: ToolbarModelValue = {},
  schemas: Schema[] = [],
) {
  const props = { schemas, resetSkipKeys: [] as string[], allowExpand: false, itemHeight: 32 };
  const state: ToolbarFoundationState<Schema> = {
    props,
    modelValue,
    isExpand: false,
    isOverflow: false,
    bodyHeight: 0,
  };
  const events: unknown[][] = [];
  const foundation = createToolbarFoundation(state, {
    search: (value) => events.push(['search', value]),
    reset: () => events.push(['reset', state.modelValue]),
    clearValidate: () => events.push(['clear', state.modelValue]),
  });
  return { props, state, events, foundation };
}
test('initial snapshot and every reset are independent of edited nested objects', () => {
  const initial = { filter: { term: 'initial' } },
    f = fixture(initial);
  initial.filter.term = 'changed';
  f.foundation.reset();
  assert.deepEqual(f.state.modelValue, { filter: { term: 'initial' } });
  (f.state.modelValue.filter as { term: string }).term = 'another';
  f.foundation.reset(false);
  assert.deepEqual(f.state.modelValue, { filter: { term: 'initial' } });
  assert.deepEqual(
    f.events.map((e) => e[0]),
    ['clear', 'reset', 'clear'],
  );
});
test('reset drops added keys, preserves skipped current identity and notifies after validation clear', () => {
  const f = fixture({ name: 'initial', keep: { id: 0 }, missing: 'initial' }),
    current = { id: 1 };
  f.props.resetSkipKeys = ['keep', 'missing'];
  f.state.modelValue = { name: 'edited', keep: current, added: true };
  f.foundation.reset();
  assert.deepEqual(f.state.modelValue, { name: 'initial', keep: current });
  assert.equal(f.state.modelValue.keep, current);
  assert.equal(f.events[0][0], 'clear');
  assert.equal(f.events[0][1], f.state.modelValue);
  assert.equal(f.events[1][0], 'reset');
  assert.equal(f.events[1][1], f.state.modelValue);
});
test('own prototype-like fields restore and skip as ordinary own data properties', () => {
  for (const skipped of [false, true]) {
    const f = fixture(JSON.parse('{"__proto__":{"value":"initial"},"constructor":"initial"}'));
    if (skipped) f.props.resetSkipKeys = ['__proto__', 'constructor'];
    f.state.modelValue = JSON.parse('{"__proto__":{"value":"edited"},"constructor":"edited"}');
    const current = f.state.modelValue.__proto__;
    f.foundation.reset();
    assert.equal(Object.getPrototypeOf(f.state.modelValue), Object.prototype);
    assert.equal(Object.hasOwn(f.state.modelValue, '__proto__'), true);
    assert.deepEqual(f.state.modelValue.__proto__, { value: skipped ? 'edited' : 'initial' });
    if (skipped) assert.equal(f.state.modelValue.__proto__, current);
    assert.equal(f.state.modelValue.constructor, skipped ? 'edited' : 'initial');
    assert.deepEqual(Object.getOwnPropertyDescriptor(f.state.modelValue, '__proto__'), {
      value: f.state.modelValue.__proto__,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
});
test('reset notification retains truthiness semantics and search forwards the current object', () => {
  const f = fixture({ n: 0 });
  for (const flag of [false, 0, '', null]) f.foundation.reset(flag);
  assert.equal(f.events.filter((e) => e[0] === 'reset').length, 0);
  f.foundation.reset({});
  assert.equal(f.events.at(-1)?.[0], 'reset');
  const current = { n: 1 };
  f.state.modelValue = current;
  f.foundation.handleSearch();
  assert.equal(f.events.at(-1)?.[1], current);
});
test('model writes remain delegated when a controlled owner has not accepted the reset', () => {
  const f = fixture({ term: 'initial' }),
    current = { term: 'current' },
    requests: ToolbarModelValue[] = [];
  Object.defineProperty(f.state, 'modelValue', {
    configurable: true,
    get: () => current,
    set: (value: ToolbarModelValue) => requests.push(value),
  });
  f.foundation.reset();
  assert.deepEqual(requests, [{ term: 'initial' }]);
  assert.equal(f.events[0][1], current);
  assert.equal(f.events[1][1], current);
});
test('Enter ignores composition, prevented actions and interactive descendants', () => {
  const f = fixture(),
    descriptor = Object.getOwnPropertyDescriptor(globalThis, 'Element');
  const selectors: string[] = [];
  class NativeElement {
    readonly interactive: boolean;
    constructor(interactive: boolean) {
      this.interactive = interactive;
    }
    closest(selector: string) {
      selectors.push(selector);
      return this.interactive ? this : null;
    }
  }
  const event = (target: unknown, extra: object = {}) =>
    ({ target, isComposing: false, defaultPrevented: false, ...extra }) as KeyboardEvent;
  try {
    Object.defineProperty(globalThis, 'Element', { configurable: true, value: NativeElement });
    f.foundation.onEnter(event(null, { isComposing: true }));
    f.foundation.onEnter(event(null, { defaultPrevented: true }));
    f.foundation.onEnter(event(new NativeElement(true)));
    assert.deepEqual(f.events, []);
    f.foundation.onEnter(event(new NativeElement(false)));
    f.foundation.onEnter(event(null));
    assert.equal(f.events.length, 2);
    assert.deepEqual(selectors, [
      'button, a, textarea, [contenteditable="true"]',
      'button, a, textarea, [contenteditable="true"]',
    ]);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'Element', descriptor);
    else Reflect.deleteProperty(globalThis, 'Element');
  }
});
test('measurement uses full scroll height, strict overflow threshold and live expand rules', () => {
  const f = fixture();
  assert.equal(f.foundation.getBodyMaxHeight(), 'none');
  f.props.allowExpand = true;
  f.foundation.measure({ target: { scrollHeight: 32 } });
  assert.equal(f.state.isOverflow, false);
  f.foundation.measure({ target: { scrollHeight: 100 } });
  assert.equal(f.state.isOverflow, true);
  assert.equal(f.foundation.getBodyMaxHeight(), '32px');
  f.foundation.toggleExpand();
  assert.equal(f.foundation.getBodyMaxHeight(), '100px');
  f.props.itemHeight = 120;
  f.foundation.measure({ target: { scrollHeight: 100 } });
  assert.equal(f.state.isOverflow, false);
  f.foundation.toggleExpand();
  assert.equal(f.foundation.getBodyMaxHeight(), '120px');
  f.props.allowExpand = false;
  assert.equal(f.foundation.getBodyMaxHeight(), 'none');
});
test('schema grid normalization preserves explicit style and opaque renderer identities', () => {
  const renderer = () => 'slot',
    opaque = {},
    schemas = [
      {
        span: 2,
        renderer,
        opaque,
        formItemProps: { style: { gridColumn: 'custom', color: 'red' } },
      },
      { span: 0, renderer, opaque },
    ];
  const f = fixture({}, schemas),
    result = f.foundation.getResolvedSchemas();
  assert.notEqual(result[0], schemas[0]);
  assert.equal(result[0].renderer, renderer);
  assert.equal(result[0].opaque, opaque);
  assert.deepEqual(result[0].formItemProps.style, { gridColumn: 'custom', color: 'red' });
  assert.deepEqual(result[1].formItemProps.style, { gridColumn: 'span 1' });
  assert.equal(schemas[1].formItemProps, undefined);
  assert.notEqual(result[0].formItemProps, schemas[0].formItemProps);
});
test('schema slots recurse in insertion order, retain empty names and deduplicate without action slots', () => {
  const f = fixture({}, [
    { slotName: 'top', children: [{ slotName: 'nested' }, { slotName: 'top' }, { slotName: 42 }] },
    { slotName: '' },
  ]);
  assert.deepEqual(f.foundation.getSchemaSlotNames(), ['top', 'nested', '']);
  assert.equal(typeof globalThis.document, 'undefined');
});
