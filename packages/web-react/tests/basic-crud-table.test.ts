import { BasicCrudTable as RootBasicCrudTable } from '@sdata/web-react';
import BasicCrudTableDefault, { BasicCrudTable } from '@sdata/web-react/basic-crud-table';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

test('BasicCrudTable public entries share identity and SSR renders integrated rows and toolbar', () => {
  assert.equal(RootBasicCrudTable, BasicCrudTable);
  assert.equal(BasicCrudTableDefault, BasicCrudTable);
  const html = render(
    h(BasicCrudTable, {
      title: 'People',
      className: 'consumer-crud',
      style: { maxWidth: 900 },
      columns: [{ title: 'Name', dataIndex: 'name' }],
      defaultTableData: [{ key: 1, name: 'Ada' }],
      fetchTableOnMounted: false,
      tableProps: { pagination: false },
      toolbarProps: { schemas: [{ field: 'q', type: 'input', label: 'Query' }] },
    }),
  );
  assert.match(html, /sd-basic-crud-table-header/);
  assert.match(
    html,
    /<section[^>]*class="sd-basic-crud-table consumer-crud"[^>]*style="max-width:900px"/,
  );
  assert.match(html, /People/);
  assert.match(html, /Ada/);
  assert.match(html, /请输入Query/);
  assert.match(html, /新建/);
  assert.match(html, /编辑/);
  assert.match(html, /删除/);
});

test('BasicCrudTable SSR honors independent header/action/full-height switches', () => {
  const html = render(
    h(BasicCrudTable, {
      columns: [{ title: 'Name', dataIndex: 'name' }],
      defaultTableData: [{ key: 1, name: 'Ada' }],
      tableProps: { pagination: false },
      fullHeight: true,
      showHeader: false,
      showActionColumn: false,
    }),
  );
  assert.match(html, /sd-basic-crud-table-full-height/);
  assert.doesNotMatch(html, /sd-basic-crud-table-header|新建|编辑|删除/);
  assert.match(html, /Ada/);
});
