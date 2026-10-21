import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { SenderSlotData } from '../dist/sender/types.js';

import {
  createSenderSpeechActivity,
  type SenderSpeechActivityState,
} from '../dist/sender/speech-activity.js';
import {
  createSenderSlotNode,
  createSenderSlotContent,
  resolveSenderSlotValue,
  formatSenderSlot,
  mergeSenderSlotConfig,
  indexSenderSlotConfig,
  toSenderJsonValue,
  shouldSenderSubmit,
} from '../dist/sender/values.js';

test('Sender JSON conversion preserves scalar/native fallback semantics and copies JSON objects', () => {
  assert.equal(toSenderJsonValue(undefined), null);
  assert.equal(toSenderJsonValue(null), null);
  assert.equal(toSenderJsonValue(0), 0);
  assert.equal(toSenderJsonValue(false), false);
  assert.ok(Number.isNaN(toSenderJsonValue(NaN)));
  const value = { list: [1, 'two'] };
  const copy = toSenderJsonValue(value);
  assert.deepEqual(copy, value);
  assert.notEqual(copy, value);
  const circular: { self?: unknown } = {};
  circular.self = circular;
  assert.equal(toSenderJsonValue(circular), '[object Object]');
  assert.equal(toSenderJsonValue(12n), '12');
});

test('Sender slot nodes retain zero, null, empty values and custom-prefix content classes', () => {
  assert.deepEqual(
    createSenderSlotNode({ type: 'input', key: 'input', props: { defaultValue: 0 } }, 'custom'),
    {
      key: 'input',
      name: 'input',
      value: 0,
      props: { placeholder: '' },
      textValue: '0',
    },
  );
  assert.equal(
    createSenderSlotNode(
      { type: 'custom', key: 'custom', props: { defaultValue: 'fallback' } },
      'custom',
      null,
    ).value,
    null,
  );
  assert.deepEqual(createSenderSlotNode({ type: 'content', key: 'content' }, 'custom').props, {
    placeholder: '',
    class: 'custom-slot-content',
  });
  assert.deepEqual(
    createSenderSlotNode(
      { type: 'select', key: 'choice', props: { options: ['A', 'B'], defaultValue: '' } },
      'sd',
    ).props,
    {
      placeholder: '',
      options: [
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
      ],
    },
  );
  assert.equal(
    createSenderSlotNode({ type: 'tag', key: 'tag', props: { label: 0 } }, 'sd').value,
    0,
  );
  assert.equal(
    createSenderSlotNode({ type: 'tag', key: 'tag', props: { label: 0, value: '' } }, 'sd').value,
    '',
  );
});

test('Sender slot config merging preserves identities and prop precedence with last-key indexing', () => {
  const first: SenderSlotData = { type: 'input', key: 'same' };
  const last: SenderSlotData = { type: 'select', key: 'same', props: { options: [] } };
  const text: SenderSlotData = { type: 'text', key: '', value: 'text' };
  const result = mergeSenderSlotConfig<SenderSlotData>(
    [first, last],
    [{ type: 'custom', key: 'same' }, text],
  );
  assert.deepEqual(result, [first, last, text]);
  assert.equal(result[0], first);
  assert.equal(indexSenderSlotConfig(result).get('same'), last);
  assert.equal(indexSenderSlotConfig(result).has(''), false);
  assert.equal(mergeSenderSlotConfig(undefined, [text])[0], text);
});

test('Sender editor content retains skill ordering, last previous values and undefined default fallback', () => {
  const content = createSenderSlotContent(
    [
      { type: 'text', value: 'Prefix' },
      { type: 'input', key: 'input', props: { defaultValue: 9 } },
      { type: 'custom', key: 'custom', props: { defaultValue: 2 } },
    ],
    { value: 'skill' },
    'sd',
    [
      { key: 'input', name: 'input', value: 1 },
      { key: 'input', name: 'input', value: 0 },
      { key: 'custom', name: 'senderCustom', value: null },
    ],
  );
  assert.deepEqual(content, [
    { key: '__sender_skill__', name: 'senderSkill', value: 'skill', textValue: '' },
    'Prefix',
    { key: 'input', name: 'input', value: 0, props: { placeholder: '' }, textValue: '0' },
    { key: 'custom', name: 'senderCustom', value: null, textValue: '' },
  ]);
  assert.deepEqual(createSenderSlotContent([], undefined, 'sd'), []);
});

