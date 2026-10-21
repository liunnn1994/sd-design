import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { StepsState } from '../src/steps/foundation.ts';
import type { StepData, StepStatus, StepsType } from '../src/steps/types.ts';
import type { VerificationCell } from '../src/verification-code/foundation.ts';

import { createItemIndex, getItemParent } from '../dist/_utils/item-index.js';
import { createSteps, createStep } from '../dist/steps/foundation.js';
import {
  getTimelineItemState,
  getTimelinePosition,
  getTimelineDotStyle,
  getTimelineLineStyle,
  hasTimelinePending,
} from '../dist/timeline/foundation.js';
import {
  createVerificationCode,
  getVerificationCells,
} from '../dist/verification-code/foundation.js';

function code() {
  const events: unknown[][] = [];
  const deferred: Array<() => void> = [];
  const cells: VerificationCell[] = Array.from({ length: 4 }, (_, index) => ({
    inputRef: { value: '' } as HTMLInputElement,
    focus() {
      events.push(['focus', index]);
    },
    blur() {
      events.push(['blur', index]);
    },
  }));
  const adapter = {
    props: {
      modelValue: undefined as string | undefined,
      length: 4,
      readonly: false as boolean | string,
      disabled: false,
      formatter: undefined as
        | ((input: string, index: number, value: string) => string | boolean)
        | undefined,
    },
    defaultValue: '',
    inner: ['', '', '', ''],
    cells,
    activeElement: null as Element | null,
    get filled() {
      return getVerificationCells(this.props.modelValue ?? this.defaultValue, this.props.length);
    },
    afterRender(callback: () => void) {
      deferred.push(callback);
    },
    onUpdate(value: string) {
      events.push(['update', value]);
    },
    onChange(value: string) {
      events.push(['change', value]);
    },
    onFinish(value: string) {
      events.push(['finish', value]);
    },
    onInput(value: string, index: number) {
      events.push(['input', value, index]);
    },
  };
  return {
    adapter,
    events,
    f: createVerificationCode(adapter),
    flush() {
      deferred.splice(0).forEach((cb) => cb());
    },
  };
}
const event = {} as Event;
const keyboard = (key: string) => ({ key, preventDefault() {} }) as KeyboardEvent;

test('verification cells preserve fixed length and legacy UTF-16 splitting', () => {
  assert.deepEqual(getVerificationCells('12', 4), ['1', '2', '', '']);
  assert.deepEqual(getVerificationCells('abcdef', 2), ['a', 'b']);
  assert.deepEqual(getVerificationCells('😀', 2), ['\ud83d', '\ude00']);
  assert.deepEqual(getVerificationCells('', 0), []);
});

test('verification formatter sees the previous cells and input precedes update/change/finish/focus', () => {
  const { f, adapter, events } = code();
  adapter.inner = ['1', '2', '3', ''];
  adapter.props.formatter = (value, index, current) => {
    events.push(['formatter', value, index, current]);
    return value.toUpperCase();
  };
  f.input(3, ' ab ', event);
  assert.deepEqual(events, [
    ['input', 'b', 3],
    ['formatter', 'b', 3, '123'],
    ['update', '123B'],
    ['change', '123B'],
    ['finish', '123B'],
    ['focus', 3],
  ]);
});

test('verification rejected input emits only input without mutating cells', () => {
  const { f, adapter, events } = code();
  adapter.props.formatter = () => false;
  f.input(0, 'x', event);
  assert.deepEqual(adapter.inner, ['', '', '', '']);
  assert.deepEqual(events, [['input', 'x', 0]]);
});

test('verification controlled rejection clones and restores both cells and exposed native DOM', () => {
  const { f, adapter, flush } = code();
  adapter.props.modelValue = '12';
  adapter.inner = adapter.filled.slice();
  const filled = adapter.filled;
  adapter.cells[0].inputRef!.value = '9';
  f.input(0, '9', event);
  assert.deepEqual(filled, ['1', '2', '', '']);
  flush();
  assert.deepEqual(adapter.inner, ['1', '2', '', '']);
  assert.equal(adapter.cells[0].inputRef!.value, '1');
});

test('verification parent acceptance bypasses rollback while uncontrolled length changes preserve edits', () => {
  const { f, adapter, flush } = code();
  adapter.props.modelValue = '12';
  adapter.inner = adapter.filled.slice();
  f.input(0, '9', event);
  adapter.props.modelValue = '92';
  flush();
  assert.equal(adapter.inner[0], '9');
  adapter.props.modelValue = undefined;
  adapter.inner = ['A', 'B', '', ''];
  adapter.props.length = 6;
  f.syncValue('', '');
  assert.deepEqual(adapter.inner, ['A', 'B', '', '', '', '']);
  adapter.props.length = 1;
  f.syncValue('', '');
  assert.deepEqual(adapter.inner, ['A']);
  adapter.defaultValue = 'Z';
  f.syncValue('Z', '');
  assert.deepEqual(adapter.inner, ['Z']);
});

