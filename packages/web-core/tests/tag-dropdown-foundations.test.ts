import assert from 'node:assert/strict';
import test from 'node:test';

import type { DropdownValue, DropdownOptionContext } from '../dist/dropdown/foundation.js';
import type {
  TagGroupOption,
  TagGroupFieldNames,
  NormalizedTagGroupOption,
} from '../dist/tag-group/types.js';

import {
  createDropdownFoundation,
  createDropdownOptionFoundation,
} from '../dist/dropdown/foundation.js';
import { createDropdownPanelFoundation } from '../dist/dropdown/panel.js';
import { createTagGroupFoundation } from '../dist/tag-group/foundation.js';

function tags(
  options: TagGroupOption[],
  maxCount: number | 'responsive' = 'responsive',
  fieldNames: TagGroupFieldNames = {},
) {
  const state = {
    options,
    maxCount,
    fieldNames,
    normalizedOptions: [] as NormalizedTagGroupOption[],
    visibleCount: 0,
  };
  const api = createTagGroupFoundation(state);
  const refresh = () => {
    state.normalizedOptions = api.getNormalizedOptions();
    state.visibleCount = api.getVisibleCount();
  };
  refresh();
  return { state, api, refresh };
}

test('tag normalization retains primitive identity, boxed numbers and NaN compatibility', () => {
  const boxed = new Number(4) as unknown as number;
  const { state } = tags(['a', 0, boxed, NaN]);
  assert.deepEqual(
    state.normalizedOptions.map((item) => item.key),
    ['a-0', '0-1', '4-2', 'NaN-3'],
  );
  assert.equal(state.normalizedOptions[2]?.label, boxed);
  assert.equal(state.normalizedOptions[2]?.raw.value, boxed);
  assert.equal(Number.isNaN(state.normalizedOptions[3]?.value), true);
});

test('tag boxed strings retain the object path rather than the primitive path', () => {
  const { state } = tags([new String('ab') as unknown as string]);
  assert.equal(state.normalizedOptions[0]?.key, 'undefined-0');
  assert.equal(state.normalizedOptions[0]?.label, undefined);
  assert.deepEqual(state.normalizedOptions[0]?.itemProps, { 0: 'a', 1: 'b' });
});

test('tag custom fields fall back on nullish values and filter only mapped fields', () => {
  const { state } = tags([{ title: null, id: 0, label: 'Fallback', value: 8, color: 'red' }], 1, {
    label: 'title',
    value: 'id',
  });
  const item = state.normalizedOptions[0]!;
  assert.equal(item.label, 'Fallback');
  assert.equal(item.value, 0);
  assert.deepEqual(item.itemProps, { label: 'Fallback', value: 8, color: 'red' });
});

test('tag explicit item props retain identity and raw is a shallow copy', () => {
  const itemProps = { closable: true };
  const option = { label: 'A', value: 'a', itemProps };
  const item = tags([option]).state.normalizedOptions[0]!;
  assert.notEqual(item.raw, option);
  assert.equal(item.raw.itemProps, itemProps);
  assert.equal(item.itemProps, itemProps);
});

for (const itemProps of [undefined, null, [], 'invalid', 1]) {
  test(`tag invalid item props use legacy field filtering: ${String(itemProps)}`, () => {
    const item = tags([
      { label: 'A', value: 1, color: 'red', itemProps } as unknown as TagGroupOption,
    ]).state.normalizedOptions[0]!;
    assert.deepEqual(item.itemProps, { color: 'red' });
  });
}

test('tag callback runs before cloning and remains live at render-label resolution', () => {
  let calls = 0;
  const originalProps = { color: 'red' };
  const nextProps = { color: 'blue' };
  const option = {
    label: function (this: unknown) {
      assert.equal(this, undefined);
      calls++;
      option.itemProps = nextProps;
      return calls;
    },
    value: 'v',
    itemProps: originalProps,
  };
  const { state, api } = tags([option]);
  const item = state.normalizedOptions[0]!;
  assert.equal(item.label, 1);
  assert.equal(item.raw.label, option.label);
  assert.equal(item.itemProps, nextProps);
  assert.equal(api.resolveOptionLabel(item), 2);
  assert.equal(api.resolveOptionLabel(item), 3);
});

