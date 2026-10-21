import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TagData } from '../src/input-tag/types.ts';
import type { SelectOptionInfo } from '../src/select/types.ts';

import { createAutoComplete, getAutoCompleteFilter } from '../dist/auto-complete/foundation.js';
import {
  createInputTag,
  getDisplayTags,
  getVisibleTagCount,
  getRetainedTagInput,
} from '../dist/input-tag/foundation.js';
import { getValueData } from '../dist/input-tag/utils.js';
import { createMention, getEmptyMeasureInfo, getMentionValue } from '../dist/mention/foundation.js';
import {
  getLastMeasureIndex,
  getTextBeforeSelection,
  isValidSearch,
} from '../dist/mention/utils.js';
import { createReadonlyTip, isReadonlyModificationKey } from '../dist/text-input/readonly.js';

const fields = { value: 'value', label: 'label', closable: 'closable', tagProps: 'tagProps' };
const key = (value: string) => ({ key: value, preventDefault() {} }) as KeyboardEvent;

function tags() {
  const pending: Array<() => void> = [];
  const events: unknown[][] = [];
  const state = {
    inner: [] as Array<string | number | TagData>,
    controlled: undefined as Array<string | number | TagData> | undefined,
    input: 'new',
    controlledInput: undefined as string | undefined,
  };
  const input = {
    value: 'new',
    focus() {
      events.push(['native-focus']);
    },
  } as HTMLInputElement;
  const adapter = {
    props: {
      readonly: false as boolean | string,
      uniqueValue: true,
      retainInputValue: false as boolean | { create?: boolean; blur?: boolean },
    },
    disabled: false,
    replacingInput: false,
    composition: false,
    compositionValue: '',
    focused: false,
    input,
    get value() {
      return state.controlled ?? state.inner;
    },
    get inputValue() {
      return state.controlledInput ?? state.input;
    },
    get data() {
      return getValueData(this.value, fields);
    },
    get renderedTagCount() {
      return this.data.length;
    },
    setInner(value: Array<string | number | TagData>) {
      state.inner = value;
      events.push(['inner', value]);
    },
    setInput(value: string) {
      state.input = value;
      events.push(['input-inner', value]);
    },
    afterRender(callback: () => void) {
      pending.push(callback);
    },
    onInputUpdate(value: string) {
      events.push(['input-update', value]);
    },
    onInputChange(value: string) {
      events.push(['input-change', value]);
    },
    onUpdate(value: Array<string | number | TagData>) {
      events.push(['update', value]);
    },
    onChange(value: Array<string | number | TagData>) {
      events.push(['change', value]);
    },
    onFormChange() {
      events.push(['form']);
    },
    onRemove(value: string | number) {
      events.push(['remove', value]);
    },
    onClear() {
      events.push(['clear']);
    },
    onPressEnter(value: string) {
      events.push(['enter', value]);
    },
    onFocus() {
      events.push(['focus']);
    },
    onBlur() {
      events.push(['blur']);
    },
    showReadonlyTip() {
      events.push(['readonly-tip']);
    },
  };
  return {
    f: createInputTag(adapter),
    adapter,
    state,
    input,
    events,
    flush() {
      pending.splice(0).forEach((cb) => cb());
    },
  };
}

test('tag normalization retains raw identity, scalar distinctions and configured field names', () => {
  const raw = { id: 0, text: 'Zero', close: false, props: { closable: true } };
  const data = getValueData([0, '0', raw], {
    value: 'id',
    label: 'text',
    closable: 'close',
    tagProps: 'props',
  });
  assert.equal(data[0].value, 0);
  assert.equal(data[1].value, '0');
  assert.equal(data[2].raw, raw);
  assert.equal(data[2].tagProps, raw.props);
  assert.equal(data[2].closable, false);
});

test('tag overflow counter remains separate from a real sentinel value and retain options preserve defaults', () => {
  const data = getValueData(['__sd__more', 'B', 'C'], fields);
  const display = getDisplayTags(data, getVisibleTagCount(1, data.length));
  assert.equal(display[0], data[0]);
  assert.equal(display[1].value, '__sd__more');
  assert.equal(display[1].closable, false);
  assert.equal(display[1].label, '+2');
  assert.equal(getVisibleTagCount('responsive', 3), 3);
  assert.deepEqual(getRetainedTagInput({ create: true }), { create: true, blur: false });
});

