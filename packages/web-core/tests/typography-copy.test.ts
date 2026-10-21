import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ClipboardOptions } from '../dist/clipboard.js';
import type { EllipsisConfig } from '../dist/typography/types.js';

import { createCopyFoundation, getCopyDisabled } from '../dist/copy/foundation.js';
import {
  escapeHtml,
  styleAttribute,
  getTypographyContentTags,
  getTypographyMarkStyle,
  getTypographyRichHtml,
  normalizeTypographyEllipsis,
} from '../dist/typography/data.js';
import { createTypographyEditFoundation } from '../dist/typography/edit.js';
import {
  createTypographyFoundation,
  type TypographyFoundationState,
} from '../dist/typography/foundation.js';
import {
  createTypographyTextContainer,
  measureTypographyInnerText,
} from '../dist/typography/measure.js';
import {
  createTypographyOperations,
  getTypographyShowExpand,
} from '../dist/typography/operations.js';

function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function typography() {
  const props = {
    ellipsis: false,
    copyable: false,
    editable: false,
    copyText: undefined as string | undefined,
    copyDelay: 3000,
    clipboardProps: undefined as ClipboardOptions | undefined,
    editTooltipProps: { name: 'edit' },
    copyTooltipProps: { name: 'copy' },
  };
  const slots = {
    'copy-tooltip': () => 'tooltip',
    'copy-icon': () => 'icon',
    'expand-node': () => 'expand',
  };
  const state: TypographyFoundationState<() => string> = {
    props,
    slots,
    fullText: 'initial',
    isEllipsis: false,
    expanded: false,
    isCopied: false,
    editing: false,
    editTextValue: 'initial',
    ellipsisConfig: { expandable: true, showTooltip: false },
  };
  const events: unknown[][] = [];
  let text = 'measured';
  const callbacks = {
    getInnerText: () => {
      events.push(['measure']);
      return text;
    },
    copy: (value: string, options: ClipboardOptions | undefined): unknown => {
      events.push(['sdk', value, options]);
      return Promise.resolve(true);
    },
    setEditing: (value: boolean) => {
      events.push(['set', value]);
      Object.assign(state, { editing: value });
    },
    updateEditing: (value: boolean) => {
      events.push(['updateEditing', value]);
    },
    editStart: () => {
      events.push(['start']);
    },
    updateEditText: (value: string) => {
      events.push(['updateText', value]);
    },
    change: (value: string) => {
      events.push(['change', value]);
    },
    editEnd: () => {
      events.push(['end']);
    },
    copied: (value: string) => {
      events.push(['copied', value, state.isCopied]);
    },
    ellipsis: (value: boolean) => {
      events.push(['ellipsis', value, state.isEllipsis]);
    },
    expand: (value: boolean) => {
      events.push(['expand', value, state.expanded]);
    },
  };
  return {
    props,
    state,
    slots,
    callbacks,
    events,
    set text(value: string) {
      text = value;
    },
    foundation: createTypographyFoundation(state, callbacks),
  };
}
function copyFixture() {
  const state = {
    props: {
      content: 'original',
      clipboardProps: { format: 'text/plain' } as ClipboardOptions | undefined,
    },
    isDisabled: false,
    copied: false,
  };
  const events: unknown[][] = [];
  const callbacks = {
    copy: async (content: string, options: ClipboardOptions | undefined) => {
      events.push(['sdk', content, options]);
      return true;
    },
    success: () => {
      events.push(['success', state.copied]);
    },
    copied: (content: string) => {
      events.push(['copy', content, state.copied]);
    },
  };
  return { state, callbacks, events, foundation: createCopyFoundation(state, callbacks) };
}

