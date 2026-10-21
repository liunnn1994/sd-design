import assert from 'node:assert/strict';
import test from 'node:test';

import { createAlertFoundation } from '../dist/alert/foundation.js';
import { createButtonTextFoundation } from '../dist/button/text.js';
import { createPressableFoundation } from '../dist/interaction/pressable.js';
import { createSelectableCardFoundation, toCssSize } from '../dist/selectable-card/foundation.js';

for (const disabled of [undefined, false, true]) {
  for (const loading of [false, true]) {
    test(`pressable preserves short-circuit reads and original event: ${disabled}/${loading}`, () => {
      const trace: unknown[] = [];
      const state = {
        get disabled() {
          trace.push('disabled');
          return disabled;
        },
        get loading() {
          trace.push('loading');
          return loading;
        },
      };
      const event = {
        preventDefault() {
          assert.equal(this, event);
          trace.push('prevent');
        },
      };
      const api = createPressableFoundation(state, (value) => trace.push(value));
      assert.deepEqual(trace, []);
      api.handleClick(event);
      assert.deepEqual(
        trace,
        disabled ? ['disabled', 'prevent'] : ['disabled', 'loading', loading ? 'prevent' : event],
      );
    });
  }
}

test('pressable re-reads live flags and propagates prevent/callback errors', () => {
  const state = { disabled: true, loading: false };
  let emitted = 0;
  const api = createPressableFoundation(state, () => {
    emitted++;
    throw new Error('callback');
  });
  assert.throws(
    () =>
      api.handleClick({
        preventDefault() {
          throw new Error('prevent');
        },
      }),
    /prevent/,
  );
  assert.equal(emitted, 0);
  state.disabled = false;
  assert.throws(
    () =>
      api.handleClick({
        preventDefault() {
          assert.fail('unexpected prevent');
        },
      }),
    /callback/,
  );
  assert.equal(emitted, 1);
});

for (const [text, expected] of [
  ['确认', true],
  [' 确\n 认\t', true],
  ['A确', false],
  ['确认中', false],
  ['確定', true],
  ['𠀀𠀁', false],
  ['龥龥', true],
  ['', false],
  [null, false],
  [undefined, false],
] as const) {
  test(`button text keeps original CJK range and whitespace semantics: ${String(text)}`, () => {
    const state = { autoInsertSpace: true, isTwoCNChar: false };
    createButtonTextFoundation(state, () => text).updateIsTwoCNChar();
    assert.equal(state.isTwoCNChar, expected);
  });
}

test('button text skips DOM/text reads when off and only writes changed state', () => {
  let reads = 0;
  let writes = 0;
  let value = true;
  const state = {
    autoInsertSpace: false,
    get isTwoCNChar() {
      return value;
    },
    set isTwoCNChar(next: boolean) {
      value = next;
      writes++;
    },
  };
  const api = createButtonTextFoundation(state, () => {
    reads++;
    return '确认';
  });
  assert.equal(reads, 0);
  api.updateIsTwoCNChar();
  api.updateIsTwoCNChar();
  assert.equal(writes, 1);
  assert.equal(reads, 0);
  state.autoInsertSpace = true;
  api.updateIsTwoCNChar();
  api.updateIsTwoCNChar();
  assert.equal(writes, 2);
  assert.equal(reads, 2);
});

for (const key of ['Enter', ' ', 'Escape', 'Spacebar', 'Tab']) {
  test(`alert activation preserves prevent, hide, close and after-leave order: ${key}`, () => {
    const trace: unknown[] = [];
    let visible = true;
    const state = {
      get visible() {
        return visible;
      },
      set visible(value: boolean) {
        visible = value;
        trace.push('hide');
      },
    };
    const event = {
      key,
      preventDefault() {
        trace.push('prevent');
      },
    } as KeyboardEvent;
    const api = createAlertFoundation(
      state,
      (ev) => {
        assert.equal(visible, false);
        trace.push(ev);
      },
      () => trace.push('after'),
    );
    assert.deepEqual(trace, []);
    api.onCloseKeydown(event);
    assert.deepEqual(trace, key === 'Enter' || key === ' ' ? ['prevent', 'hide', event] : []);
    api.handleAfterLeave();
    assert.equal(trace.at(-1), 'after');
  });
}

