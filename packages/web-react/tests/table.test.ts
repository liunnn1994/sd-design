import { Table as RootTable } from '@sdata/web-react';
import TableDefault, { Table, TableColumn, Tbody, Thead, Tr, Td, Th } from '@sdata/web-react/table';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

test('Table public entries and compound components share identity', () => {
  assert.equal(RootTable, Table);
  assert.equal(TableDefault, Table);
  for (const [name, Component] of Object.entries({ Thead, Tbody, Tr, Td, Th, Column: TableColumn }))
    assert.equal(Table[name as keyof typeof Table], Component);
});
test('Table SSR renders actual rows and default sorting without browser access', () => {
  const html = render(
    h(Table, {
      pagination: false,
      data: [
        { key: 1, name: 'Beta' },
        { key: 2, name: 'Alpha' },
      ],
      columns: [
        {
          dataIndex: 'name',
          title: 'Name',
          sortable: { sortDirections: ['ascend', 'descend'], defaultSortOrder: 'ascend' },
        },
      ],
    }),
  );
  assert.match(html, /role="table"/);
  assert.match(html, /aria-sort="ascending"/);
  assert.ok(html.indexOf('>Alpha<') < html.indexOf('>Beta<'));
  assert.doesNotMatch(html, /sd-pagination/);
});
test('Table SSR reads nested declarative columns and summary configuration', () => {
  const html = render(
    h(
      Table,
      {
        pagination: false,
        data: [
          { key: 1, amount: 2 },
          { key: 2, amount: 3 },
        ],
        summary: true,
      },
      h(
        Table.Column,
        { title: 'Group' },
        h(Table.Column, { dataIndex: 'amount', title: 'Amount' }),
      ),
    ),
  );
  assert.match(html, /Group/);
  assert.match(html, /Amount/);
  assert.match(html, /sd-table-tfoot/);
  assert.match(html, /Summary/);
});
test('Table SSR renders scoped custom roots with merged semantics and generated contents', () => {
  const html = render(
    h(Table, {
      pagination: false,
      data: [{ key: 1, name: 'Ada' }],
      columns: [{ dataIndex: 'name', title: 'Name' }],
      renderThead: () => h('section', { className: 'own-head' }),
      renderTbody: () => h('article'),
      renderTr: ({ record }) => h('section', { 'data-row': String(record?.key) }),
      renderTh: ({ column }) => h('header', { 'data-field': column.dataIndex }),
      renderTd: ({ record }) =>
        h('article', { 'className': 'own-cell', 'data-key': String(record.key) }),
    }),
  );
  assert.match(html, /own-head sd-table-thead/);
  assert.match(html, /data-row="1"/);
  assert.match(html, /data-field="name"/);
  assert.match(html, /own-cell sd-table-td/);
  assert.match(html, />Ada<\/span>/);
});
test('Table SSR manual content bypasses generated data, pagination and loading wrappers', () => {
  const html = render(
    h(Table, {
      data: [{ key: 1, name: 'Generated' }],
      columns: [{ dataIndex: 'name', title: 'Name' }],
      loading: true,
      renderContent: () => h('p', null, 'Manual content'),
      footer: 'Footer',
    }),
  );
  assert.match(html, /Manual content/);
  assert.match(html, /Footer/);
  assert.doesNotMatch(html, /Generated|sd-spin|sd-pagination|--sd-table-grid-template/);
});
test('Table SSR supports compound child views as manual content', () => {
  const html = render(
    h(
      Table,
      { loading: true, data: [{ key: 1, name: 'Generated' }] },
      h(Table.Thead, null, h(Table.Tr, null, h(Table.Th, null, 'Manual heading'))),
      h(Table.Tbody, null, h(Table.Tr, null, h(Table.Td, null, 'Manual row'))),
    ),
  );
  assert.match(html, /Manual heading/);
  assert.match(html, /Manual row/);
  assert.doesNotMatch(html, /Generated|sd-spin|sd-pagination/);
});