test('verification paste rejection shifts destination and formats against current accepted characters', () => {
  const { f, adapter, events } = code();
  let prevented = 0;
  adapter.props.formatter = (value, index, current) => {
    events.push(['format', value, index, current]);
    return /\d/.test(value) ? value : false;
  };
  f.paste(
    {
      preventDefault() {
        prevented++;
      },
      clipboardData: { getData: () => 'a1b2345' },
    } as unknown as ClipboardEvent,
    0,
  );
  assert.deepEqual(adapter.inner, ['1', '2', '3', '4']);
  assert.equal(prevented, 1);
  assert.deepEqual(events.filter(([kind]) => kind === 'format').slice(0, 4), [
    ['format', 'a', 0, ''],
    ['format', '1', 0, ''],
    ['format', 'b', 1, '1'],
    ['format', '2', 1, '1'],
  ]);
  assert.ok(events.some(([kind, value]) => kind === 'finish' && value === '1234'));
});

test('verification readonly blocks paste/backspace but preserves arrow navigation and active-cell blur', () => {
  const { f, adapter, events } = code();
  adapter.inner[0] = 'A';
  adapter.props.readonly = true;
  f.paste(
    {
      preventDefault() {
        throw Error('Must not prevent readonly paste');
      },
    } as ClipboardEvent,
    0,
  );
  f.keydown(1, keyboard('Backspace'));
  assert.equal(adapter.inner[0], 'A');
  f.keydown(0, keyboard('ArrowRight'));
  assert.deepEqual(events.splice(0), [['focus', 1]]);
  adapter.activeElement = adapter.cells[1].inputRef!;
  f.blur();
  assert.deepEqual(events, [['blur', 1]]);
});

test('verification empty focus is safe and cursor selection stays at the end of a filled cell', () => {
  const { f, adapter, events } = code();
  adapter.inner = [];
  f.focus();
  assert.deepEqual(events, []);
  adapter.inner = ['AB'];
  let prevented = false;
  const positions: number[][] = [];
  const input = {
    value: 'AB',
    focus() {},
    setSelectionRange(start: number, end: number) {
      positions.push([start, end]);
    },
  };
  f.cursorToEnd(
    {
      target: input,
      preventDefault() {
        prevented = true;
      },
    } as unknown as MouseEvent,
    0,
  );
  assert.equal(prevented, true);
  assert.deepEqual(positions, [[2, 2]]);
});

function steps() {
  const events: unknown[][] = [];
  const adapter = {
    props: {
      type: 'default' as StepsType,
      direction: 'vertical' as 'vertical' | 'horizontal',
      labelPlacement: 'vertical' as 'vertical' | 'horizontal',
      status: 'error' as StepStatus,
      changeable: true,
    },
    current: 2,
    inner: 1,
    registry: new Map<number, StepData>(),
    setInner(step: number) {
      this.inner = step;
      events.push(['inner', step]);
    },
    onUpdate(step: number) {
      events.push(['update', step]);
    },
    onChange(step: number) {
      events.push(['change', step]);
    },
  };
  return { adapter, f: createSteps(adapter), events };
}

test('Steps direction/label/status preserve navigation, arrow and dot mode rules', () => {
  const { adapter, f } = steps();
  assert.equal(f.direction(), 'vertical');
  assert.equal(f.status(1), 'finish');
  assert.equal(f.status(2), 'error');
  assert.equal(f.status(3), 'wait');
  adapter.props.type = 'navigation';
  assert.equal(f.direction(), 'horizontal');
  assert.equal(f.labelPlacement(), 'horizontal');
  adapter.props.type = 'dot';
  assert.equal(f.labelPlacement(), 'horizontal');
  adapter.props.direction = 'horizontal';
  assert.equal(f.labelPlacement(), 'vertical');
  adapter.props.type = 'arrow';
  adapter.props.direction = 'vertical';
  assert.equal(f.direction(), 'horizontal');
});

test('Steps controlled requests retain display and repeat same-step notifications with the original order', () => {
  const { adapter, f, events } = steps();
  f.click(3, event);
  f.click(3, event);
  assert.equal(adapter.current, 2);
  assert.equal(adapter.inner, 3);
  assert.deepEqual(events, [
    ['inner', 3],
    ['update', 3],
    ['change', 3],
    ['inner', 3],
    ['update', 3],
    ['change', 3],
  ]);
  adapter.props.changeable = false;
  f.click(1, event);
  assert.equal(events.length, 6);
});

test('Steps registry errors follow live step data and unregister by identity', () => {
  const { f } = steps();
  const first: StepData = { step: 1, status: 'error' };
  f.add(40, first);
  f.add(41, { step: 2, status: 'process' });
  assert.deepEqual(f.errors(), [1]);
  first.step = 3;
  assert.deepEqual(f.errors(), [3]);
  f.remove(40);
  assert.deepEqual(f.errors(), []);
});