test('alert repeated closes still emit, and callback failure leaves hidden state', () => {
  const state = { visible: true };
  const events: Event[] = [];
  const event = new Event('close');
  const api = createAlertFoundation(
    state,
    (ev) => events.push(ev),
    () => {},
  );
  api.handleClose(event);
  api.handleClose(event);
  assert.deepEqual(events, [event, event]);
  const failing = createAlertFoundation(
    state,
    () => {
      throw new Error('close');
    },
    () => {},
  );
  state.visible = true;
  assert.throws(() => failing.handleClose(event), /close/);
  assert.equal(state.visible, false);
});

test('alert does not hide or emit when preventing keyboard default throws', () => {
  const state = { visible: true };
  const api = createAlertFoundation(
    state,
    () => assert.fail('unexpected close'),
    () => {},
  );
  assert.throws(
    () =>
      api.onCloseKeydown({
        key: 'Enter',
        preventDefault() {
          throw new Error('prevent');
        },
      } as unknown as KeyboardEvent),
    /prevent/,
  );
  assert.equal(state.visible, true);
});

for (const value of [undefined, 0, -2, 1.5, 'auto', '20%', 'var(--size)'] as const) {
  test(`card CSS sizes preserve raw strings and four-unit padding: ${String(value)}`, () => {
    assert.equal(toCssSize(value), typeof value === 'number' ? `${value}px` : value);
    assert.equal(toCssSize(value, true), typeof value === 'number' ? `${value * 4}px` : value);
  });
}

test('card disabled guard skips target access; interactive guard preserves closest receiver and selector', () => {
  const state = { disabled: true, selected: false };
  const trace: unknown[] = [];
  const target = {
    closest(selector: string) {
      assert.equal(this, target);
      trace.push(selector);
      return true;
    },
  };
  const event = {
    get target() {
      trace.push('target');
      return target;
    },
  } as unknown as MouseEvent;
  const api = createSelectableCardFoundation(state, (value) => trace.push(value));
  assert.deepEqual(trace, []);
  api.handleCardClick(event);
  assert.deepEqual(trace, []);
  state.disabled = false;
  api.handleCardClick(event);
  assert.deepEqual(trace, ['target', 'a, button, input, label, select, textarea, [role="button"]']);
});

test('card re-reads disabled after closest and selected after an accepted change', () => {
  const state = { disabled: false, selected: false };
  const events: boolean[] = [];
  const api = createSelectableCardFoundation(state, (value) => {
    events.push(value);
    state.selected = value;
  });
  const event = {
    target: {
      closest() {
        state.disabled = true;
        return null;
      },
    },
  } as unknown as MouseEvent;
  api.handleCardClick(event);
  assert.deepEqual(events, []);
  state.disabled = false;
  const input = { checked: false };
  api.handleInputChange({ target: input } as unknown as Event);
  assert.deepEqual(events, [true]);
  assert.equal(input.checked, true);
});

test('card rejected and disabled input changes restore controlled state without double emitting', () => {
  const state = { disabled: false, selected: false };
  const events: boolean[] = [];
  const api = createSelectableCardFoundation(state, (value) => events.push(value));
  const input = { checked: true };
  api.handleInputChange({ target: input } as unknown as Event);
  assert.equal(input.checked, false);
  assert.deepEqual(events, [true]);
  state.disabled = true;
  input.checked = true;
  api.handleInputChange({ target: input } as unknown as Event);
  assert.equal(input.checked, false);
  assert.deepEqual(events, [true]);
});

test('card emits before reading target, restoring input, and propagates callback rejection', () => {
  const state = { disabled: false, selected: false };
  const trace: string[] = [];
  const api = createSelectableCardFoundation(state, () => {
    trace.push('change');
    throw new Error('change');
  });
  const event = {
    get target() {
      trace.push('target');
      return { checked: true };
    },
  } as unknown as Event;
  assert.throws(() => api.handleInputChange(event), /change/);
  assert.deepEqual(trace, ['change']);
});

test('card background clicks toggle without mutating controlled state', () => {
  const state = { disabled: false, selected: true };
  const events: boolean[] = [];
  const api = createSelectableCardFoundation(state, (value) => events.push(value));
  const event = { target: { closest: () => null } } as unknown as MouseEvent;
  api.handleCardClick(event);
  api.handleCardClick(event);
  assert.deepEqual(events, [false, false]);
  assert.equal(state.selected, true);
});
