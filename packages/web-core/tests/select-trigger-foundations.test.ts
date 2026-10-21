import assert from 'node:assert/strict';
import test from 'node:test';

import { createInputLabelFoundation } from '../dist/input-label/foundation.js';
import { createInputSearchFoundation } from '../dist/input-search/foundation.js';
import { createModelSelectorTriggerFoundation } from '../dist/model-selector/trigger.js';
import { createSelectDropdownFoundation } from '../dist/select/dropdown.js';

function scrollEvent(scrollTop: number, scrollHeight = 100, offsetHeight = 40) {
  return { target: { scrollTop, scrollHeight, offsetHeight } } as unknown as Event;
}

for (const [top, offset, bottom] of [
  [59, 0, false],
  [60, 0, true],
  [61, 0, true],
  [59.5, 0.5, true],
  [59.5, 0, false],
  [0, 60, true],
  [60, -1, false],
  [61, -1, true],
  [NaN, 0, false],
  [60, NaN, false],
] as const) {
  test(`SelectDropdown precise threshold top=${top} offset=${offset}`, () => {
    const trace: unknown[] = [],
      event = scrollEvent(top);
    createSelectDropdownFoundation(
      { bottomOffset: offset },
      (e) => trace.push(['scroll', e]),
      (e) => trace.push(['bottom', e]),
    ).handleScroll(event);
    assert.deepEqual(
      trace,
      bottom
        ? [
            ['bottom', event],
            ['scroll', event],
          ]
        : [['scroll', event]],
    );
  });
}
test('SelectDropdown has no directional history and reads the live threshold', () => {
  const trace: string[] = [],
    state = { bottomOffset: 0 };
  const api = createSelectDropdownFoundation(
    state,
    () => trace.push('scroll'),
    () => trace.push('bottom'),
  );
  api.handleScroll(scrollEvent(60));
  api.handleScroll(scrollEvent(60));
  api.handleScroll(scrollEvent(70));
  api.handleScroll(scrollEvent(60));
  state.bottomOffset = -1;
  api.handleScroll(scrollEvent(60));
  assert.deepEqual(trace, [
    'bottom',
    'scroll',
    'bottom',
    'scroll',
    'bottom',
    'scroll',
    'bottom',
    'scroll',
    'scroll',
  ]);
});
test('SelectDropdown snapshots native geometry before threshold and emits, with exceptions stopping order', () => {
  const trace: string[] = [];
  const event = {
    get target() {
      trace.push('target');
      return {
        get scrollTop() {
          trace.push('top');
          return 60;
        },
        get scrollHeight() {
          trace.push('height');
          return 100;
        },
        get offsetHeight() {
          trace.push('offset');
          return 40;
        },
      };
    },
  } as unknown as Event;
  const api = createSelectDropdownFoundation(
    {
      get bottomOffset() {
        trace.push('threshold');
        return 0;
      },
    },
    () => trace.push('scroll'),
    () => {
      trace.push('bottom');
      throw Error('stop');
    },
  );
  assert.deepEqual(trace, []);
  assert.throws(() => api.handleScroll(event), /stop/);
  assert.deepEqual(trace, ['target', 'top', 'height', 'offset', 'threshold', 'bottom']);
});
for (const visible of [false, true]) {
  test(`ModelSelectorTrigger toggles live ${visible} and keeps context receiver`, () => {
    const state = { disabled: false },
      trace: boolean[] = [];
    const context = {
      visible: { value: visible },
      setVisible(value: boolean) {
        assert.equal(this, context);
        trace.push(value);
      },
    };
    const api = createModelSelectorTriggerFoundation(state, context),
      event = new Event('click') as MouseEvent;
    api.handleClick(event);
    context.visible.value = !visible;
    api.handleClick(event);
    assert.deepEqual(trace, [!visible, visible]);
    state.disabled = true;
    const cancel = new Event('click', { cancelable: true });
    api.handleClick(cancel as MouseEvent);
    assert.equal(cancel.defaultPrevented, true);
    assert.equal(trace.length, 2);
  });
}
test('ModelSelectorTrigger disabled short circuit preserves original event receiver and skips context', () => {
  const trace: string[] = [],
    event = {
      preventDefault() {
        assert.equal(this, event);
        trace.push('cancel');
      },
    } as MouseEvent;
  const api = createModelSelectorTriggerFoundation(
    {
      get disabled() {
        trace.push('disabled');
        return true;
      },
    },
    {
      get visible(): { value: boolean } {
        throw Error('must skip');
      },
      setVisible() {
        throw Error('must skip');
      },
    },
  );
  assert.deepEqual(trace, []);
  api.handleClick(event);
  assert.deepEqual(trace, ['disabled', 'cancel']);
});
test('ModelSelectorTrigger keeps setter lookup before visible reads and propagates errors', () => {
  const trace: string[] = [];
  const context = {
    get setVisible() {
      trace.push('setter');
      return function (this: unknown, value: boolean) {
        assert.equal(this, context);
        trace.push(String(value));
        throw Error('stop');
      };
    },
    get visible() {
      trace.push('visible');
      return {
        get value() {
          trace.push('value');
          return false;
        },
      };
    },
  };
  const api = createModelSelectorTriggerFoundation(
    {
      get disabled() {
        trace.push('disabled');
        return false;
      },
    },
    context,
  );
  assert.throws(() => api.handleClick(new Event('click') as MouseEvent), /stop/);
  assert.deepEqual(trace, ['disabled', 'setter', 'visible', 'value', 'true']);
});
for (const input of [
  undefined,
  { disabled: true, value: 'blocked' },
  { disabled: false, value: '' },
  { disabled: false, value: 'typed' },
]) {
  test(`InputSearch native guard ${input?.disabled}:${input?.value}`, () => {
    const events: unknown[] = [],
      event = new Event('click') as MouseEvent;
    createInputSearchFoundation({ input }, (value, e) => events.push([value, e])).handleClick(
      event,
    );
    assert.deepEqual(events, input && !input.disabled ? [[input.value, event]] : []);
  });
}
test('InputSearch reads actual input once per click, skips disabled value and permits replacement', () => {
  let reads = 0,
    input: { disabled: boolean; value: string } | undefined = {
      disabled: true,
      get value(): string {
        throw Error('skip');
      },
    };
  const trace: string[] = [],
    api = createInputSearchFoundation(
      {
        get input() {
          reads++;
          return input;
        },
      },
      (value) => trace.push(value),
    );
  assert.equal(reads, 0);
  api.handleClick(new Event('click') as MouseEvent);
  input = { disabled: false, value: 'new' };
  api.handleClick(new Event('click') as MouseEvent);
  assert.equal(reads, 2);
  assert.deepEqual(trace, ['new']);
});
for (const enabled of [false, true, undefined])
  for (const focused of [false, true]) {
    test(`InputLabel selected display enabled=${enabled} focused=${focused}`, () => {
      const props = {
          modelValue: { label: 'Selected' },
          enabledInput: enabled,
          placeholder: 'Placeholder',
        },
        state = { focused, inputValue: '' };
      const api = createInputLabelFoundation(props, state);
      assert.equal(api.getShowInput(), (enabled && focused) || false);
      assert.equal(api.getPlaceholder(), enabled ? 'Selected' : 'Placeholder');
      assert.equal(api.getFitWidthText(), 'Selected');
      state.inputValue = 'Draft';
      assert.equal(api.getFitWidthText(), 'Draft');
    });
  }
