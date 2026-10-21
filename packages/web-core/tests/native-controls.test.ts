import assert from 'node:assert/strict';
import { test } from 'node:test';

import { dayjs } from '../dist/_utils/date.js';
import {
  createTimePickerValueFoundation,
  createRangeTimePickerValueFoundation,
  getSideTimePickerProps,
} from '../dist/date-picker/time-value.js';
import { createSelectViewFocus } from '../dist/select/view-focus.js';
import * as expand from '../dist/transition/expand.js';
import { createTreeExpandTransition } from '../dist/tree/expand-transition.js';

test('shared expand stages measure live content and clear only height', () => {
  const element = { style: { height: 'old', width: '17px' }, scrollHeight: 42 };
  const target = element as unknown as Element;
  expand.onBeforeEnter(target);
  assert.equal(element.style.height, '0');
  expand.onEnter(target);
  assert.equal(element.style.height, '42px');
  expand.onAfterEnter(target);
  assert.equal(element.style.height, '');
  element.scrollHeight = 81;
  expand.onBeforeLeave(target);
  assert.equal(element.style.height, '81px');
  expand.onLeave(target);
  assert.equal(element.style.height, '0');
  expand.onAfterLeave(target);
  assert.equal(element.style.height, '');
  assert.equal(element.style.width, '17px');
});

for (const expanded of [true, false])
  test(`tree transition retains forced-layout ordering when expanded=${expanded}`, () => {
    const events: unknown[] = [],
      state = { expanded };
    let height = 'old';
    const element = {
      scrollHeight: 63,
      style: {
        get height() {
          return height;
        },
        set height(value) {
          height = value;
          events.push(value);
        },
        display: '',
      },
      getBoundingClientRect() {
        events.push('layout');
        return {};
      },
    };
    const api = createTreeExpandTransition(state, function (name) {
      assert.equal(this, undefined);
      events.push(name);
    });
    api.onEnter(element as unknown as Element);
    assert.deepEqual(events, [expanded ? '0' : '63px', 'layout', expanded ? '63px' : '0']);
    state.expanded = !expanded;
    api.onAfterEnter(element as unknown as Element);
    assert.equal(height, state.expanded ? '' : '0');
    assert.equal(events.at(-1), 'end');
    api.onBeforeLeave(element as unknown as Element);
    assert.equal(element.style.display, 'none');
  });

test('tree expanded is read again after forced layout', () => {
  const state = { expanded: true };
  const element = {
    scrollHeight: 32,
    style: { height: '' },
    getBoundingClientRect() {
      state.expanded = false;
      return {};
    },
  };
  createTreeExpandTransition(state, () => {}).onEnter(element as unknown as Element);
  assert.equal(element.style.height, '0');
});

test('tree end is published after final height and errors propagate', () => {
  const element = { style: { height: 'old' } },
    error = Error('end');
  const api = createTreeExpandTransition({ expanded: true }, () => {
    assert.equal(element.style.height, '');
    throw error;
  });
  assert.throws(
    () => api.onAfterEnter(element as unknown as Element),
    (value) => value === error,
  );
});

test('select focus controller stays inert without a native input or while opening', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    get() {
      throw Error('document read');
    },
  });
  try {
    const empty = createSelectViewFocus({ input: undefined });
    empty.focus();
    empty.blur();
    empty.syncOpened(false);
    createSelectViewFocus({ input: {} as HTMLInputElement }).syncOpened(true);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});

test('select closing blurs only the matching active native input and reads live ref', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document'),
    active = {},
    events: string[] = [];
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { activeElement: active },
  });
  try {
    const first = {
      focus() {
        assert.equal(this, first);
        events.push('first-focus');
      },
      blur() {
        assert.equal(this, first);
        events.push('first-blur');
      },
      isSameNode(node: unknown) {
        assert.equal(this, first);
        return node === active;
      },
    };
    const second = {
      ...first,
      isSameNode() {
        return false;
      },
    };
    const state = { input: first as unknown as HTMLInputElement },
      api = createSelectViewFocus(state);
    api.focus();
    api.syncOpened(false);
    state.input = second as unknown as HTMLInputElement;
    api.syncOpened(false);
    assert.deepEqual(events, ['first-focus', 'first-blur']);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});