test('Sender structured values ignore unknown/skill nodes and preserve opaque config fields', () => {
  const renderer = {},
    skill = { value: 'active', render: {} };
  const config = {
    type: 'custom' as const,
    key: 'custom',
    renderer,
    formatResult: (value: unknown) => `[${value}]`,
  };
  const result = resolveSenderSlotValue(
    [
      '',
      'Prefix',
      { key: 'missing', name: 'input', value: 'skip' },
      { key: '__sender_skill__', name: 'senderSkill', value: 'skip' },
      { key: 'custom', name: 'senderCustom', value: 0 },
    ],
    { configByKey: new Map([['custom', config]]), skill },
  );
  assert.equal(result.value, 'Prefix[0]');
  assert.equal(result.skill, skill);
  assert.deepEqual(result.slotConfig, [
    { type: 'text', value: 'Prefix' },
    { ...config, value: 0 },
  ]);
  assert.equal((result.slotConfig[1] as typeof config).renderer, renderer);
});

test('Sender format callbacks read subsequent config and final skill lazily', () => {
  let configs = new Map<string, SenderSlotData>(),
    skill = { value: 'before' };
  const first: SenderSlotData = {
    type: 'input',
    key: 'a',
    formatResult() {
      configs = new Map([['b', { type: 'input', key: 'b', formatResult: () => 'updated' }]]);
      skill = { value: 'after' };
      return 'first';
    },
  };
  configs.set('a', first);
  const result = resolveSenderSlotValue(
    [
      { key: 'a', name: 'input', value: 'A' },
      { key: 'b', name: 'input', value: 'B' },
    ],
    {
      get configByKey() {
        return configs;
      },
      get skill() {
        return skill;
      },
    },
  );
  assert.equal(result.value, 'firstupdated');
  assert.equal(result.skill.value, 'after');
});

test('Sender plain insertion formatting keeps text/tag exceptions and custom formatters', () => {
  const formatResult = () => {
    throw new Error('text and tag formatters must not run');
  };
  assert.equal(formatSenderSlot({ type: 'text', value: 'text', formatResult }), 'text');
  assert.equal(
    formatSenderSlot({ type: 'tag', key: 'tag', props: { label: 0 }, formatResult }),
    '0',
  );
  assert.equal(
    formatSenderSlot({
      type: 'custom',
      key: 'custom',
      props: { defaultValue: false },
      formatResult: (value) => String(value),
    }),
    'false',
  );
});

test('Sender submit keys preserve composing and modifier constraints', () => {
  const event = {
    key: 'Enter',
    isComposing: false,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
  };
  assert.equal(shouldSenderSubmit(event, 'enter'), true);
  assert.equal(shouldSenderSubmit(event, 'shiftEnter'), false);
  assert.equal(shouldSenderSubmit({ ...event, shiftKey: true }, 'shiftEnter'), true);
  for (const key of ['ctrlKey', 'altKey', 'metaKey', 'isComposing'] as const) {
    assert.equal(shouldSenderSubmit({ ...event, [key]: true }, 'enter'), false);
  }
  assert.equal(shouldSenderSubmit({ ...event, key: 'Escape' }, 'enter'), false);
});

test('Sender speech detection keeps strict threshold and lazy reads for explicit activity', () => {
  const state: SenderSpeechActivityState = {
    recording: false,
    level: 0.04,
    active: false,
    options: {},
  };
  const activity = createSenderSpeechActivity(state);
  assert.equal(activity.speaking(), false);
  state.recording = true;
  assert.equal(activity.speaking(), false);
  state.level = 0.041;
  assert.equal(activity.speaking(), true);
  state.options = { threshold: 0.1 };
  assert.equal(activity.speaking(), false);
  state.options = { active: false, processing: true };
  state.active = true;
  assert.equal(activity.glowActive(), false);
  state.options = { level: 0 };
  assert.equal(activity.glowActive(), true);
  state.options = { stream: {} };
  assert.equal(activity.glowActive(), true);
  const lazy = createSenderSpeechActivity({
    recording: false,
    get level(): never {
      throw Error('eager level');
    },
    get active(): never {
      throw Error('eager activity');
    },
    options: { active: true },
  });
  assert.equal(lazy.speaking(), false);
  assert.equal(lazy.glowActive(), true);
});

test('Sender speech activity delays silence for 350ms and cancels timers on resumed speech, stop and disposal', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const state: SenderSpeechActivityState = {
    recording: true,
    level: 1,
    active: false,
    options: {},
  };
  const activity = createSenderSpeechActivity(state);
  activity.update(true, true);
  assert.equal(state.active, true);
  activity.update(false, true);
  t.mock.timers.tick(349);
  assert.equal(state.active, true);
  activity.update(true, true);
  t.mock.timers.tick(1000);
  assert.equal(state.active, true);
  activity.update(false, true);
  t.mock.timers.tick(350);
  assert.equal(state.active, false);
  activity.update(true, true);
  activity.update(false, false);
  assert.equal(state.active, false);
  activity.update(true, true);
  activity.update(false, true);
  activity.dispose();
  t.mock.timers.tick(1000);
  assert.equal(state.active, true);
});
