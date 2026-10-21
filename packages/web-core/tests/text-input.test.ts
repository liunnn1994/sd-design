import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TextInputOptions } from '../src/text-input/foundation.ts';

import { createTextInputFoundation } from '../dist/text-input/foundation.js';

function setup(kind: 'input' | 'textarea', patch: Partial<TextInputOptions> = {}, initial = '') {
  const options: TextInputOptions = { maxLength: 0, ...patch };
  let inner = initial;
  let controlled: string | undefined;
  let composing = false;
  let compositionValue = '';
  const events: unknown[][] = [];
  const foundation = createTextInputFoundation(
    {
      options,
      get value() {
        return controlled ?? inner;
      },
      get valueLength() {
        return foundation.getLength(controlled ?? inner);
      },
      get maxLength() {
        return foundation.getMaxLength();
      },
      get errorOnly() {
        return foundation.getErrorOnly();
      },
      get sliceLength() {
        return foundation.getSliceLength();
      },
      get composing() {
        return composing;
      },
      setInner(value) {
        inner = value;
      },
      setComposing(value) {
        composing = value;
      },
      setCompositionValue(value) {
        compositionValue = value;
      },
      setFocused(value) {
        events.push(['focused', value]);
      },
      keepControl() {
        events.push(['repair']);
      },
      onUpdate(value) {
        events.push(['update', value]);
      },
      onInput(value, event) {
        events.push(['input', value, event]);
      },
      onChange(value, event) {
        events.push(['change', value, event]);
      },
      onClear(event) {
        events.push(['clear', event]);
      },
      onFocus(event) {
        events.push(['focus', event]);
      },
      onBlur(event) {
        events.push(['blur', event]);
      },
      onEnter(event) {
        events.push(['enter', event]);
      },
    },
    kind,
  );
  return {
    foundation,
    events,
    options,
    get inner() {
      return inner;
    },
    get compositionValue() {
      return compositionValue;
    },
    control(value: string | undefined) {
      controlled = value;
    },
  };
}

for (const kind of ['input', 'textarea'] as const) {
  test(`${kind}: grapheme truncation and custom slicing`, () => {
    const s = setup(kind, { maxLength: 2 });
    s.foundation.input('👨‍👩‍👧‍👦áz', 'insertFromPaste', new Event('input'));
    assert.equal(s.inner, '👨‍👩‍👧‍👦á');
    s.options.wordSlice = (value, max) => `${max}:${value}`;
    s.foundation.updateValue('abc');
    assert.equal(s.inner, '2:abc');
  });
  test(`${kind}: full value rejects inserted text but truncates paste`, () => {
    const s = setup(kind, { maxLength: 2 }, 'ab');
    s.foundation.input('axb', 'insertText', new Event('input'));
    assert.deepEqual(s.events, [['repair']]);
    s.foundation.input('xyz', 'insertFromPaste', new Event('input'));
    assert.equal(s.inner, 'xy');
  });
  test(`${kind}: composition suppresses input and retains selection policy`, () => {
    const s = setup(kind, { maxLength: 2 }, 'ab');
    const start = { type: 'compositionstart', data: '字' } as CompositionEvent;
    const end = { type: 'compositionend' } as CompositionEvent;
    s.foundation.composition('ab字', start);
    s.foundation.input('ab字', 'insertText', new Event('input'));
    assert.deepEqual(s.events, []);
    assert.equal(s.compositionValue, kind === 'input' ? 'ab字' : '');
    s.foundation.composition('ab字', end, 0, 2);
    assert.equal(s.inner, 'ab');
    assert.equal(
      s.events.some(([name]) => name === 'input'),
      kind === 'input',
    );
  });
  test(`${kind}: controlled rejection, change snapshot and clear order`, () => {
    const s = setup(kind);
    s.control('old');
    const event = new Event('input');
    s.foundation.input('new', 'insertText', event);
    assert.equal(s.inner, 'new');
    assert.equal(s.foundation.getFitWidthText('', false), 'old');
    s.foundation.focus({} as FocusEvent);
    s.events.length = 0;
    s.foundation.clear({} as MouseEvent);
    assert.deepEqual(
      s.events.map(([name]) => name),
      kind === 'input' ? ['update', 'change', 'clear'] : ['update', 'repair', 'change', 'clear'],
    );
    s.foundation.syncModel(undefined);
    assert.equal(s.inner, '');
  });
  test(`${kind}: blur event order and error-only zero bound`, () => {
    const s = setup(kind, { maxLength: { length: 0, errorOnly: true } });
    s.foundation.updateValue('x');
    assert.equal(s.foundation.getLengthError(), kind === 'input');
    s.events.length = 0;
    s.foundation.blur({} as FocusEvent);
    assert.deepEqual(
      s.events.map(([name]) => name),
      kind === 'input' ? ['focused', 'change', 'blur'] : ['focused', 'blur', 'change'],
    );
    s.events.length = 0;
    s.foundation.blur({} as FocusEvent);
    assert.equal(
      s.events.some(([name]) => name === 'change'),
      false,
    );
  });
}

test('Input and Textarea preserve distinct weighted-length slicing', () => {
  for (const kind of ['input', 'textarea'] as const) {
    const s = setup(kind, { maxLength: 4, wordLength: (value) => value.length * 2 });
    s.foundation.updateValue('abcde');
    assert.equal(s.inner, kind === 'input' ? 'ab' : 'abcd');
  }
});

test('Enter submits only Input outside composition; masking counts code points', () => {
  for (const kind of ['input', 'textarea'] as const) {
    const s = setup(kind);
    s.foundation.updateValue('😀á');
    s.events.length = 0;
    s.foundation.keydown({ key: 'Enter' } as KeyboardEvent);
    assert.deepEqual(
      s.events.map(([name]) => name),
      kind === 'input' ? ['change', 'enter'] : [],
    );
    assert.equal(s.foundation.getFitWidthText('', true), '•••');
    s.events.length = 0;
    s.foundation.composition('', { type: 'compositionstart' } as CompositionEvent);
    s.foundation.keydown({ key: 'Enter' } as KeyboardEvent);
    assert.deepEqual(s.events, []);
  }
});
