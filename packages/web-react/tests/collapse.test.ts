import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Collapse, CollapseItem } from '../dist/index.js';

test('Collapse supports fragment string keys and lazy destruction in SSR', () => {
  const html = renderToStaticMarkup(
    h(
      Collapse,
      { defaultActiveKey: ['first'], destroyOnHide: true },
      h(
        Fragment,
        {},
        h(CollapseItem, { key: 'first', header: 'First' }, 'Visible'),
        h(CollapseItem, { key: 'second', header: 'Second' }, 'Hidden'),
      ),
    ),
  );
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /Visible/);
  assert.doesNotMatch(html, /Hidden/);
  assert.match(html, /role="region" aria-labelledby=/);
});
test('Collapse preserves numeric itemKey and provider icon precedence', () => {
  const html = renderToStaticMarkup(
    h(
      Collapse,
      { activeKey: [0], showExpandIcon: false },
      h(CollapseItem, { itemKey: 0, showExpandIcon: true, header: 'Zero' }, 'Content'),
    ),
  );
  assert.match(html, /sd-collapse-item-active/);
  assert.match(html, /sd-collapse-item-no-icon/);
  assert.doesNotMatch(html, /<svg/);
});