test('select closing re-reads input after native identity check', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document'),
    events: string[] = [];
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { activeElement: null },
  });
  try {
    const second = {
      blur() {
        events.push('latest');
      },
    } as HTMLInputElement;
    const state = {
      input: {
        isSameNode() {
          state.input = second;
          return true;
        },
      } as HTMLInputElement,
    };
    createSelectViewFocus(state).syncOpened(false);
    assert.deepEqual(events, ['latest']);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});

test('time defaults preserve selected/default identity and priority without eager reads', () => {
  const selected = dayjs('2024-01-02'),
    fallback = dayjs('2024-03-04');
  const state = {
    selectedValue: selected,
    get defaultValue() {
      throw Error('default read');
    },
    value: fallback,
  };
  const api = createTimePickerValueFoundation(state);
  assert.equal(api.getDefaultValue(), selected);
  api.resetTimePickerValue();
  assert.equal(state.value, selected);
});

test('time setter ignores undefined and reset re-evaluates current inputs', () => {
  const initial = dayjs('2024-01-02'),
    next = dayjs('2024-03-04');
  const state = {
    selectedValue: undefined as typeof initial | undefined,
    defaultValue: initial as typeof initial | undefined,
    value: initial,
  };
  const api = createTimePickerValueFoundation(state);
  api.setTimePickerValue(undefined);
  assert.equal(state.value, initial);
  api.setTimePickerValue(next);
  assert.equal(state.value, next);
  api.resetTimePickerValue();
  assert.equal(state.value, initial);
  state.defaultValue = next;
  api.resetTimePickerValue();
  assert.equal(state.value, next);
  state.defaultValue = undefined;
  const before = Date.now();
  api.resetTimePickerValue();
  assert.ok(state.value.valueOf() >= before);
  assert.ok(state.value.valueOf() <= Date.now());
});

test('side time props preserve original object for scalar defaults and copy sparse arrays', () => {
  const props = { defaultValue: '01:02', format: 'HH:mm' };
  assert.equal(getSideTimePickerProps({ props, defaultValue: props.defaultValue }, 0), props);
  const defaults = ['03:04'];
  const second = getSideTimePickerProps({ props, defaultValue: defaults }, 1);
  assert.deepEqual(second, { defaultValue: undefined, format: 'HH:mm' });
  assert.notEqual(second, props);
  assert.equal(props.defaultValue, '01:02');
});

test('side time props retain default/props/default evaluation order', () => {
  const events: string[] = [],
    defaults = ['01:02'];
  getSideTimePickerProps(
    {
      get defaultValue() {
        events.push('default');
        return defaults;
      },
      get props() {
        events.push('props');
        return { defaultValue: defaults };
      },
    },
    0,
  );
  assert.deepEqual(events, ['default', 'props', 'default']);
});

test('range updates and reset preserve side order, sparse values and callback receiver', () => {
  const events: unknown[] = [],
    value = dayjs('2024-01-02');
  const api = createRangeTimePickerValueFoundation({
    setStartTimeValue: function (value) {
      assert.equal(this, undefined);
      events.push(['start', value]);
    },
    setEndTimeValue: (value) => events.push(['end', value]),
    resetStartTimeValue: () => events.push('reset-start'),
    resetEndTimeValue: () => events.push('reset-end'),
  });
  api.setTimeValue(undefined);
  assert.deepEqual(events, []);
  api.setTimeValue([undefined, value]);
  api.resetTimeValue();
  assert.deepEqual(events, [['start', undefined], ['end', value], 'reset-start', 'reset-end']);
});

test('range callback error does not apply the other side', () => {
  const error = Error('start');
  const api = createRangeTimePickerValueFoundation({
    setStartTimeValue() {
      throw error;
    },
    setEndTimeValue() {
      assert.fail('end applied');
    },
    resetStartTimeValue() {
      throw error;
    },
    resetEndTimeValue() {
      assert.fail('end reset');
    },
  });
  assert.throws(
    () => api.setTimeValue([]),
    (value) => value === error,
  );
  assert.throws(
    () => api.resetTimeValue(),
    (value) => value === error,
  );
});
