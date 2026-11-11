import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build } from 'vite';

import Sender, { SenderHeader, SenderSwitch, RecorderCore } from '../dist/sender/index.js';

test('Sender publishes compound components and a server-safe recorder SDK', () => {
  assert.equal(Sender.Header, SenderHeader);
  assert.equal(Sender.Switch, SenderSwitch);
  assert.equal(typeof RecorderCore, 'function');
  assert.equal(typeof RecorderCore.Support, 'function');
  const html = renderToStaticMarkup(
    h(Sender, {
      defaultValue: 'Draft',
      disabled: true,
      classNames: { content: 'semantic' },
      styles: { root: { color: 'red' } },
    }),
  );
  assert.match(html, /Draft/);
  assert.match(html, /sd-sender-disabled/);
  assert.match(html, /semantic/);
  assert.match(html, /color:red/);
  assert.doesNotMatch(html, /allowSpeech=|slotConfig=|showActions=|autoSize=/);
});
test('Sender Header honors initial visibility and Switch honors controlled presence', () => {
  assert.equal(renderToStaticMarkup(h(SenderHeader, { title: 'Hidden' })), '');
  const hidden = renderToStaticMarkup(h(SenderHeader, { forceRender: true, title: 'Hidden' }));
  assert.match(hidden, /display:none/);
  assert.match(
    renderToStaticMarkup(h(SenderSwitch, { defaultValue: true }, 'On')),
    /sd-sender-switch-checked/,
  );
  assert.doesNotMatch(
    renderToStaticMarkup(h(SenderSwitch, { value: undefined, defaultValue: true }, 'Off')),
    /sd-sender-switch-checked/,
  );
});
test('Sender independent style entry includes editor, textarea, actions and voice glow', async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: fileURLToPath(new URL('..', import.meta.url)),
    build: {
      write: false,
      minify: false,
      cssMinify: false,
      lib: {
        entry: fileURLToPath(new URL('./fixtures/sender-style.ts', import.meta.url)),
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
    'sd-sender-main',
    'sd-sender-header',
    'sd-sender-switch',
    'sd-sender-skill-tag',
    'sd-rich-text-editor',
    'sd-textarea',
    'sd-btn',
    'sd-voice-glow',
  ])
    assert.ok(css.includes(`.${selector}`), `Missing ${selector}`);
});
