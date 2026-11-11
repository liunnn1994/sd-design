import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Tabs, TabPane, ConfigProvider } from '../dist/index.js';
import TabsDefault from '../dist/tabs/index.js';

test('Tabs preserves numeric keys, compound exports, ARIA pairs and lazy SSR panels', () => {
  assert.equal(Tabs, TabsDefault);
  assert.equal(Tabs.TabPane, TabPane);
  const html = renderToStaticMarkup(
    h(
      Tabs,
      { activeKey: 0, lazyLoad: true },
      h(TabPane, { paneKey: 0, title: 'Number' }, 'Number panel'),
      h(TabPane, { paneKey: '0', title: 'String' }, 'String panel'),
    ),
  );
  assert.match(html, /role="tablist"/);
  assert.match(html, /-number-0-tab/);
  assert.match(html, /-string-0-panel/);
  assert.match(html, /Number panel/);
  assert.doesNotMatch(html, /String panel/);
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
  assert.match(html, /aria-hidden="true"[^>]*inert=""/);
});

test('Tabs reads raw React keys through fragments and projects inherited size and RTL layout', () => {
  const html = renderToStaticMarkup(
    h(
      ConfigProvider,
      { size: 'small', rtl: true },
      h(
        Tabs,
        {
          defaultActiveKey: 'two',
          direction: 'vertical',
          position: 'bottom',
          type: 'capsule',
          justify: true,
          fullHeight: true,
          scrollbar: false,
        },
        h(
          Fragment,
          null,
          h(TabPane, { key: 'one', title: 'One' }, 'First'),
          h(TabPane, { key: 'two', title: 'Two' }, 'Second'),
        ),
      ),
    ),
  );
  assert.match(html, /sd-tabs-vertical sd-tabs-left sd-tabs-type-capsule sd-tabs-size-small/);
  assert.match(html, /sd-tabs-justify sd-tabs-full-height sd-tabs-rtl/);
  assert.match(html, /translateX\(100%\)/);
  assert.match(html, /aria-orientation="vertical"/);
  assert.doesNotMatch(html, /sd-tabs-pane-scroll/);
});

test('Tabs keeps non-lazy inactive content mounted on initial render and supports extra content', () => {
  const html = renderToStaticMarkup(
    h(
      Tabs,
      { destroyOnHide: true, extra: h('button', null, 'Extra') },
      h(TabPane, { paneKey: 'a', title: 'Alpha' }, 'Alpha body'),
      h(TabPane, { paneKey: 'b', title: 'Beta', disabled: true }, 'Beta body'),
    ),
  );
  assert.match(html, /Alpha body/);
  assert.match(html, /Beta body/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /Extra/);
});
