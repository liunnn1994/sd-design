import { ThemeProvider as RootThemeProvider, ConfigProvider } from '@sdata/web-react';
import { ThemeProvider } from '@sdata/web-react/theme-provider';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

test('ThemeProvider public entries support custom tags, prefixes and native attributes in SSR', () => {
  assert.equal(RootThemeProvider, ThemeProvider);
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'brand' },
      h(
        ThemeProvider,
        {
          'tag': 'section',
          'themeMode': 'dark',
          'className': 'custom',
          'id': 'theme',
          'aria-label': 'Local',
        },
        'Content',
      ),
    ),
  );
  assert.match(html, /<section/);
  assert.match(html, /class="brand-theme-provider custom"/);
  assert.match(html, /id="theme"/);
  assert.match(html, /aria-label="Local"/);
  assert.match(html, /Content<\/section>/);
});

test('ThemeProvider omits its wrapper for plain and global modes', () => {
  for (const props of [{}, { global: true, themeMode: 'dark' as const }]) {
    assert.equal(
      render(h(ThemeProvider, { ...props, tag: 'section', id: 'unused' }, 'Content')),
      'Content',
    );
  }
});
