import type { Writable } from 'type-fest';

import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import type { RichTextEditorContentSnapshot } from '../dist/rich-text-editor/types.js';
import type { SenderSlotData } from '../dist/sender/types.js';

import {
  createSenderFoundation,
  type SenderFoundationState,
  type SenderSkillData,
  type SenderValueData,
  type SenderEditor,
} from '../dist/sender/foundation.js';

function setup() {
  type State = SenderFoundationState<SenderSlotData, SenderSkillData>;
  let foundation!: ReturnType<typeof createSenderFoundation<SenderSlotData, SenderSkillData>>;
  const props: State['props'] = { submitType: 'enter' };
  const events: [string, ...unknown[]][] = [];
  const afterRender: (() => void)[] = [];
  const state: Writable<State> = {
    props,
    prefixCls: 'custom-sender',
    controlled: false,
    innerValue: 'initial',
    editorReady: false,
    runtimeConfig: [] as SenderSlotData[],
    activeSkill: undefined as SenderSkillData | undefined,
    slotValue: { value: '', slotConfig: [] } as SenderValueData<SenderSlotData, SenderSkillData>,
    editor: undefined as SenderEditor | undefined,
    exposedTextarea: undefined as State['exposedTextarea'],
    container: null as HTMLDivElement | null,
    configs: [] as SenderSlotData[],
    configByKey: new Map<string, SenderSlotData>(),
    speechAvailable: true,
    speechRequesting: false,
    speechStopping: false,
    recording: false,
    readonlyHover: false,
    get mergedValue(): string {
      return foundation.mergedValue();
    },
    get slotMode(): boolean {
      return foundation.slotMode();
    },
    get submitDisabled(): boolean {
      return foundation.valueEmpty();
    },
    get clearDisabled(): boolean {
      return foundation.valueEmpty();
    },
    get cancelDisabled(): boolean {
      return foundation.cancelDisabled();
    },
  };
  const callbacks = {
    update(value: string) {
      events.push(['update', value]);
    },
    change(value: State['slotValue'], event?: Event) {
      events.push(['change', value, event]);
    },
    submit(value: State['slotValue']) {
      events.push(['submit', value]);
    },
    cancel() {
      events.push(['cancel']);
    },
    speech() {
      events.push(['speech']);
    },
    pasteFile(files: FileList) {
      events.push(['files', files]);
    },
    paste(event: ClipboardEvent) {
      events.push(['paste', event]);
    },
    afterRender(callback: () => void) {
      afterRender.push(callback);
    },
    showReadonlyTip() {
      events.push(['show-readonly']);
    },
    hideReadonlyTip() {
      events.push(['hide-readonly']);
    },
  };
  foundation = createSenderFoundation(state, callbacks);
  return { foundation, state, props, events, callbacks, afterRender };
}

class ElementStub {
  queries: string[] = [];
  matches = new Map<string, ElementStub>();
  focusCalls: unknown[] = [];
  blurCalls = 0;
  closestMatch: ElementStub | null = null;
  focus(options?: unknown) {
    this.focusCalls.push(options);
  }
  blur() {
    this.blurCalls++;
  }
  querySelector(selector: string) {
    this.queries.push(selector);
    return this.matches.get(selector) ?? null;
  }
  closest(selector: string) {
    this.queries.push(selector);
    return this.closestMatch;
  }
}
class TextareaStub extends ElementStub {
  value = '';
  selectionStart = 0;
  selectionEnd = 0;
  selections: [number, number][] = [];
  selected = false;
  setSelectionRange(start: number, end: number) {
    this.selections.push([start, end]);
  }
  select() {
    this.selected = true;
  }
}