test('tag creation preserves model/form/Enter/input-clear event order', () => {
  const { f, events, state } = tags();
  f.keydown(key('Enter'));
  assert.deepEqual(events, [
    ['inner', ['new']],
    ['update', ['new']],
    ['change', ['new']],
    ['form'],
    ['enter', 'new'],
    ['input-inner', ''],
    ['input-update', ''],
    ['input-change', ''],
  ]);
  assert.equal(state.input, '');
});

test('duplicate tag Enter emits only Enter and retains the draft until uniqueness is disabled', () => {
  const { f, adapter, state, events } = tags();
  state.inner = ['new'];
  f.keydown(key('Enter'));
  assert.deepEqual(events.splice(0), [['enter', 'new']]);
  assert.equal(state.input, 'new');
  adapter.props.uniqueValue = false;
  adapter.props.retainInputValue = true;
  f.keydown(key('Enter'));
  assert.deepEqual(state.inner, ['new', 'new']);
  assert.equal(state.input, 'new');
});

test('tag removal uses occurrence index, tagProps precedence and last closable item', () => {
  const { f, state, events } = tags();
  state.input = '';
  state.inner = ['A', { value: 'locked', closable: true, tagProps: { closable: false } }, 'A'];
  f.keydown(key('Backspace'));
  assert.deepEqual(state.inner, [
    'A',
    { value: 'locked', closable: true, tagProps: { closable: false } },
  ]);
  f.keydown(key('Backspace'));
  assert.equal(state.inner.length, 1);
  f.keydown(key('Backspace'));
  assert.equal(events.filter(([name]) => name === 'remove').length, 2);
});

test('tag controlled rejection restores native input after IME and leaves displayed model unchanged', () => {
  const { f, adapter, state, input, flush, events } = tags();
  state.controlled = [];
  state.controlledInput = 'saved';
  input.value = '中文';
  f.composition({
    type: 'compositionstart',
    data: '中',
    target: input,
  } as unknown as CompositionEvent);
  assert.equal(adapter.compositionValue, 'saved中');
  f.input({ target: input } as unknown as Event);
  assert.equal(events.length, 0);
  f.composition({ type: 'compositionend', target: input } as unknown as CompositionEvent);
  assert.equal(adapter.composition, false);
  assert.equal(adapter.compositionValue, '');
  flush();
  assert.equal(input.value, 'saved');
  f.keydown(key('Enter'));
  assert.deepEqual(adapter.value, []);
  assert.deepEqual(state.inner, ['saved']);
});

test('tag input replacement retains a focused draft while ordinary blur clears it before blur notification', () => {
  const { f, adapter, state, events } = tags();
  adapter.replacingInput = true;
  f.blur({} as FocusEvent);
  assert.equal(state.input, 'new');
  assert.deepEqual(events.splice(0), [['blur']]);
  adapter.replacingInput = false;
  f.blur({} as FocusEvent);
  assert.deepEqual(events, [
    ['input-inner', ''],
    ['input-update', ''],
    ['input-change', ''],
    ['blur'],
  ]);
});

test('tag disabled/readonly and composition guards suppress modifications while clear retains its own route', () => {
  const { f, adapter, state, events } = tags();
  adapter.disabled = true;
  f.keydown(key('Enter'));
  assert.deepEqual(events, []);
  adapter.disabled = false;
  adapter.props.readonly = 'Read only';
  f.keydown(key('x'));
  assert.deepEqual(events.splice(0), [['readonly-tip']]);
  adapter.props.readonly = false;
  adapter.composition = true;
  f.keydown(key('Enter'));
  assert.equal(state.inner.length, 0);
  f.clear({} as MouseEvent);
  assert.deepEqual(
    events.map(([name]) => name),
    ['inner', 'update', 'change', 'form', 'clear'],
  );
});