test('tag factory is lazy and field names are re-read per option', () => {
  let fields = 0;
  let options = 0;
  const api = createTagGroupFoundation({
    get options() {
      options++;
      return ['a', 'b'];
    },
    get fieldNames() {
      fields++;
      return {};
    },
    maxCount: 1,
    normalizedOptions: [],
    visibleCount: 0,
  });
  assert.equal(fields, 0);
  assert.equal(options, 0);
  api.getNormalizedOptions();
  assert.equal(options, 1);
  assert.equal(fields, 2);
});

test('tag keeps itemProps repeated getter reads and duplicate key indices', () => {
  let reads = 0;
  const props = {};
  const option = {
    label: 'A',
    value: 'same',
    get itemProps() {
      reads++;
      return props;
    },
  };
  const { state } = tags([option, { label: 'B', value: 'same' }]);
  assert.equal(reads, 5);
  assert.deepEqual(
    state.normalizedOptions.map((item) => item.key),
    ['same-0', 'same-1'],
  );
});

for (const max of [0, -1, 1, 1.5, 2, Infinity, NaN, 'responsive'] as const) {
  test(`tag visible count and slices preserve numeric boundaries: ${max}`, () => {
    const { state, api } = tags(['a', 'b', 'c'], max);
    const count = typeof max === 'number' && max > 0 ? Math.min(max, 3) : 3;
    assert.equal(state.visibleCount, count);
    assert.deepEqual(api.getVisibleOptions(), state.normalizedOptions.slice(0, count));
    assert.deepEqual(api.getHiddenOptions(), state.normalizedOptions.slice(count));
    assert.equal(api.getVisibleOptions()[0], state.normalizedOptions[0]);
  });
}

test('tag callback error aborts normalization before later options', () => {
  let later = 0;
  assert.throws(
    () =>
      tags([
        {
          label: () => {
            throw new Error('label');
          },
          value: 1,
        },
        {
          get label() {
            later++;
            return 'B';
          },
          value: 2,
        },
      ]),
    /label/,
  );
  assert.equal(later, 0);
});

test('dropdown reads hide policy after select, retaining value/event and callback order', () => {
  const trace: unknown[] = [];
  let hide = true;
  const value = { id: 1 };
  const event = new Event('click');
  const api = createDropdownFoundation(
    {
      get hideOnSelect() {
        trace.push('hide');
        return hide;
      },
    },
    (v, ev) => {
      trace.push(v, ev);
      hide = false;
    },
    (v) => trace.push(v),
  );
  assert.deepEqual(trace, []);
  api.handleOptionClick(value, event);
  assert.deepEqual(trace, [value, event, 'hide']);
  hide = true;
  createDropdownFoundation(
    { hideOnSelect: true },
    (v, ev) => trace.push(v, ev),
    (v) => trace.push(v),
  ).handleOptionClick(0, event);
  assert.deepEqual(trace.slice(-3), [0, event, false]);
});

test('dropdown select exception prevents policy reads and close requests', () => {
  const api = createDropdownFoundation(
    {
      get hideOnSelect() {
        assert.fail('unexpected policy read');
      },
    },
    () => {
      throw new Error('select');
    },
    () => assert.fail('unexpected close'),
  );
  assert.throws(() => api.handleOptionClick(undefined, new Event('click')), /select/);
});

test('dropdown missing context emits click without reading value or text', () => {
  const trace: string[] = [];
  const api = createDropdownOptionFoundation(
    {
      disabled: false,
      context: undefined,
      get value(): DropdownValue {
        assert.fail('unexpected value');
      },
    },
    () => {
      assert.fail('unexpected text');
    },
    () => trace.push('click'),
  );
  api.handleClick({} as MouseEvent);
  assert.deepEqual(trace, ['click']);
});

test('dropdown disabled option does not emit or inspect context', () => {
  const api = createDropdownOptionFoundation(
    {
      disabled: true,
      value: 'a',
      get context(): DropdownOptionContext | undefined {
        assert.fail('unexpected context');
      },
    },
    () => assert.fail('text'),
    () => assert.fail('click'),
  );
  api.handleClick({} as MouseEvent);
});

for (const value of [undefined, null, '', 0, 'a', { id: 1 }]) {
  test(`dropdown option preserves nullish text fallback and receiver: ${String(value)}`, () => {
    const trace: unknown[] = [];
    const event = {} as MouseEvent;
    let textReads = 0;
    const context = {
      onOptionClick(this: unknown, v: DropdownValue, ev: Event) {
        assert.equal(this, context);
        trace.push(v, ev);
      },
    };
    const api = createDropdownOptionFoundation(
      { disabled: false, value: value as DropdownValue, context },
      () => {
        textReads++;
        return 'Text';
      },
      (ev) => trace.push(ev),
    );
    api.handleClick(event);
    assert.deepEqual(trace, [event, value ?? 'Text', event]);
    assert.equal(textReads, value == null ? 1 : 0);
  });
}

