import { Icon as RootIcon } from '@sdata/web-react';
import Icons, * as NamedIcons from '@sdata/web-react/icon';
import { iconCatalog } from '@sdata/web-react/icon';
import { Icon, addFromIconFontCn } from '@sdata/web-react/icon-component';
import IconPlus from '@sdata/web-react/icon/icon-plus';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { ConfigProvider } from '../dist/config-provider/index.js';

test('every generated icon has a named export, bundle entry and renderable SVG geometry', async () => {
  assert.equal(Object.keys(Icons).length, iconCatalog.length);
  assert.equal(IconPlus, Icons.IconPlus);
  assert.equal(RootIcon, Icon);
  assert.ok(iconCatalog.length > 250);
  for (const item of iconCatalog) {
    const Component = Icons[item.componentName];
    assert.equal(Component, NamedIcons[item.componentName]);
    const html = render(h(Component, { 'aria-label': item.name, 'size': 20 }));
    const { default: definition } = await import(`@sdata/web-core/icon/icons/${item.name}`);
    assert.match(html, /^<svg /);
    assert.ok(html.includes(`sd-${item.name}`), item.name);
    assert.match(html, /<(path|rect|circle)[ >]/);
    assert.ok(html.includes(`viewBox="${definition.attributes.viewBox}"`), item.name);
    assert.match(html, /stroke-width="4"/);
  }
});

test('generated icons preserve explicit zero sizes, stroke options, rotation and custom prefix', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(Icons.IconPlus, {
        size: 0,
        rotate: 90,
        spin: true,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'arcs',
      }),
    ),
  );
  assert.match(html, /custom-icon custom-icon-plus custom-icon-spin/);
  assert.match(html, /font-size:0px/);
  assert.match(html, /--icon-rotate:90deg/);
  assert.match(html, /stroke-width="2"/);
  assert.match(html, /stroke-linecap="round"/);
  assert.match(html, /stroke-linejoin="arcs"/);
});

test('generic Icon preserves SVG children, native attributes and its distinct spin class', () => {
  const html = render(
    h(
      Icon,
      { size: '2em', rotate: 0, spin: true, type: 'custom-shape', viewBox: '0 0 10 10' },
      h('title', {}, 'Inline title'),
    ),
  );
  assert.match(html, /sd-icon sd-icon-loading custom-shape/);
  assert.match(html, /font-size:2em/);
  assert.doesNotMatch(html, /transform:/);
  assert.match(html, /<title>Inline title<\/title>/);
  assert.match(html, /fill="currentColor"/);
});

test('IconFont config overrides model props while native attributes and classes compose', () => {
  const Font = addFromIconFontCn({
    src: '/server-only-icons.js',
    extraProps: {
      'type': 'configured-class',
      'size': 24,
      'spin': true,
      'className': 'configured',
      'style': { color: 'red' },
      'aria-label': 'configured label',
    },
  });
  assert.equal(Icon.addFromIconFontCn, addFromIconFontCn);
  const html = render(
    h(
      Font,
      { 'type': 'shape-id', 'size': 10, 'className': 'caller', 'aria-label': 'caller label' },
      h('title', {}, 'Ignored slot'),
    ),
  );
  assert.match(html, /configured-class configured caller/);
  assert.match(html, /font-size:24px/);
  assert.match(html, /aria-label="caller label"/);
  assert.match(html, /xlink:href="#shape-id"/);
  assert.doesNotMatch(html, /Ignored slot/);
  const empty = render(h(Font, {}, h('title', {}, 'Fallback')));
  assert.match(empty, /<title>Fallback<\/title>/);
  assert.doesNotMatch(empty, /<use/);
});