function option(value: SelectOptionInfo['value'], label = String(value)): SelectOptionInfo {
  return { value, label, raw: { value, label }, key: String(value), origin: 'options' };
}

function auto() {
  const events: unknown[][] = [];
  const adapter = {
    readonly: false as boolean | string,
    disabled: false,
    options: new Map([['0', option(0)]]),
    inner: '',
    popup: false,
    setInner(value: string) {
      this.inner = value;
    },
    setPopup(value: boolean) {
      this.popup = value;
    },
    onUpdate(value: string) {
      events.push(['update', value]);
    },
    onChange(value: string) {
      events.push(['change', value]);
    },
    onFormChange() {
      events.push(['form']);
    },
    onSelect(value: string) {
      events.push(['select', value]);
    },
    onSearch(value: string) {
      events.push(['search', value]);
    },
    onClear() {
      events.push(['clear']);
    },
    blur() {
      events.push(['blur']);
    },
  };
  return { f: createAutoComplete(adapter), adapter, events };
}

test('autocomplete strict filter uses normalized labels and preserves a custom filter identity', () => {
  const filter = getAutoCompleteFilter(true, true);
  assert.equal(typeof filter, 'function');
  if (typeof filter !== 'function') throw Error('Expected filter');
  assert.equal(filter('0', { value: 0 }), true);
  assert.equal(filter('a', { label: 'ABC' }), false);
  assert.equal(getAutoCompleteFilter(filter, false), filter);
  assert.equal(getAutoCompleteFilter(false, true), false);
});

test('autocomplete search/select/clear preserve their distinct event ordering and string zero', () => {
  const { f, events, adapter } = auto();
  f.input('query');
  assert.deepEqual(events.splice(0), [
    ['search', 'query'],
    ['update', 'query'],
    ['change', 'query'],
    ['form'],
  ]);
  f.select('0', {} as Event);
  assert.equal(adapter.inner, '0');
  assert.deepEqual(events.splice(0), [
    ['select', '0'],
    ['update', '0'],
    ['change', '0'],
    ['form'],
    ['blur'],
  ]);
  f.clear({} as Event);
  assert.deepEqual(events, [['update', ''], ['change', ''], ['form'], ['clear']]);
});

test('autocomplete readonly/disabled closes popup and blocks selection without changing its explicit clear semantics', () => {
  const { f, adapter, events } = auto();
  f.popup(true);
  assert.equal(adapter.popup, true);
  adapter.readonly = true;
  f.syncDisabled();
  assert.equal(adapter.popup, false);
  f.popup(true);
  f.select('0', {} as Event);
  assert.deepEqual(events, []);
  f.popup(false);
  adapter.readonly = false;
  adapter.disabled = true;
  f.select('0', {} as Event);
  assert.deepEqual(events, []);
  f.syncValue(null);
  assert.equal(adapter.inner, '');
});

test('mention parsing keeps selection offsets, latest prefix priority and split behavior', () => {
  assert.equal(
    getTextBeforeSelection({ value: 'A ##word tail', selectionStart: 8 } as HTMLInputElement),
    'A ##word',
  );
  assert.deepEqual(getLastMeasureIndex('@first ##last', ['@', '##']), {
    location: 7,
    prefix: '##',
  });
  assert.equal(isValidSearch('has space', ' '), false);
  assert.equal(isValidSearch('has space', ''), true);
  assert.equal(
    getMentionValue(
      'A##boTAIL',
      { measuring: true, location: 1, prefix: '##', text: 'bo' },
      'Bob',
      ' ',
    ),
    'A ##Bob TAIL',
  );
  assert.equal(
    getMentionValue(
      '\n##bo\ntail',
      { measuring: true, location: 1, prefix: '##', text: 'bo' },
      0,
      ' ',
    ),
    '\n##0\ntail',
  );
});

