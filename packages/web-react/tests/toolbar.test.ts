import { Toolbar as RootToolbar } from '@sdata/web-react';
import ToolbarDefault, { Toolbar } from '@sdata/web-react/toolbar';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

test('Toolbar public entries share identity and SSR renders schema-driven actions', () => {
  assert.equal(RootToolbar, Toolbar);
  assert.equal(ToolbarDefault, Toolbar);
  const html = render(
    h(Toolbar, {
      defaultValue: { name: 'Ada' },
      schemas: [{ field: 'name', type: 'input', label: 'Name', span: 2 }],
      allowExpand: true,
    }),
  );
  assert.match(html, /sd-toolbar-with-border/);
  assert.match(html, /grid-column:span 2/);
  assert.match(html, /value="Ada"/);
  assert.match(html, /--toolbar-body-max-height:32px/);
  assert.match(html, /查询/);
  assert.match(html, /重置/);
});

test('Toolbar SSR preserves manual content and extra action overrides', () => {
  const html = render(
    h(
      Toolbar,
      {
        schemas: [{ field: 'generated', label: 'Generated' }],
        extra: h('b', null, 'Extra'),
        showBorderBottom: false,
      },
      h('p', null, 'Manual'),
    ),
  );
  assert.match(html, /Manual/);
  assert.match(html, /Extra/);
  assert.doesNotMatch(html, /Generated|sd-toolbar-with-border|查询|重置/);
});
