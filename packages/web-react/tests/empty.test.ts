import enUS from '@sdata/web-core/locale/lang/en-us';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Empty, ConfigProvider, addI18nMessages, useLocale, getLocale } from '../dist/index.js';

test('empty uses provider language and explicit descriptions', () => {
  const html = renderToStaticMarkup(
    createElement(ConfigProvider, { locale: enUS }, createElement(Empty)),
  );
  assert.ok(html.includes(enUS.empty.description));
  const image = renderToStaticMarkup(
    createElement(Empty, { imgSrc: '/empty.png', description: '没有记录' }),
  );
  assert.match(image, /alt="没有记录"/);
  assert.match(image, /src="\/empty.png"/);
});

test('custom empty is bypassed by explicit content and avoids recursion', () => {
  const renderEmpty = () =>
    createElement(Empty, { inConfigProvider: true, description: '全局空状态' });
  const custom = renderToStaticMarkup(
    createElement(ConfigProvider, { renderEmpty }, createElement(Empty)),
  );
  assert.match(custom, /全局空状态/);
  const explicit = renderToStaticMarkup(
    createElement(ConfigProvider, { renderEmpty }, createElement(Empty, null, '自定义内容')),
  );
  assert.match(explicit, /自定义内容/);
  assert.doesNotMatch(explicit, /全局空状态/);
});

test('global locale registry switches without duplicating language data', () => {
  const original = getLocale();
  try {
    addI18nMessages({ [enUS.locale]: enUS });
    useLocale(enUS.locale);
    assert.ok(renderToStaticMarkup(createElement(Empty)).includes(enUS.empty.description));
  } finally {
    useLocale(original);
  }
});
