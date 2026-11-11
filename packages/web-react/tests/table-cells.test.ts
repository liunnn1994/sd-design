import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { Tbody, Thead, Tr } from '../dist/table/row.js';
import { Td } from '../dist/table/td.js';
import { Th } from '../dist/table/th.js';

test('Table cell views render row groups and accessible sort controls during SSR', () => {
  const html = render(
    h(
      Thead,
      { component: 'section' },
      h(
        Tr,
        null,
        h(Th, {
          column: {
            title: 'Name',
            dataIndex: 'name',
            sortable: { sortDirections: ['ascend', 'descend'] },
          },
        }),
      ),
    ),
  );
  assert.match(html, /<section[^>]*role="rowgroup"/);
  assert.match(html, /role="row"/);
  assert.match(html, /aria-sort="none"/);
  assert.match(html, /role="button" tabindex="0"/);
  assert.match(html, /Name/);
});

test('Table body views resolve nested values and retain checked-row and summary span classes in SSR', () => {
  const html = render(
    h(
      Tbody,
      null,
      h(
        Tr,
        { checked: true },
        h(Td, {
          record: { key: 1, raw: { profile: { name: 'Ada' } } },
          column: { dataIndex: 'profile.name' },
          colSpan: 2,
        }),
      ),
    ),
  );
  assert.match(html, /sd-table-tr-checked/);
  assert.match(html, /role="cell"/);
  assert.match(html, /grid-column:span 2/);
  assert.match(html, />Ada<\/span>/);
});
