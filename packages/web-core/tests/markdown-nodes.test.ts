import assert from 'node:assert/strict';
import test from 'node:test';

import { decodeHtmlEntities } from '../dist/markdown/html-entities.js';
import { createMarkdownHtmlFoundation, type MarkdownHtmlState } from '../dist/markdown/html.js';
import {
  createMarkdownImageFoundation,
  type MarkdownImageLifecycle,
} from '../dist/markdown/image.js';

function image() {
  const trace: unknown[] = [],
    queue: Array<() => void> = [],
    cleanups: Array<() => void> = [];
  const lifecycle: MarkdownImageLifecycle = {
    markPending(key) {
      assert.equal(this, lifecycle);
      trace.push(['pending', key]);
    },
    markSettled(key) {
      assert.equal(this, lifecycle);
      trace.push(['settled', key]);
    },
    reportHeight(key, height) {
      assert.equal(this, lifecycle);
      trace.push(['height', key, height]);
    },
  };
  const state = {
    fallback: false,
    loaded: false,
    failed: false,
    nodeSrc: '/original.png',
    fallbackSrc: '/fallback.png',
    indexKey: 0 as string | number,
    get src(): string {
      return api.getSrc();
    },
    root: { offsetHeight: 45 } as { offsetHeight: number } | null,
  };
  const api = createMarkdownImageFoundation(
    state,
    lifecycle,
    () => new Promise<void>((resolve) => queue.push(resolve)),
    (src) => trace.push(['load', src]),
    (src) => trace.push(['error', src]),
    (payload) => trace.push(['click', payload]),
  );
  const reset = () => api.reset((cleanup) => cleanups.push(cleanup));
  const flush = async () => {
    queue.splice(0).forEach((resolve) => resolve());
    await Promise.resolve();
  };
  return { state, trace, lifecycle, api, cleanups, reset, flush, queue };
}