test('dropdown option re-reads value after click and aborts on click error', () => {
  let value: DropdownValue = 'old';
  const seen: DropdownValue[] = [];
  const context = { onOptionClick: (v: DropdownValue) => seen.push(v) };
  createDropdownOptionFoundation(
    {
      disabled: false,
      get value() {
        return value;
      },
      context,
    },
    () => '',
    () => {
      value = 0;
    },
  ).handleClick({} as MouseEvent);
  assert.deepEqual(seen, [0]);
  const api = createDropdownOptionFoundation(
    {
      disabled: false,
      value: 1,
      get context(): DropdownOptionContext | undefined {
        assert.fail('context');
      },
    },
    () => '',
    () => {
      throw new Error('click');
    },
  );
  assert.throws(() => api.handleClick({} as MouseEvent), /click/);
});

function panel(count = 3) {
  let active: Element | null = null;
  let serial = 0;
  let allowFocus = true;
  const trace: unknown[] = [];
  const frames = new Map<number, FrameRequestCallback>();
  function element(disabled = 'false') {
    const node = {
      disabled,
      isContentEditable: false,
      closestResult: null as object | null,
      getAttribute(name: string) {
        assert.equal(name, 'aria-disabled');
        return node.disabled;
      },
      closest(selector: string) {
        assert.equal(selector, 'input, textarea, select');
        return node.closestResult;
      },
      focus() {
        trace.push(this);
        if (allowFocus) active = this as unknown as HTMLElement;
      },
      click() {
        trace.push('click', node);
      },
    };
    return node;
  }
  const items = Array.from({ length: count }, () => element());
  const list = {
    ...element(),
    querySelectorAll(selector: string) {
      assert.equal(selector, '[role="menuitem"]');
      return items;
    },
  };
  const state = {
    list: list as unknown as HTMLElement | undefined,
    bottomOffset: 0,
    trigger: 'click' as string | string[],
    get isHoverTrigger() {
      return api.getIsHoverTrigger();
    },
    popupMaxHeight: true as boolean | number | undefined,
  };
  const environment = {
    get activeElement() {
      return active;
    },
    isElement(value: unknown): value is HTMLElement {
      return !!value && typeof value === 'object' && 'focus' in value;
    },
    requestFrame(callback: FrameRequestCallback) {
      const frame = ++serial;
      frames.set(frame, callback);
      return frame;
    },
    cancelFrame(frame: number) {
      trace.push(['cancel', frame]);
      frames.delete(frame);
    },
  };
  const api = createDropdownPanelFoundation(
    state,
    environment,
    (event) => trace.push(['scroll', event]),
    (event) => trace.push(['bottom', event]),
  );
  const key = (key: string, target: unknown = null) => {
    const event = {
      key,
      target,
      preventDefault() {
        trace.push('prevent');
      },
    } as unknown as KeyboardEvent;
    api.handleKeydown(event);
  };
  return {
    api,
    state,
    items,
    list,
    trace,
    frames,
    element,
    key,
    setActive(value: unknown) {
      active = value as Element | null;
    },
    getActive: () => active,
    denyFocus() {
      allowFocus = false;
    },
  };
}

test('dropdown navigation skips disabled items, wraps and supports Home/End', () => {
  const p = panel();
  p.items[1]!.disabled = 'true';
  p.key('ArrowDown');
  assert.equal(p.getActive(), p.items[0]);
  p.key('ArrowDown');
  assert.equal(p.getActive(), p.items[2]);
  p.key('ArrowDown');
  assert.equal(p.getActive(), p.items[0]);
  p.key('ArrowUp');
  assert.equal(p.getActive(), p.items[2]);
  p.key('Home');
  assert.equal(p.getActive(), p.items[0]);
  p.key('End');
  assert.equal(p.getActive(), p.items[2]);
});

test('dropdown keeps case-sensitive aria-disabled filtering and ignores unknown keys', () => {
  const p = panel(1);
  p.items[0]!.disabled = 'TRUE';
  p.key('Home');
  assert.equal(p.getActive(), p.items[0]);
  p.trace.length = 0;
  p.key('Escape');
  assert.deepEqual(p.trace, []);
});