function browser(t: TestContext) {
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  for (const [key, value] of Object.entries({
    Element: ElementStub,
    HTMLInputElement: class extends ElementStub {},
    HTMLTextAreaElement: TextareaStub,
    CSS: { escape: (key: string) => `escaped:${key}` },
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id: number) => {
      frames.delete(id);
    },
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, key, original);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
  return {
    flush() {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(0);
    },
  };
}

function editorFixture(rootElement: HTMLDivElement | null = null) {
  let content: RichTextEditorContentSnapshot[] = [];
  const calls: [string, ...unknown[]][] = [];
  const editor: SenderEditor = {
    rootElement,
    getContent() {
      calls.push(['get']);
      return content;
    },
    setContent(next, options) {
      content = [...next];
      calls.push(['set', next, options]);
    },
    focus(callback, options) {
      calls.push(['focus', callback, options]);
    },
    blur() {
      calls.push(['blur']);
    },
    insertText(value, options) {
      calls.push(['text', value, options]);
    },
    insertContent(value, options) {
      calls.push(['content', value, options]);
    },
    dispatchCommand(command, payload) {
      calls.push(['command', command, payload]);
      return true;
    },
  };
  return {
    editor,
    calls,
    set content(value: RichTextEditorContentSnapshot[]) {
      content = value;
    },
  };
}

function keyboard(key: string, extra: Partial<KeyboardEvent> = {}) {
  const calls: string[] = [];
  const event = {
    key,
    isComposing: false,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    target: null,
    preventDefault() {
      calls.push('prevent');
    },
    stopPropagation() {
      calls.push('stop');
    },
    ...extra,
  } as unknown as KeyboardEvent;
  return { event, calls };
}

test('Sender plain values construct without DOM and preserve controlled undefined and fresh value objects', () => {
  const { foundation, state, props } = setup();
  assert.equal(typeof globalThis.document, 'undefined');
  assert.deepEqual(foundation.getValue(), { value: 'initial', slotConfig: [], skill: undefined });
  assert.notEqual(foundation.getValue(), foundation.getValue());
  state.controlled = true;
  props.modelValue = undefined;
  assert.equal(foundation.getValue().value, '');
  props.modelValue = 'held';
  assert.equal(foundation.getValue().value, 'held');
  state.controlled = false;
  assert.equal(foundation.getValue().value, 'initial');
});

test('Sender merges pending value updates while native input cancels the pending publication', async () => {
  const { foundation, state, events } = setup();
  foundation.handleValueUpdate('first');
  foundation.handleValueUpdate('last');
  await Promise.resolve();
  assert.equal(state.innerValue, 'last');
  assert.deepEqual(
    events.map((e) => e[0]),
    ['update', 'change'],
  );
  events.length = 0;
  const event = new Event('input');
  foundation.handleValueUpdate('pending');
  foundation.handleInput('native', event);
  await Promise.resolve();
  assert.equal(state.innerValue, 'native');
  assert.deepEqual(
    events.map((e) => e[0]),
    ['update', 'change'],
  );
  assert.equal(events[1][2], event);
  events.length = 0;
  foundation.handleValueUpdate('same');
  foundation.handleValueUpdate('same');
  await Promise.resolve();
  assert.equal(events.length, 2);
});

test('Sender controlled changes preserve the requested payload even when update accepts a different value', () => {
  const { foundation, state, props, callbacks, events } = setup();
  state.controlled = true;
  props.modelValue = 'held';
  callbacks.update = (value) => {
    events.push(['update', value, foundation.getValue().value]);
    props.modelValue = 'accepted';
  };
  foundation.handleInput('requested', new Event('input'));
  assert.deepEqual(events[0], ['update', 'requested', 'held']);
  assert.equal((events[1][1] as { value: string }).value, 'requested');
  assert.equal(state.innerValue, 'initial');
  assert.equal(foundation.getValue().value, 'accepted');
});

test('Sender guarded actions and unguarded public clear retain their distinct contracts', () => {
  const { foundation, state, props, events } = setup();
  props.disabled = true;
  foundation.triggerSend();
  foundation.triggerClear();
  foundation.triggerCancel();
  foundation.triggerSpeech();
  assert.deepEqual(events, []);
  foundation.clear();
  assert.equal(state.innerValue, '');
  assert.equal(events.length, 2);
  events.length = 0;
  props.disabled = false;
  foundation.triggerSend();
  foundation.triggerClear();
  foundation.triggerCancel();
  assert.deepEqual(events, []);
  props.loading = true;
  foundation.triggerSend();
  foundation.triggerCancel();
  assert.deepEqual(events, [['cancel']]);
  props.loading = false;
  state.innerValue = 'send';
  foundation.triggerSend();
  foundation.triggerSpeech();
  assert.deepEqual(
    events.slice(1).map((e) => e[0]),
    ['submit', 'speech'],
  );
  state.speechRequesting = true;
  state.recording = true;
  assert.equal(foundation.actionContext().speechDisabled, true);
  assert.equal(foundation.actionContext().recording, true);
  assert.equal(foundation.actionContext().send, foundation.triggerSend);
});

test('Sender editor synchronization is ready-gated and rebuilds values before change notification', () => {
  const { foundation, state, props, callbacks } = setup(),
    fixture = editorFixture();
  props.slotConfig = [];
  state.configs = [{ type: 'input', key: 'zero', props: { defaultValue: 0 } }];
  state.editor = fixture.editor;
  state.activeSkill = { value: 'skill' };
  foundation.syncSlotEditor();
  assert.deepEqual(fixture.calls, []);
  foundation.handleSlotEditorReady();
  assert.equal(state.editorReady, true);
  assert.deepEqual(
    fixture.calls.map((c) => c[0]),
    ['get', 'set'],
  );
  assert.deepEqual(fixture.calls[1][2], { tag: 'sd-sender-slot-sync' });
  state.configByKey = new Map([['zero', state.configs[0]]]);
  fixture.content = [{ key: 'zero', name: 'input', value: 0 }];
  callbacks.change = (value) => {
    assert.equal(state.activeSkill, undefined);
    assert.equal(state.slotValue, value);
    assert.equal(foundation.getValue(), value);
  };
  foundation.handleSlotEditorChange();
  assert.equal(state.slotValue.value, '0');
  foundation.syncSlotMode(false);
  assert.equal(state.editorReady, false);
  const before = fixture.calls.length;
  foundation.handleSlotEditorChange();
  assert.equal(fixture.calls.length, before);
});

test('Sender clear restores the prop skill and runtime config before requesting the tagged editor update', () => {
  const { foundation, state, props } = setup(),
    fixture = editorFixture();
  props.slotConfig = [];
  props.skill = { value: 'seed' };
  state.activeSkill = { value: 'other' };
  state.runtimeConfig = [{ type: 'text', value: 'temporary' }];
  state.editor = fixture.editor;
  foundation.clear();
  assert.deepEqual(state.runtimeConfig, []);
  assert.equal(state.activeSkill, props.skill);
  assert.deepEqual(fixture.calls, [
    [
      'set',
      [{ key: '__sender_skill__', name: 'senderSkill', value: 'seed', textValue: '' }],
      { tag: 'sd-sender-slot-clear' },
    ],
  ]);
});

test('Sender skill removal honors guards and publishes the original event after removing the node', () => {
  const { foundation, state, props } = setup();
  const order: string[] = [],
    event = new Event('keydown');
  const closable = {
    disabled: true,
    onClose(value: MouseEvent) {
      assert.equal(value, event);
      assert.equal(this, closable);
      assert.equal(state.activeSkill, undefined);
      order.push('close');
    },
  };
  state.activeSkill = { value: 'skill', closable };
  foundation.removeSkill(event, () => order.push('remove'));
  assert.equal(order.length, 0);
  closable.disabled = false;
  props.readonly = 'Readonly';
  foundation.removeSkill(event, () => order.push('remove'));
  assert.equal(order.length, 0);
  props.readonly = false;
  foundation.removeSkill(event, () => order.push('remove'));
  assert.deepEqual(order, ['remove', 'close']);
});

test('Sender keyboard callbacks veto submission and slot newlines retain modifier, readonly and skill guards', (t) => {
  browser(t);
  const { foundation, state, props, events } = setup(),
    fixture = editorFixture();
  state.editor = fixture.editor;
  props.onKeydown = () => false;
  let input = keyboard('Enter');
  foundation.handleKeydown(input.event);
  foundation.handleSlotKeydown(input.event);
  assert.deepEqual(input.calls, []);
  assert.deepEqual(events, []);
  props.onKeydown = undefined;
  input = keyboard('Enter');
  foundation.handleKeydown(input.event);
  assert.deepEqual(input.calls, ['prevent']);
  assert.equal(events[0][0], 'submit');
  events.length = 0;
  props.submitType = 'shiftEnter';
  input = keyboard('Enter');
  foundation.handleSlotKeydown(input.event);
  assert.deepEqual(input.calls, ['prevent', 'stop']);
  assert.equal(fixture.calls[0][0], 'command');
  assert.equal(fixture.calls[0][2], false);
  fixture.calls.length = 0;
  props.readonly = true;
  input = keyboard('Enter');
  foundation.handleSlotKeydown(input.event);
  assert.deepEqual(input.calls, ['prevent', 'stop']);
  assert.deepEqual(fixture.calls, []);
  for (const extra of [
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    { isComposing: true },
  ]) {
    input = keyboard('Enter', extra);
    foundation.handleSlotKeydown(input.event);
    assert.deepEqual(input.calls, []);
  }
  const skill = new ElementStub();
  skill.closestMatch = skill;
  input = keyboard('Enter', { target: skill as unknown as EventTarget });
  foundation.handleSlotKeydown(input.event);
  assert.deepEqual(input.calls, []);
  assert.deepEqual(skill.queries, ['.custom-sender-skill-tag']);
});

test('Sender file paste prevents default before file/paste notifications and stops slot bubbling afterwards', () => {
  const { foundation, callbacks } = setup();
  const order: string[] = [];
  let reads = 0;
  const files = { length: 1 } as FileList;
  const event = {
    clipboardData: {
      files,
      getData() {
        reads++;
        return '';
      },
    },
    preventDefault() {
      order.push('prevent');
    },
    stopPropagation() {
      order.push('stop');
    },
  } as unknown as ClipboardEvent;
  callbacks.pasteFile = (value) => {
    assert.equal(value, files);
    order.push('files');
  };
  callbacks.paste = (value) => {
    assert.equal(value, event);
    order.push('paste');
  };
  foundation.handleSlotPaste(event);
  assert.deepEqual(order, ['prevent', 'files', 'paste', 'stop']);
  assert.equal(reads, 2);
});

test('Sender native textarea resolution retains raw, exposed-element, descendant and container fallbacks', (t) => {
  browser(t);
  const { foundation, state } = setup();
  const textarea = new TextareaStub(),
    root = new ElementStub();
  state.exposedTextarea = textarea;
  assert.equal(foundation.getNativeTextarea(), textarea);
  state.exposedTextarea = { $el: textarea };
  assert.equal(foundation.getNativeTextarea(), textarea);
  root.matches.set('textarea', textarea);
  state.exposedTextarea = { $el: root };
  assert.equal(foundation.getNativeTextarea(), textarea);
  state.exposedTextarea = undefined;
  state.container = root as unknown as HTMLDivElement;
  assert.equal(foundation.getNativeTextarea(), textarea);
  state.container = null;
  let focused = false,
    blurred = false;
  const exposed = {
    focus() {
      assert.equal(this, exposed);
      focused = true;
    },
    blur() {
      assert.equal(this, exposed);
      blurred = true;
    },
  };
  state.exposedTextarea = exposed;
  foundation.focus();
  foundation.blur();
  assert.equal(focused, true);
  assert.equal(blurred, true);
});

test('Sender normal insertion preserves suffix replacement and resolves the current textarea at the animation frame', (t) => {
  const clock = browser(t),
    { foundation, state, events } = setup();
  const first = new TextareaStub(),
    replacement = new TextareaStub();
  state.innerValue = 'ab<>cd';
  first.value = state.innerValue;
  first.selectionStart = 4;
  first.selectionEnd = 4;
  state.exposedTextarea = first;
  foundation.insert('X', 'cursor', '<>', true);
  assert.equal(state.innerValue, 'abXcd');
  assert.deepEqual(
    events.map((e) => e[0]),
    ['update', 'change'],
  );
  assert.deepEqual(first.focusCalls, []);
  replacement.value = state.innerValue;
  state.exposedTextarea = replacement;
  clock.flush();
  assert.deepEqual(replacement.focusCalls, [{ preventScroll: true }]);
  assert.deepEqual(replacement.selections.at(-1), [3, 3]);
  assert.deepEqual(first.selections, []);
  foundation.focus({ cursor: 'all' });
  assert.equal(replacement.selected, true);
  foundation.blur();
  assert.equal(replacement.blurCalls, 1);
});

test('Sender slot insertion retains config registration and next-render focus without native textarea reads', () => {
  const { foundation, state, props, afterRender } = setup(),
    fixture = editorFixture();
  props.slotConfig = [];
  state.editor = fixture.editor;
  const config: SenderSlotData = { type: 'input', key: 'zero', props: { defaultValue: 0 } };
  foundation.insert([config], 'end', 'replace', true);
  assert.equal(state.runtimeConfig[0], config);
  assert.equal(fixture.calls[0][0], 'content');
  assert.deepEqual(fixture.calls[0][2], { position: 'end', replaceCharacters: 'replace' });
  assert.equal(afterRender.length, 1);
  afterRender[0]();
  assert.deepEqual(fixture.calls.at(-1), [
    'focus',
    undefined,
    { preventScroll: true, selection: 'end' },
  ]);
  foundation.insert('text');
  assert.deepEqual(fixture.calls.at(-1), [
    'text',
    'text',
    { position: 'cursor', replaceCharacters: undefined },
  ]);
});

test('Sender slot focus escapes the key and falls back from a native control to its component', (t) => {
  browser(t);
  const root = new ElementStub(),
    component = new ElementStub(),
    control = new ElementStub();
  const { foundation, state, props } = setup(),
    fixture = editorFixture(root as unknown as HTMLDivElement);
  props.slotConfig = [];
  state.editor = fixture.editor;
  root.matches.set('[data-rich-text-component-key="escaped:a b"]', component);
  component.matches.set('input, textarea, button, [contenteditable="true"]', control);
  foundation.focus({ cursor: 'slot', key: 'a b', preventScroll: true });
  assert.deepEqual(control.focusCalls, [{ preventScroll: true }]);
  root.matches.set('[data-rich-text-component]', component);
  component.matches.clear();
  foundation.focus({ cursor: 'slot' });
  assert.deepEqual(component.focusCalls, [{ preventScroll: false }]);
});

test('Sender readonly key filtering and content-background focus preserve event ordering', (t) => {
  browser(t);
  const { foundation, state, events } = setup();
  state.readonlyHover = true;
  foundation.handleReadonlyKeydown(
    keyboard('a', { target: new TextareaStub() as unknown as EventTarget }).event,
  );
  assert.equal(state.readonlyHover, false);
  assert.deepEqual(events, [['hide-readonly']]);
  foundation.handleReadonlyKeydown(keyboard('a').event);
  assert.equal(events.at(-1)?.[0], 'show-readonly');
  const target = new TextareaStub();
  state.exposedTextarea = target;
  const mouse = {
    target,
    currentTarget: target,
    preventDefault() {
      events.push(['prevent']);
    },
  } as unknown as MouseEvent;
  foundation.handleContentMousedown(mouse);
  assert.equal(events.at(-1)?.[0], 'prevent');
  assert.equal(target.focusCalls.length, 1);
});