test('Markdown image construction is lazy and sanitizes original/fallback source priority', () => {
  const x = image();
  assert.deepEqual(x.trace, []);
  assert.equal(x.api.getSrc(), '/original.png');
  x.state.nodeSrc = 'javascript:alert(1)';
  assert.equal(x.api.getSrc(), '/fallback.png');
  x.state.fallbackSrc = 'javascript:alert(2)';
  assert.equal(x.api.getSrc(), '');
  x.state.nodeSrc = '/restored.png';
  assert.equal(x.api.getSrc(), '/restored.png');
  x.state.fallback = true;
  assert.equal(x.api.getSrc(), '');
});
test('Markdown image fallback is an intermediate state, terminal errors notify and settle after scheduling', async () => {
  const x = image();
  x.reset();
  x.api.handleError();
  assert.equal(x.state.fallback, true);
  assert.equal(x.state.failed, false);
  assert.deepEqual(x.trace, [['pending', 0]]);
  x.api.handleError();
  assert.equal(x.state.failed, true);
  assert.deepEqual(x.trace, [
    ['pending', 0],
    ['error', '/fallback.png'],
  ]);
  await x.flush();
  assert.deepEqual(x.trace.slice(-2), [
    ['height', 0, 45],
    ['settled', 0],
  ]);
});
test('Markdown image identical fallback and unsafe fallback go directly to terminal error', async () => {
  for (const fallbackSrc of ['/original.png', 'javascript:alert(1)', '']) {
    const x = image();
    x.state.fallbackSrc = fallbackSrc;
    x.reset();
    x.api.handleError();
    assert.equal(x.state.fallback, false);
    assert.equal(x.state.failed, true);
    assert.deepEqual(x.trace[1], ['error', '/original.png']);
    await x.flush();
  }
});
test('Markdown image click is gated by loaded and retains original event tuple', async () => {
  const x = image(),
    event = new Event('click') as MouseEvent;
  x.reset();
  x.api.handleClick(event);
  assert.equal(x.trace.length, 1);
  x.api.handleLoad();
  assert.equal(x.state.loaded, true);
  x.api.handleClick(event);
  assert.deepEqual(x.trace.slice(1), [
    ['load', '/original.png'],
    ['click', [event, '/original.png']],
  ]);
  await x.flush();
  assert.deepEqual(x.trace.slice(-2), [
    ['height', 0, 45],
    ['settled', 0],
  ]);
});
test('Markdown image reset preserves live src and registers cleanup only for nonempty sources', () => {
  const x = image();
  x.state.loaded = true;
  x.state.failed = true;
  x.state.fallback = true;
  x.reset();
  assert.equal(x.state.fallback, false);
  assert.equal(x.state.loaded, false);
  assert.equal(x.state.failed, false);
  assert.equal(x.cleanups.length, 1);
  x.cleanups[0]!();
  x.state.nodeSrc = '';
  x.state.fallbackSrc = '';
  x.reset();
  assert.equal(x.state.failed, true);
  assert.equal(x.cleanups.length, 1);
  assert.deepEqual(x.trace, [
    ['pending', 0],
    ['settled', 0],
  ]);
});
test('Markdown image stale scheduled settlement cannot report or settle a replacement request', async () => {
  const x = image();
  x.reset();
  const old = x.api.settle();
  x.cleanups[0]!();
  x.state.indexKey = 'new';
  x.reset();
  await x.flush();
  await old;
  assert.deepEqual(x.trace, [
    ['pending', 0],
    ['settled', 0],
    ['pending', 'new'],
  ]);
  const current = x.api.settle();
  await x.flush();
  await current;
  assert.deepEqual(x.trace.slice(-2), [
    ['height', 'new', 45],
    ['settled', 'new'],
  ]);
});
test('Markdown image late cleanup with the same key does not cancel the new request identity', () => {
  const x = image();
  x.reset();
  x.reset();
  x.cleanups[0]!();
  assert.deepEqual(x.trace, [
    ['pending', 0],
    ['pending', 0],
  ]);
  x.cleanups[1]!();
  x.cleanups[1]!();
  assert.deepEqual(x.trace.at(-1), ['settled', 0]);
  assert.equal(x.trace.length, 3);
});
test('Markdown image unmount before nextTick prevents height report and duplicate settlement', async () => {
  const x = image();
  x.reset();
  const settle = x.api.settle();
  x.api.settlePending();
  await x.flush();
  await settle;
  assert.deepEqual(x.trace, [
    ['pending', 0],
    ['settled', 0],
  ]);
});
test('Markdown image missing root still settles, while height callback reentry protects replacement', async () => {
  const x = image();
  x.reset();
  x.state.root = null;
  const first = x.api.settle();
  await x.flush();
  await first;
  assert.deepEqual(x.trace, [
    ['pending', 0],
    ['settled', 0],
  ]);
  x.state.root = { offsetHeight: 90 };
  x.reset();
  x.lifecycle.reportHeight = function (key, height) {
    assert.equal(this, x.lifecycle);
    x.trace.push(['height', key, height]);
    x.state.indexKey = 'replacement';
    x.reset();
  };
  const second = x.api.settle();
  await x.flush();
  await second;
  assert.deepEqual(x.trace.slice(-3), [
    ['pending', 0],
    ['height', 0, 90],
    ['pending', 'replacement'],
  ]);
  x.api.settlePending();
  assert.deepEqual(x.trace.at(-1), ['settled', 'replacement']);
});
test('Markdown image clears ownership before markSettled callback reentry', () => {
  const x = image();
  x.reset();
  let once = false;
  x.lifecycle.markSettled = function (key) {
    assert.equal(this, x.lifecycle);
    x.trace.push(['settled', key]);
    if (!once) {
      once = true;
      x.state.indexKey = 'again';
      x.reset();
    }
  };
  x.api.settlePending();
  x.api.settlePending();
  assert.deepEqual(x.trace, [
    ['pending', 0],
    ['settled', 0],
    ['pending', 'again'],
    ['settled', 'again'],
  ]);
});
test('Markdown image notification exceptions stop scheduling after state writes', () => {
  const state = {
    fallback: false,
    loaded: false,
    failed: false,
    nodeSrc: '/a',
    fallbackSrc: '',
    indexKey: 0,
    src: '/a',
    root: null,
  };
  let scheduled = 0;
  const api = createMarkdownImageFoundation(
    state,
    undefined,
    () => {
      scheduled++;
      return Promise.resolve();
    },
    () => {
      throw Error('load');
    },
    () => {
      throw Error('error');
    },
    () => {},
  );
  assert.throws(api.handleLoad, /load/);
  assert.equal(state.loaded, true);
  assert.throws(api.handleError, /error/);
  assert.equal(state.failed, true);
  assert.equal(scheduled, 0);
});
test('Markdown image nextTick is still awaited with no pending request and errors propagate', async () => {
  const state = {
    fallback: false,
    loaded: false,
    failed: false,
    nodeSrc: '',
    fallbackSrc: '',
    indexKey: '',
    src: '',
    root: null,
  };
  let calls = 0;
  const api = createMarkdownImageFoundation(
    state,
    undefined,
    () => {
      calls++;
      return Promise.reject(Error('tick'));
    },
    () => {},
    () => {},
    () => {},
  );
  await assert.rejects(api.settle(), /tick/);
  assert.equal(calls, 1);
});

