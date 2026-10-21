import type { LexicalEditor } from 'lexical';

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $nodesOfType,
  createCommand,
  createEditor,
  COMMAND_PRIORITY_LOW,
  TextNode,
} from 'lexical';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { RichTextEditorAdapter } from '../src/rich-text-editor/foundation.ts';

import {
  createRichTextEditorFoundation,
  TRANSFORMERS,
} from '../dist/rich-text-editor/foundation.js';
import {
  InlineComponentNode,
  $isInlineComponentNode,
} from '../dist/rich-text-editor/nodes/inline-component-node.js';

function setup(ready = true) {
  const events: unknown[][] = [];
  let editor: LexicalEditor | null = ready
    ? createEditor({
        nodes: [
          InlineComponentNode,
          CodeNode,
          CodeHighlightNode,
          LinkNode,
          AutoLinkNode,
          ListNode,
          ListItemNode,
          HeadingNode,
          QuoteNode,
        ],
        onError: (error) => {
          throw error;
        },
      })
    : null;
  const adapter: RichTextEditorAdapter = {
    options: {
      plugins: [],
      transformers: TRANSFORMERS,
      history: false,
      historyDelay: 300,
      historyMaxDepth: null,
    },
    prefixCls: 'sd-rich-text-editor',
    get editor() {
      return editor;
    },
    rootElement: undefined,
    setEditor: (value) => {
      editor = value;
    },
    setEmpty: (value) => {
      events.push(['empty', value]);
    },
    setCanUndo: (value) => {
      events.push(['undo', value]);
    },
    setCanRedo: (value) => {
      events.push(['redo', value]);
    },
    setComponentHosts: (value) => {
      events.push(['hosts', value]);
    },
    hasStateListeners: () => false,
    afterRender: (task) => task(),
    onError: (error) => {
      events.push(['error', error]);
    },
    onUpdate: () => {},
    onUpdateValue: (value) => {
      events.push(['value', value]);
    },
    onChange: () => {},
    onReady: () => {},
  };
  return { adapter, events, engine: createRichTextEditorFoundation(adapter) };
}

test('rich text content and component snapshots are independent and round-trip through JSON without Vue', () => {
  const { engine } = setup();
  const data = {
    key: 'person',
    name: 'custom',
    value: { nested: { name: 'Ada' } },
    props: { count: 1 },
    textValue: '@Ada',
  };
  engine.setContent(['Hello\n', data, '!']);
  data.value.nested.name = 'changed';
  data.props.count = 2;
  assert.equal(engine.getText(), 'Hello\n@Ada!');
  const first = engine.getContent();
  const second = engine.getContent();
  assert.deepEqual(first, [
    'Hello\n',
    {
      key: 'person',
      name: 'custom',
      value: { nested: { name: 'Ada' } },
      props: { count: 1 },
      textValue: '@Ada',
    },
    '!',
  ]);
  assert.notEqual(first[1], second[1]);
  const json = engine.getJSON()!;
  engine.clear();
  assert.equal(engine.getText(), '');
  engine.setJSON(json);
  assert.deepEqual(engine.getContent(), first);
});

test('rich text insertion preserves start/end ordering and atomic character replacement', () => {
  const { engine } = setup();
  engine.setContent(['hello @ada']);
  engine.insertText('Ada', { replaceCharacters: '@ada' });
  assert.equal(engine.getText(), 'hello Ada');
  engine.insertContent(['Start '], { position: 'start' });
  engine.insertComponent({ key: 'tail', name: 'custom', textValue: ' end' }, { position: 'end' });
  assert.equal(engine.getText(), 'Start hello Ada end');
});

test('replacement does not consume a nonmatching suffix or extend a noncollapsed selection', () => {
  const { engine } = setup();
  engine.setContent(['hello world']);
  engine.insertText('!', { replaceCharacters: '@missing' });
  assert.equal(engine.getText(), 'hello world!');
  engine.update(
    () => {
      const node = $nodesOfType(TextNode)[0];
      const selection = node.select(0, 5);
      assert.equal(selection.isCollapsed(), false);
    },
    { discrete: true },
  );
  engine.insertText('Hi', { replaceCharacters: 'world!' });
  assert.equal(engine.getText(), 'Hi world!');
});