for (const key of ['Enter', ' ']) {
  test(`dropdown activation clicks the current native element after prevention: ${key}`, () => {
    const p = panel();
    const outside = p.element();
    p.setActive(outside);
    p.key(key);
    assert.deepEqual(p.trace, ['prevent', 'click', outside]);
  });
}

test('dropdown editable targets retain their native key behavior', () => {
  const p = panel();
  const target = p.element();
  target.isContentEditable = true;
  p.key('ArrowDown', target);
  p.key(' ', target);
  assert.deepEqual(p.trace, []);
  target.isContentEditable = false;
  target.closestResult = {};
  p.key('Home', target);
  assert.deepEqual(p.trace, []);
});

test('dropdown empty navigation prevents default without moving focus', () => {
  const p = panel(0);
  p.key('ArrowDown');
  assert.deepEqual(p.trace, ['prevent']);
  p.state.list = undefined;
  p.key('End');
  assert.deepEqual(p.trace, ['prevent', 'prevent']);
});

test('dropdown reach-bottom precedes scroll and callback errors stop forwarding', () => {
  const p = panel();
  const event = {
    target: { scrollTop: 60, scrollHeight: 100, offsetHeight: 40 },
  } as unknown as Event;
  p.api.handleScroll(event);
  assert.deepEqual(p.trace, [
    ['bottom', event],
    ['scroll', event],
  ]);
  p.trace.length = 0;
  p.state.bottomOffset = -1;
  p.api.handleScroll(event);
  assert.deepEqual(p.trace, [['scroll', event]]);
  const api = createDropdownPanelFoundation(
    p.state,
    {
      activeElement: null,
      isElement: (_): _ is HTMLElement => false,
      requestFrame: () => 0,
      cancelFrame() {},
    },
    () => assert.fail('scroll'),
    () => {
      throw new Error('bottom');
    },
  );
  p.state.bottomOffset = 0;
  assert.throws(() => api.handleScroll(event), /bottom/);
});

for (const value of [undefined, false, true, 0, 10, NaN, new Number(24)] as const) {
  test(`dropdown popup height retains exact legacy numeric checks: ${String(value)}`, () => {
    const p = panel();
    p.state.popupMaxHeight = value as boolean | number | undefined;
    const expected =
      Object.prototype.toString.call(value) === '[object Number]' && value === value
        ? { maxHeight: `${value}px` }
        : !value
          ? { maxHeight: 'none', overflowY: 'hidden' }
          : undefined;
    assert.deepEqual(p.api.getStyle(), expected);
  });
}

for (const trigger of ['hover', ['click', 'hover'], 'click', ['contextMenu']]) {
  test(`dropdown initial focus schedules only for active triggers: ${trigger}`, () => {
    const p = panel();
    p.state.trigger = trigger;
    const scheduled: (() => void)[] = [];
    p.api.focusOnMount((callback) => scheduled.push(callback));
    assert.equal(
      scheduled.length,
      typeof trigger === 'string'
        ? Number(trigger !== 'hover')
        : Number(!trigger.includes('hover')),
    );
    if (scheduled[0]) {
      assert.equal(p.getActive(), null);
      scheduled[0]();
      assert.equal(p.getActive(), p.items[0]);
    }
  });
}

test('dropdown focus retry uses the live list and cancellation releases the scheduled frame', () => {
  const p = panel();
  p.denyFocus();
  let scheduled: (() => void) | undefined;
  p.api.focusOnMount((callback) => {
    scheduled = callback;
  });
  assert.equal(p.frames.size, 0);
  scheduled!();
  assert.equal(p.frames.size, 1);
  p.state.list = undefined;
  const callback = [...p.frames.values()][0]!;
  callback(0);
  assert.equal(p.trace.length, 1);
  p.api.destroy();
  assert.deepEqual(p.trace.at(-1), ['cancel', 1]);
  assert.equal(p.frames.size, 0);
});

test('dropdown empty menu focuses its list and canceled pre-tick mount reads no stale list', () => {
  const p = panel(0);
  const scheduled: (() => void)[] = [];
  p.api.focusOnMount((callback) => scheduled.push(callback));
  scheduled[0]!();
  assert.equal(p.trace[0], p.list);
  p.api.destroy();
  assert.deepEqual(p.trace.at(-1), ['cancel', 0]);
  p.trace.length = 0;
  p.state.list = undefined;
  p.api.focusOnMount((callback) => scheduled.push(callback));
  scheduled[1]!();
  assert.deepEqual(p.trace, []);
});