test('Step explicit status, next-error/tail and click versus keyboard guards remain distinct', () => {
  const calls: number[] = [];
  const context: StepsState = {
    current: 2,
    direction: 'vertical',
    labelPlacement: 'horizontal',
    lineLess: false,
    type: 'default',
    errorSteps: [3],
    changeable: false,
    getStatus: () => 'finish',
    onClick: (step) => calls.push(step),
  };
  const adapter = {
    props: { status: undefined as StepStatus | undefined, disabled: false },
    context,
    step: 2,
  };
  const f = createStep(adapter);
  assert.equal(f.status(), 'finish');
  assert.equal(f.nextError(), true);
  assert.equal(f.showTail(), true);
  adapter.props.status = 'wait';
  assert.equal(f.status(), 'wait');
  f.click(event);
  f.keydown(keyboard('Enter'));
  assert.deepEqual(calls, [2]);
  context.changeable = true;
  f.keydown(keyboard(' '));
  assert.deepEqual(calls, [2, 2]);
  adapter.props.disabled = true;
  f.click(event);
  f.keydown(keyboard('Enter'));
  assert.equal(calls.length, 2);
});

test('Timeline pending presence and alternating axis positions preserve their fallbacks', () => {
  assert.equal(
    hasTimelinePending(false, () => {}),
    true,
  );
  assert.equal(hasTimelinePending('', undefined), false);
  assert.equal(getTimelinePosition(1, 'alternate', 'vertical'), 'right');
  assert.equal(getTimelinePosition(1, 'alternate', 'horizontal'), 'bottom');
  assert.equal(getTimelinePosition(1, 'alternate', 'horizontal', 'left'), 'top');
  assert.equal(getTimelinePosition(-1, 'alternate', 'vertical'), 'left');
});

test('Timeline last marker follows pending, reversal, identity reorder and empty context semantics', () => {
  const context = {
    items: [10, 20],
    direction: 'vertical' as const,
    mode: 'alternate' as const,
    reverse: false,
    hasPending: true,
  };
  assert.equal(getTimelineItemState(false, 20, context).last, false);
  assert.equal(getTimelineItemState(true, 0, context).last, true);
  context.reverse = true;
  assert.equal(getTimelineItemState(false, 10, context).last, true);
  context.items = [20, 10];
  assert.equal(getTimelineItemState(false, 20, context).position, 'left');
  assert.equal(getTimelineItemState(false, 0, {}).last, false);
});

test('Timeline line and dot styles retain axis, color omission and fill/border selection', () => {
  assert.deepEqual(getTimelineLineStyle('horizontal', 'dashed', 'red'), {
    borderTopStyle: 'dashed',
    borderColor: 'red',
  });
  assert.deepEqual(getTimelineLineStyle(undefined, 'solid', ''), { borderLeftStyle: 'solid' });
  assert.deepEqual(getTimelineDotStyle('hollow', 'blue'), { borderColor: 'blue' });
  assert.deepEqual(getTimelineDotStyle('solid', undefined), { backgroundColor: undefined });
});

test('DOM item index scopes nested owners, honors explicit index and disconnects its observer', (t) => {
  let callback: (() => void) | undefined;
  let disconnected = false;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'MutationObserver');
  class Observer {
    constructor(cb: () => void) {
      callback = cb;
    }
    observe(_target: unknown, options: unknown) {
      assert.deepEqual(options, { childList: true, subtree: true });
    }
    disconnect() {
      disconnected = true;
    }
  }
  Object.defineProperty(globalThis, 'MutationObserver', { configurable: true, value: Observer });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'MutationObserver', descriptor);
    else Reflect.deleteProperty(globalThis, 'MutationObserver');
  });
  const owner = {
    classList: { contains: (name: string) => name === 'owner' },
    parentElement: null,
    querySelectorAll: () => [first, nested, item],
  };
  const first = { closest: () => owner },
    nested = { closest: () => ({}) };
  const item = { parentElement: owner, closest: () => owner };
  const adapter = {
    item: item as unknown as HTMLElement,
    selector: '.item',
    explicit: undefined as number | undefined,
    parentClassName: 'owner',
    value: -1,
    parent: undefined as HTMLElement | undefined,
    setValue(value: number) {
      this.value = value;
    },
  };
  assert.equal(getItemParent(adapter.item, 'owner'), owner);
  const f = createItemIndex(adapter);
  f.mount();
  assert.equal(adapter.value, 1);
  const cleanup = f.observe(adapter.parent)!;
  adapter.explicit = 0;
  adapter.value = 4;
  callback!();
  assert.equal(adapter.value, 4);
  cleanup();
  assert.equal(disconnected, true);
});
