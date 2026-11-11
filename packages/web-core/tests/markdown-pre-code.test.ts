import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getMarkdownPreCodeStyles,
  getMarkdownPreHeader,
  getMarkdownPreTheme,
  writeMarkdownCodeClipboard,
} from '../dist/markdown/pre-code.js';
test('pre styles keep option defaults, line-number padding and reserved diff dimensions', () => {
  const base = getMarkdownPreCodeStyles({ showLineNumbers: true });
  assert.equal(base.pre.fontSize, '12px');
  assert.equal(base.pre.paddingLeft, 'var(--markstream-code-padding-left)');
  assert.equal(base.pre.whiteSpace, 'pre-wrap');
  const configured = getMarkdownPreCodeStyles({
    codeBlockOptions: { fontSize: 16, padding: 0, overflow: 'scroll' },
    reservedHeightPx: 123.2,
    diff: true,
  });
  assert.equal(configured.pre.lineHeight, '24px');
  assert.equal(configured.pre.paddingLeft, '0px');
  assert.equal(configured.pre.height, '124px');
  assert.equal(configured.pre.whiteSpace, 'pre');
  assert.equal(getMarkdownPreCodeStyles({ reservedHeightPx: 123 }).pre.height, undefined);
});
test('pre theme precedence and fenced filename titles follow the native renderer', () => {
  assert.equal(getMarkdownPreTheme({ isDark: true }).name, 'vitesse-dark');
  assert.equal(
    getMarkdownPreTheme({ isDark: true, theme: { dark: 'custom-light' }, darkTheme: 'ignored' })
      .background,
    'var(--markstream-code-theme-bg, #ffffff)',
  );
  assert.equal(
    getMarkdownPreTheme({ lightTheme: 'vitesse-light', themes: ['vitesse-dark', 'github-light'] })
      .background,
    '#ffffff',
  );
  assert.deepEqual(getMarkdownPreHeader('```diff ts file:/src/main.ts\ntext', 'TypeScript', true), {
    title: '/src/main.ts',
    caption: 'Diff / TypeScript',
  });
  assert.deepEqual(getMarkdownPreHeader('```typescript\ntext', 'TypeScript'), {
    title: 'TypeScript',
    caption: '',
  });
});
test('clipboard writes await overrides and propagate failures without browser globals', async () => {
  let seen = '';
  await writeMarkdownCodeClipboard('raw\n', async (text) => {
    seen = text;
  });
  assert.equal(seen, 'raw\n');
  await assert.rejects(
    writeMarkdownCodeClipboard('text', () => {
      throw new Error('Rejected');
    }),
    /Rejected/,
  );
  await assert.rejects(writeMarkdownCodeClipboard('text'), /Clipboard API is unavailable/);
});