function html(content: string, policy: MarkdownHtmlState['policy'] = 'safe') {
  const state: MarkdownHtmlState = {
    node: { content, type: 'html_inline' },
    htmlPolicy: undefined,
    contextPolicy: undefined,
    policy,
    rawTokens: [],
    safeTokens: [],
  };
  const api = createMarkdownHtmlFoundation(state);
  state.rawTokens = api.getRawTokens();
  state.safeTokens = api.getSafeTokens();
  return { state, api };
}
for (const [content, expected] of [
  ['<p>Text</p>', true],
  ['<a href="#">Link</a>', true],
  ['<span>Text</span>', false],
  ['<custom><p>Text</p></custom>', false],
  ['<svg><p>Text</p></svg>', false],
  ['<pre><p>Text</p></pre>', false],
] as const) {
  test(`Markdown HTML adaptation gate ${content}`, () => {
    const x = html(content, 'trusted');
    assert.equal(x.api.getCanAdapt(), expected);
  });
}
test('Markdown HTML escape and loading skip token getters', () => {
  const state: MarkdownHtmlState = {
    node: { content: '', loading: false },
    htmlPolicy: undefined,
    contextPolicy: undefined,
    policy: 'escape',
    get rawTokens(): never {
      throw Error('skip');
    },
    get safeTokens(): never {
      throw Error('skip');
    },
  };
  const api = createMarkdownHtmlFoundation(state);
  assert.equal(api.getCanAdapt(), false);
  state.policy = 'safe';
  state.node = { content: '', loading: true };
  assert.equal(api.getCanAdapt(), false);
});
test('Markdown HTML policy priority is lazy and falls back to safe', () => {
  let reads = 0;
  const x = html('');
  Object.defineProperty(x.state, 'contextPolicy', {
    get() {
      reads++;
      return 'trusted';
    },
    configurable: true,
  });
  x.state.htmlPolicy = 'escape';
  assert.equal(x.api.getPolicy(), 'escape');
  assert.equal(reads, 0);
  x.state.htmlPolicy = undefined;
  assert.equal(x.api.getPolicy(), 'trusted');
  assert.equal(reads, 1);
  Object.defineProperty(x.state, 'contextPolicy', { value: undefined });
  assert.equal(x.api.getPolicy(), 'safe');
});
for (const whitespace of [' ', '\n\t', '\r\n', '  '])
  test(`Markdown HTML retains inter-tag whitespace ${JSON.stringify(whitespace)}`, () => {
    const x = html(`<p><a href="#one">one</a>${whitespace}<a href="#two">two</a></p>`);
    const tree = x.api.buildTree(x.state.safeTokens);
    assert.deepEqual(tree, [
      {
        tag: 'p',
        attrs: {},
        children: [
          { tag: 'a', attrs: { href: '#one' }, children: ['one'] },
          whitespace,
          { tag: 'a', attrs: { href: '#two' }, children: ['two'] },
        ],
      },
    ]);
  });
test('Markdown HTML tree preserves the legacy sanitizer and entity decoding layers', () => {
  const x = html('<p title="A &amp;amp; B">&amp;lt;b&amp;gt; &#x1F600;</p>', 'trusted');
  const tree = x.api.buildTree(x.state.safeTokens);
  assert.equal(typeof tree[0], 'object');
  const first = tree[0] as Exclude<(typeof tree)[number], string>;
  assert.equal(first.attrs.title, 'A &amp; B');
  assert.equal(first.children.join(''), '&lt;b&gt; 😀');
});
test('Markdown HTML stack closes the matching ancestor and ignores unknown closes', () => {
  const x = html('');
  assert.deepEqual(
    x.api.buildTree([
      { type: 'tag_open', tagName: 'p' },
      { type: 'tag_open', tagName: 'em' },
      { type: 'text', content: 'one' },
      { type: 'tag_close', tagName: 'p' },
      { type: 'tag_close', tagName: 'missing' },
      { type: 'text', content: 'two' },
      { type: 'self_closing' },
    ]),
    [
      { tag: 'p', attrs: {}, children: [{ tag: 'em', attrs: {}, children: ['one'] }] },
      'two',
      { tag: 'span', attrs: {}, children: [] },
    ],
  );
});
test('Markdown HTML keeps trusted attrs while safe policy blocks event handlers and unsafe URLs', () => {
  for (const policy of ['safe', 'trusted'] as const) {
    const x = html('');
    x.state.policy = policy;
    const tree = x.api.buildTree([
      {
        type: 'self_closing',
        tagName: 'a',
        attrs: { href: 'javascript:alert(1)', onclick: 'alert(2)', title: 'A &amp; B' },
      },
    ]);
    const first = tree[0] as Exclude<(typeof tree)[number], string>;
    assert.equal(first.attrs.title, 'A & B');
    assert.equal(first.attrs.href, undefined);
    assert.equal(first.attrs.onclick, undefined);
  }
});
test('Markdown HTML host classification keeps block node shortcut lazy and observes live token cache', () => {
  const x = html('<a>Link</a>');
  assert.equal(x.api.getHostTag(), 'span');
  x.state.safeTokens = [{ type: 'tag_open', tagName: 'table' }];
  assert.equal(x.api.getHostTag(), 'div');
  x.state.node = { content: '', type: 'html_block' };
  Object.defineProperty(x.state, 'safeTokens', {
    get() {
      throw Error('skip');
    },
  });
  assert.equal(x.api.getHostTag(), 'div');
});
test('Markdown entity decoding preserves backslashes, unknown entities and at most two passes', () => {
  assert.equal(decodeHtmlEntities('plain\\text'), 'plain\\text');
  assert.equal(decodeHtmlEntities('&amp;lt; &amp;amp;lt; &unknown; \\*'), '< &lt; &unknown; \\*');
  assert.equal(decodeHtmlEntities('&#0;'), '&#0;');
});
