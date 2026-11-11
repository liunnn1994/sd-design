import { RegexVis as RootRegexVis } from '@sdata/web-react';
import { RegexVis as EntryRegexVis } from '@sdata/web-react/regex-vis';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { ConfigProvider } from '../dist/config-provider/index.js';
import { RegexVis } from '../dist/regex-vis/index.js';

test('RegexVis renders groups, choices, assertions and lazy quantifiers', () => {
  assert.equal(RootRegexVis, RegexVis);
  assert.equal(EntryRegexVis, RegexVis);
  const html = render(h(RegexVis, { value: String.raw`^(foo|bar)+?\d$`, showInput: false }));
  assert.match(html, /role="img"/);
  for (const variant of ['group', 'choice', 'assertion', 'character']) {
    assert.match(html, new RegExp(`sd-regex-vis-node-${variant}`));
  }
  assert.match(html, /stroke-dasharray="4 4"/);
  assert.match(html, /sd-regex-vis-quantifier/);
  assert.doesNotMatch(html, /sd-regex-vis-controls|<input/);
});

test('RegexVis respects Unicode mode when grouping surrogate pairs', () => {
  const unicode = render(
    h(RegexVis, { value: String.raw`\uD83D\uDE00+`, flags: ['u'], showInput: false }),
  );
  const codeUnits = render(h(RegexVis, { value: String.raw`\uD83D\uDE00+`, showInput: false }));
  assert.equal(
    (unicode.match(/class="sd-regex-vis-node sd-regex-vis-node-character"/g) ?? []).length,
    1,
  );
  assert.equal(
    (codeUnits.match(/class="sd-regex-vis-node sd-regex-vis-node-character"/g) ?? []).length,
    2,
  );
  assert.match(unicode, /1 - ∞/);
});

test('RegexVis uses literal flags and passes effective state to custom footers', () => {
  let footerCalled = false;
  const html = render(
    h(RegexVis, {
      value: '/[😀-🙏]/u',
      flags: ['g'],
      showInput: false,
      renderFooter: ({ value, flags }) => {
        footerCalled = true;
        assert.equal(value, '/[😀-🙏]/u');
        assert.deepEqual(flags, ['u']);
        return h('b', null, 'FOOTER');
      },
    }),
  );
  assert.equal(footerCalled, true);
  assert.match(html, /😀/);
  assert.match(html, /🙏/);
  assert.match(html, /FOOTER/);
  assert.doesNotMatch(html, /role="alert"/);
});

test('RegexVis exposes accessible error and empty render contexts without a graph', () => {
  const invalid = render(
    h(RegexVis, { value: '[', renderError: ({ error }) => h('b', null, error.message) }),
  );
  assert.match(invalid, /role="alert"><b>[^<]+<\/b>/);
  assert.doesNotMatch(invalid, /data-testid="regex-vis-graph"/);
  const empty = render(
    h(RegexVis, { emptyText: 'No expression', renderEmpty: ({ text }) => h('em', null, text) }),
  );
  assert.match(empty, /<em>No expression<\/em>/);
  assert.doesNotMatch(empty, /data-testid="regex-vis-graph"/);
});

test('RegexVis keeps readonly editing separate from selectable graph semantics', () => {
  const html = render(h(RegexVis, { defaultValue: 'a', readonly: true }));
  assert.match(html, /readonly=""/i);
  assert.match(html, /disabled=""/);
  assert.match(html, /role="button" tabindex="0"/);
  const inert = render(h(RegexVis, { value: 'a', selectable: false, showInput: false }));
  assert.doesNotMatch(inert, /role="button"|tabindex|aria-pressed/);
});

test('RegexVis preserves custom prefixes, native attributes and accessible graph labels', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(RegexVis, {
        value: 'a',
        id: 'expression',
        className: 'extra',
        ariaLabel: 'Expression diagram',
        showFlags: false,
      }),
    ),
  );
  assert.match(html, /id="expression"/);
  assert.match(html, /custom-regex-vis-selectable extra/);
  assert.match(html, /aria-label="Expression diagram：a"/);
  assert.doesNotMatch(html, /custom-regex-vis-flags/);
});