function mention() {
  const events: unknown[][] = [];
  const adapter = {
    props: { prefix: ['@', '##'], split: ' ', readonly: false as boolean | string },
    value: '',
    measure: getEmptyMeasureInfo(),
    popup: false,
    inner: '',
    options: new Map([['Bob', option('Bob')]]),
    setInner(value: string) {
      this.inner = value;
    },
    setPopup(value: boolean) {
      this.popup = value;
    },
    onSearch(value: string, prefix: string) {
      events.push(['search', value, prefix]);
    },
    onUpdate(value: string) {
      events.push(['update', value]);
    },
    onChange(value: string) {
      events.push(['change', value]);
    },
    onFormChange() {
      events.push(['form']);
    },
    onSelect(value: unknown) {
      events.push(['select', value]);
    },
    onClear() {
      events.push(['clear']);
    },
  };
  return { adapter, events, f: createMention(adapter) };
}

test('mention measures before value notifications and resets invalid search without eagerly closing popup', () => {
  const { adapter, events, f } = mention();
  const input = (value: string) =>
    f.input(value, { target: { value, selectionStart: value.length } } as unknown as Event);
  input('##bo');
  assert.deepEqual(adapter.measure, { measuring: true, location: 0, prefix: '##', text: 'bo' });
  assert.deepEqual(events.splice(0), [
    ['search', 'bo', '##'],
    ['update', '##bo'],
    ['change', '##bo'],
    ['form'],
  ]);
  input('##bo invalid');
  assert.deepEqual(adapter.measure, getEmptyMeasureInfo());
  assert.equal(adapter.popup, true);
  adapter.props.readonly = true;
  events.length = 0;
  input('@no');
  assert.deepEqual(events, []);
});

test('mention selection preserves controlled text, multi-character prefix and event/reset order', () => {
  const { adapter, events, f } = mention();
  adapter.value = 'A##boTAIL';
  adapter.measure = { measuring: true, location: 1, prefix: '##', text: 'bo' };
  f.select('Bob', {} as Event);
  assert.equal(adapter.value, 'A##boTAIL');
  assert.equal(adapter.inner, 'A ##Bob TAIL');
  assert.deepEqual(events, [
    ['select', 'Bob'],
    ['update', 'A ##Bob TAIL'],
    ['change', 'A ##Bob TAIL'],
    ['form'],
  ]);
  assert.deepEqual(adapter.measure, getEmptyMeasureInfo());
});

test('mention clear resets measure and popup before notifying; null reset does not synthesize change', () => {
  const { adapter, events, f } = mention();
  adapter.popup = true;
  adapter.measure.measuring = true;
  f.clear({} as Event);
  assert.equal(adapter.popup, false);
  assert.deepEqual(adapter.measure, getEmptyMeasureInfo());
  assert.deepEqual(events.splice(0), [['update', ''], ['change', ''], ['form'], ['clear']]);
  adapter.inner = 'stale';
  f.syncValue(undefined);
  assert.equal(adapter.inner, '');
  assert.deepEqual(events, []);
});

test('readonly key intent preserves paste/cut and ignores copy, selection, modifiers and navigation', () => {
  const event = (key: string, extra = {}) => ({ key, ...extra }) as KeyboardEvent;
  assert.equal(isReadonlyModificationKey(event('V', { metaKey: true })), true);
  assert.equal(isReadonlyModificationKey(event('x', { ctrlKey: true })), true);
  assert.equal(isReadonlyModificationKey(event('c', { ctrlKey: true })), false);
  assert.equal(isReadonlyModificationKey(event('a', { altKey: true })), false);
  assert.equal(isReadonlyModificationKey(event('ArrowLeft')), false);
});

test('readonly tip resets its timer, reads current guards and releases pending hides', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const adapter = {
    readonly: true,
    disabled: false,
    visible: false,
    setVisible(value: boolean) {
      this.visible = value;
    },
  };
  const f = createReadonlyTip(adapter);
  f.show();
  assert.equal(adapter.visible, true);
  t.mock.timers.tick(1500);
  f.show();
  t.mock.timers.tick(1500);
  assert.equal(adapter.visible, true);
  t.mock.timers.tick(500);
  assert.equal(adapter.visible, false);
  adapter.disabled = true;
  f.show();
  assert.equal(adapter.visible, false);
  adapter.disabled = false;
  f.show();
  f.hide();
  t.mock.timers.tick(3000);
  assert.equal(adapter.visible, false);
});