test('ellipsis defaults preserve explicit undefined, tooltip component and props identity', () => {
  const tooltip = {},
    popover = {},
    props = { placement: 'top' };
  assert.deepEqual(normalizeTypographyEllipsis({}, { tooltip, popover }), {
    rows: 1,
    suffix: '',
    ellipsisStr: '...',
    expandable: false,
    showTooltip: false,
    TooltipComponent: tooltip,
    tooltipProps: {},
  });
  const result = normalizeTypographyEllipsis(
    { rows: undefined, showTooltip: { type: 'popover', props } } as unknown as EllipsisConfig,
    { tooltip, popover },
  );
  assert.equal(result.rows, undefined);
  assert.equal(result.TooltipComponent, popover);
  assert.equal(result.tooltipProps, props);
  assert.equal(result.showTooltip, true);
});
test('format flags preserve mark as the outer tag and raw text is escaped once', () => {
  const props = {
    bold: true,
    underline: true,
    delete: true,
    code: true,
    mark: { color: 'red" data-bad="x' },
  };
  const tags = getTypographyContentTags(props),
    style = getTypographyMarkStyle(props);
  assert.deepEqual(tags, ['b', 'u', 'del', 'code', 'mark']);
  assert.deepEqual(style, { backgroundColor: props.mark.color });
  assert.equal(
    getTypographyRichHtml(tags, style, '<&>"'),
    '<mark style="background-color:red&quot; data-bad=&quot;x"><code><del><u><b>&lt;&amp;&gt;&quot;</b></u></del></code></mark>',
  );
  assert.equal(escapeHtml('&amp;'), '&amp;amp;');
  assert.equal(styleAttribute(), '');
  assert.equal(
    styleAttribute({ fontSize: '12px', color: 'red' }),
    ' style="font-size:12px;color:red"',
  );
});
test('false formatting produces neither tags nor mark style', () => {
  assert.deepEqual(
    getTypographyContentTags({
      bold: false,
      underline: false,
      delete: false,
      code: false,
      mark: false,
    }),
    [],
  );
  assert.deepEqual(getTypographyMarkStyle({ mark: true }), {});
  assert.deepEqual(getTypographyMarkStyle({ mark: { color: '' } }), {});
});
test('full text measurement is demand-driven and explicit empty edit text is retained', () => {
  const f = typography();
  f.foundation.updateFullText();
  assert.deepEqual(f.events, []);
  f.props.editable = true;
  f.foundation.updateFullText();
  assert.equal(f.state.fullText, 'measured');
  assert.equal(f.foundation.getEditTextValue(''), '');
  assert.equal(f.foundation.getEditTextValue(undefined), 'measured');
  assert.equal(f.foundation.getMergeEditing(), false);
  Object.assign(f.state, { editing: true });
  assert.equal(f.foundation.getMergeEditing(), true);
});
test('clamp notification deduplicates and publishes state before callback', () => {
  const f = typography();
  f.foundation.handleClampChange(false);
  f.foundation.handleClampChange(true);
  f.foundation.handleClampChange(true);
  f.foundation.handleClampChange(false);
  assert.deepEqual(f.events, [
    ['ellipsis', true, true],
    ['ellipsis', false, false],
  ]);
});
test('root attrs prioritize explicit titles and withdraw fallback on expand or tooltip', () => {
  const f = typography();
  f.props.ellipsis = true;
  f.state.isEllipsis = true;
  assert.deepEqual(f.foundation.getRootAttrs({ id: 'root' }), { title: 'initial', id: 'root' });
  assert.deepEqual(f.foundation.getRootAttrs({ title: 'user' }), { title: 'user' });
  f.state.expanded = true;
  assert.deepEqual(f.foundation.getRootAttrs({}), {});
  f.state.expanded = false;
  Object.assign(f.state, { ellipsisConfig: { expandable: true, showTooltip: true } });
  assert.deepEqual(f.foundation.getRootAttrs({}), {});
});
test('editing preserves update/start/state and update/end/state event order', () => {
  const f = typography();
  f.foundation.onEditEnd();
  assert.deepEqual(f.events, []);
  f.foundation.onEditStart();
  f.foundation.handleEditContentChange('initial');
  f.foundation.handleEditContentChange('changed');
  f.foundation.onEditEnd();
  f.foundation.onEditEnd();
  assert.deepEqual(f.events, [
    ['updateEditing', true],
    ['start'],
    ['set', true],
    ['updateText', 'changed'],
    ['change', 'changed'],
    ['updateEditing', false],
    ['end'],
    ['set', false],
  ]);
});
test('Typography feedback precedes SDK completion and forwards options without waiting', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = typography(),
    pending = deferred<boolean>(),
    options = { format: 'text/html' };
  f.props.copyText = '';
  f.props.clipboardProps = options;
  f.callbacks.copy = (text, received) => {
    f.events.push(['sdk', text, received]);
    return pending.promise;
  };
  f.foundation.onCopyClick();
  assert.equal(f.state.isCopied, true);
  assert.deepEqual(f.events, [
    ['sdk', '', options],
    ['copied', '', true],
  ]);
  pending.resolve(false);
  await pending.promise;
  assert.equal(f.state.isCopied, true);
  t.mock.timers.tick(3000);
  assert.equal(f.state.isCopied, false);
});
test('Typography re-copy measures latest slot text and extends the existing feedback timer', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = typography();
  f.props.copyable = true;
  f.foundation.onCopyClick();
  t.mock.timers.tick(2000);
  f.text = 'latest';
  f.foundation.onCopyClick();
  t.mock.timers.tick(1000);
  assert.equal(f.state.isCopied, true);
  assert.deepEqual(
    f.events.filter((e) => e[0] === 'copied').map((e) => e[1]),
    ['measured', 'latest'],
  );
  t.mock.timers.tick(2000);
  assert.equal(f.state.isCopied, false);
});
test('Typography dispose cancels feedback reset and expand/operation projections retain identity', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = typography();
  f.props.copyText = 'copy';
  f.foundation.onCopyClick();
  f.foundation.dispose();
  t.mock.timers.tick(5000);
  assert.equal(f.state.isCopied, true);
  f.foundation.onExpandClick();
  assert.deepEqual(f.events.at(-1), ['expand', true, true]);
  f.props.ellipsis = true;
  const ops = f.foundation.getOperationsProps();
  assert.equal(ops.forceRenderExpand, true);
  assert.equal(ops.copyIcon, f.slots['copy-icon']);
  assert.equal(ops.editTooltipProps, f.props.editTooltipProps);
  assert.equal(ops.onEdit, f.foundation.onEditStart);
  f.props.ellipsis = false;
  assert.equal(f.foundation.getOperationsProps().forceRenderExpand, false);
});
test('operation activation prevents default before action and ignores other keys', () => {
  const calls: string[] = [],
    ops = createTypographyOperations({
      edit: () => calls.push('edit'),
      copy: () => calls.push('copy'),
      expand: () => calls.push('expand'),
    });
  for (const [method, name] of [
    [ops.onEditKeydown, 'edit'],
    [ops.onCopyKeydown, 'copy'],
    [ops.onExpandKeydown, 'expand'],
  ] as const) {
    for (const key of ['Enter', ' ']) {
      method({
        key,
        preventDefault: () => {
          calls.push('prevent');
        },
      } as KeyboardEvent);
      assert.deepEqual(calls.splice(0), ['prevent', name]);
    }
    method({ key: 'Tab' } as KeyboardEvent);
    assert.deepEqual(calls, []);
  }
  assert.equal(getTypographyShowExpand(false, true, false), false);
  assert.equal(getTypographyShowExpand(true, false, false), true);
});
test('edit focus reads the current value after focusing and change emits update before change', () => {
  const calls: unknown[][] = [];
  const input = {
    value: 'before',
    focus() {
      calls.push(['focus']);
      this.value = 'after-focus';
    },
    setSelectionRange(start: number, end: number) {
      calls.push(['range', start, end]);
    },
  };
  const foundation = createTypographyEditFoundation(
    {
      rootElement: {
        querySelector: (selector: string) => {
          calls.push(['query', selector]);
          return input;
        },
      } as unknown as HTMLElement,
    },
    {
      update: (text) => calls.push(['update', text]),
      change: (text) => calls.push(['change', text]),
      end: () => calls.push(['end']),
    },
  );
  foundation.focusInput();
  foundation.onChange('edit');
  foundation.onEnter({ isComposing: true } as KeyboardEvent);
  foundation.onEnter({ isComposing: false } as KeyboardEvent);
  assert.deepEqual(calls, [
    ['query', 'input'],
    ['focus'],
    ['range', 11, 11],
    ['update', 'edit'],
    ['change', 'edit'],
    ['end'],
  ]);
});
test('edit focus is inert without a mounted input', () => {
  let ends = 0;
  const f = createTypographyEditFoundation(
    { rootElement: undefined },
    {
      update() {},
      change() {},
      end() {
        ends++;
      },
    },
  );
  f.focusInput();
  f.onEnd();
  assert.equal(ends, 1);
});
test('native text measuring container preserves aria/style and cleans up after renderer failure', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document'),
    calls: unknown[][] = [];
  const container = {
    style: { cssText: '' },
    innerText: 'rendered',
    setAttribute: (...args: string[]) => calls.push(['attr', ...args]),
    remove: () => calls.push(['remove']),
  } as unknown as HTMLDivElement;
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement: (tag: string) => {
        calls.push(['create', tag]);
        return container;
      },
      body: {
        appendChild: (el: HTMLElement) => {
          assert.equal(el, container);
          calls.push(['append']);
        },
      },
    },
  });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
    else Reflect.deleteProperty(globalThis, 'document');
  });
  assert.equal(createTypographyTextContainer(), container);
  assert.equal(
    container.style.cssText,
    'position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;',
  );
  assert.equal(
    measureTypographyInnerText(
      container,
      () => calls.push(['render']),
      () => calls.push(['unmount']),
    ),
    'rendered',
  );
  assert.deepEqual(calls, [
    ['create', 'div'],
    ['attr', 'aria-hidden', 'true'],
    ['append'],
    ['render'],
    ['unmount'],
    ['remove'],
  ]);
  const error = new Error('render');
  assert.throws(
    () =>
      measureTypographyInnerText(
        container,
        () => {
          throw error;
        },
        () => calls.push(['unmount']),
      ),
    error,
  );
  assert.deepEqual(calls.slice(-2), [['unmount'], ['remove']]);
});
test('Copy disabled normalization retains boolean attribute conventions', () => {
  for (const value of ['', true, 'true']) assert.equal(getCopyDisabled(value), true);
  for (const value of [false, 'false', undefined, null, 0, 1])
    assert.equal(getCopyDisabled(value), false);
});
test('Copy ignores disabled and empty content without invoking the SDK', async () => {
  const f = copyFixture();
  f.state.isDisabled = true;
  await f.foundation.handleCopy();
  f.state.isDisabled = false;
  f.state.props.content = '';
  await f.foundation.handleCopy();
  assert.deepEqual(f.events, []);
});
test('Copy waits for SDK success, keeps captured content/options and publishes before emitting', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = copyFixture(),
    pending = deferred<boolean>();
  const options = f.state.props.clipboardProps;
  f.callbacks.copy = async (content, received) => {
    assert.equal(content, 'original');
    assert.equal(received, options);
    return pending.promise;
  };
  const copying = f.foundation.handleCopy();
  assert.equal(f.state.copied, false);
  assert.deepEqual(f.events, []);
  f.state.props.content = 'new';
  pending.resolve(true);
  await copying;
  assert.deepEqual(f.events, [
    ['success', false],
    ['copy', 'original', true],
  ]);
  assert.equal(f.state.copied, true);
  t.mock.timers.tick(2499);
  assert.equal(f.state.copied, true);
  t.mock.timers.tick(1);
  assert.equal(f.state.copied, false);
});
test('Copy false result rejects with its public failure message and does not report success', async () => {
  const f = copyFixture();
  f.callbacks.copy = async () => false;
  await assert.rejects(f.foundation.handleCopy(), {
    message: '[sdCopy] failed to copy content to the clipboard',
  });
  assert.equal(f.state.copied, false);
  assert.deepEqual(f.events, []);
});
test('Copy SDK rejection propagates even when disposal occurred while awaiting it', async () => {
  const f = copyFixture(),
    pending = deferred<boolean>(),
    error = new Error('sdk');
  f.callbacks.copy = () => pending.promise;
  const copying = f.foundation.handleCopy();
  f.foundation.dispose();
  pending.reject(error);
  await assert.rejects(copying, error);
  assert.deepEqual(f.events, []);
});
test('Copy disposed pending success/false cannot create feedback, events or errors', async () => {
  for (const result of [true, false]) {
    const f = copyFixture(),
      pending = deferred<boolean>();
    f.callbacks.copy = () => pending.promise;
    const copying = f.foundation.handleCopy();
    f.foundation.dispose();
    pending.resolve(result);
    await copying;
    assert.equal(f.state.copied, false);
    assert.deepEqual(f.events, []);
  }
});
test('Copy re-copy extends the 2500ms timer and disposal cancels its reset', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = copyFixture();
  await f.foundation.handleCopy();
  t.mock.timers.tick(2000);
  await f.foundation.handleCopy();
  t.mock.timers.tick(500);
  assert.equal(f.state.copied, true);
  t.mock.timers.tick(1999);
  assert.equal(f.state.copied, true);
  t.mock.timers.tick(1);
  assert.equal(f.state.copied, false);
  await f.foundation.handleCopy();
  f.foundation.dispose();
  t.mock.timers.tick(5000);
  assert.equal(f.state.copied, true);
});
