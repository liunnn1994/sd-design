import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build } from 'vite';

import {
  RichTextEditor,
  RICH_TEXT_EDITOR_BUILT_IN_NODE_NAMES,
  RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES,
} from '../dist/rich-text-editor/index.js';

test('rich editor SSR has accessible state and semantic styles without touching the DOM', () => {
  const html = renderToStaticMarkup(
    h(RichTextEditor, {
      disabled: true,
      readonly: true,
      placeholder: 'Hint',
      ariaLabel: 'Editor',
      autoSize: { minRows: 2, maxRows: 4 },
      className: 'outer',
      classNames: { content: 'semantic' },
      styles: { content: { color: 'red' } },
    }),
  );
  assert.match(html, /sd-rich-text-editor-disabled/);
  assert.match(html, /sd-rich-text-editor-readonly/);
  assert.match(html, /role="textbox"/);
  assert.match(html, /aria-label="Editor"/);
  assert.match(html, /contentEditable="false"/);
  assert.match(html, /min-height:2lh;max-height:4lh;overflow-y:auto;color:red/);
  assert.match(html, /Hint/);
  assert.doesNotMatch(html, /historyDelay=|autoSize=|onReady=|\sreadonly=/);
});
test('rich editor exports every JsonForm built-in plus tag and custom placeholder content', () => {
  assert.equal(RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES.length, 26);
  assert.equal(RICH_TEXT_EDITOR_BUILT_IN_NODE_NAMES.length, 27);
  assert.equal(new Set(RICH_TEXT_EDITOR_BUILT_IN_NODE_NAMES).size, 27);
  const html = renderToStaticMarkup(
    h(RichTextEditor, { slots: { placeholder: () => h('b', null, 'Custom hint') } }),
  );
  assert.match(html, /<b>Custom hint<\/b>/);
  assert.match(html, /contentEditable="false"/);
});
test('rich editor standalone styles include actual embedded controls and the shared editor theme', async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: fileURLToPath(new URL('..', import.meta.url)),
    build: {
      write: false,
      minify: false,
      cssMinify: false,
      lib: {
        entry: fileURLToPath(new URL('./fixtures/rich-text-editor-style.ts', import.meta.url)),
        formats: ['es'],
      },
    },
  });
  const css = (Array.isArray(result) ? result : [result])
    .flatMap((item) => ('output' in item ? item.output : []))
    .filter((item) => item.type === 'asset' && item.fileName.endsWith('.css'))
    .map((item) => (item.type === 'asset' ? String(item.source) : ''))
    .join('\n');
  for (const selector of [
    'sd-rich-text-editor',
    'sd-rich-text-editor-text-bold',
    'sd-rich-text-editor-component-stretch',
    'sd-input-wrapper',
    'sd-tag',
    'sd-checkbox',
    'sd-picker-container',
  ])
    assert.ok(css.includes(`.${selector}`), `Missing ${selector}`);
});