test('InputLabel empty model bypasses callbacks and input hides only with a value', () => {
  const api = createInputLabelFoundation(
    {
      enabledInput: false,
      placeholder: '',
      formatLabel() {
        throw Error('skip');
      },
    },
    { focused: false, inputValue: '' },
  );
  assert.equal(api.getShowInput(), true);
  assert.equal(api.formatLabel(), '');
  assert.equal(api.getPlaceholder(), '');
  assert.equal(api.getFitWidthText(), '');
});
test('InputLabel callback keeps props receiver, live model rereads and nullish versus truthy fallbacks', () => {
  let calls = 0;
  const props = {
    enabledInput: true,
    placeholder: 'Placeholder',
    modelValue: { label: 'Old', id: 1 },
    formatLabel(data?: { label: string; id: number }) {
      assert.equal(this, props);
      assert.equal(data, props.modelValue);
      calls++;
      props.modelValue = { label: 'New', id: 2 };
      return undefined as unknown as string;
    },
  };
  const state = { focused: false, inputValue: '' },
    api = createInputLabelFoundation(props, state);
  assert.equal(calls, 0);
  assert.equal(api.formatLabel(), 'New');
  props.formatLabel = function () {
    return '';
  };
  assert.equal(api.getPlaceholder(), '');
  assert.equal(api.getFitWidthText(), 'Placeholder');
  state.inputValue = 'Draft';
  props.formatLabel = function (): string {
    throw Error('skip');
  };
  assert.equal(api.getFitWidthText(), 'Draft');
  assert.throws(api.getPlaceholder, /skip/);
});