test('inline node updates preserve immutable payloads and removal preserves surrounding text', () => {
  const { engine } = setup();
  engine.setContent([
    'before ',
    { key: 'x', name: 'custom', value: 'one', textValue: '[x]' },
    ' after',
  ]);
  const key = engine.read(() => $nodesOfType(InlineComponentNode)[0].getKey())!;
  engine.updateComponent(key, { selected: ['two'] });
  const snapshot = engine.getContent()[1];
  assert.equal(typeof snapshot, 'object');
  assert.deepEqual(typeof snapshot === 'object' && snapshot.value, { selected: ['two'] });
  engine.read(() => {
    assert.ok($isInlineComponentNode($nodesOfType(InlineComponentNode)[0]));
  });
  engine.removeComponent(key);
  assert.equal(engine.getText(), 'before  after');
});

test('external JSON echo is skipped and invalid JSON reports the normalized error before config callback', () => {
  const { engine, adapter, events } = setup();
  engine.setContent(['original']);
  const json = engine.getJSON()!;
  engine.setJSON(json);
  const state = adapter.editor?.getEditorState();
  engine.syncModel(json);
  assert.equal(adapter.editor?.getEditorState(), state);
  engine.syncModel(undefined);
  assert.equal(engine.getText(), 'original');
  adapter.options.editorConfig = {
    onError: () => {
      events.push(['configError']);
    },
  };
  engine.setJSON('{invalid');
  assert.deepEqual(
    events.map((event) => event[0]),
    ['error', 'configError'],
  );
  assert.ok(events[0][1] instanceof Error);
});

test('markdown uses real Lexical transformers and format commands preserve the selected content', async (t) => {
  const { engine, adapter } = setup();
  t.after(registerRichText(adapter.editor!));
  engine.setMarkdown('# Heading\n\n**bold** and plain');
  assert.match(engine.getText(), /Heading/);
  assert.match(engine.getMarkdown(), /\*\*bold\*\*/);
  engine.setContent(['text']);
  engine.update(
    () => {
      $getRoot().select(0, $getRoot().getChildrenSize());
    },
    { discrete: true },
  );
  assert.equal(engine.formatText('italic'), true);
  await Promise.resolve();
  engine.read(() => {
    const selection = $getSelection();
    assert.ok($isRangeSelection(selection));
  });
  assert.equal(engine.getText(), 'text');
  assert.match(engine.getMarkdown(), /\*text\*/);
});

test('command registration keeps raw Lexical behavior and its cleanup removes the listener', () => {
  const { engine } = setup();
  engine.setContent(['text']);
  const command = createCommand<string>('CORE_EDITOR_TEST');
  const seen: string[] = [];
  const cleanup = engine.registerCommand(
    command,
    (value) => {
      seen.push(value);
      return true;
    },
    COMMAND_PRIORITY_LOW,
  );
  assert.equal(engine.dispatchCommand(command, 'first'), true);
  cleanup();
  assert.equal(engine.dispatchCommand(command, 'second'), false);
  assert.deepEqual(seen, ['first']);
});

test('readiness fallbacks and lifecycle calls remain safe without a root element', (t) => {
  const warnings: unknown[][] = [];
  t.mock.method(console, 'warn', (...args) => {
    warnings.push(args);
  });
  const { engine, adapter, events } = setup(false);
  engine.mount();
  assert.equal(adapter.editor, null);
  assert.equal(engine.getJSON(), undefined);
  assert.deepEqual(engine.getContent(), []);
  assert.equal(engine.getText(), '');
  assert.equal(engine.undo(), false);
  const command = createCommand<string>('NOT_READY');
  engine.registerCommand(command, () => false, COMMAND_PRIORITY_LOW)();
  engine.registerUpdateListener(() => {})();
  assert.equal(warnings.length, 2);
  engine.dispose();
  assert.deepEqual(events, [['hosts', []]]);
});
