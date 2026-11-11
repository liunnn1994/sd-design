import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { TableColumnData, TableData, TableInstance } from '../../src/table/types.js';

import { Table } from '../../src/table/table.js';
import '../../styles/table.scss';

const rows: TableData[] = Array.from({ length: 200 }, (_, key) => ({
  key,
  name: `Row ${key}`,
  score: key,
  text: `Content ${key}`,
}));
rows[0]!.children = [{ key: 'child', name: 'Child row', score: 5, text: 'Nested content' }];
const columns: TableColumnData[] = [
  { dataIndex: 'name', title: 'Name', width: 120, fixed: 'left' },
  { dataIndex: 'text', title: 'Content', width: 760 },
  { dataIndex: 'score', title: 'Score', width: 120, fixed: 'right' },
];
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [empty, setEmpty] = useState(false);
  const [header, setHeader] = useState(true);
  const api = useRef<TableInstance>(null);
  return (
    <>
      <button onClick={() => api.current?.scrollIntoView({ index: 199, align: 'bottom' })}>
        Last row
      </button>
      <button onClick={() => api.current?.scrollIntoView({ key: 150, align: 'top' })}>
        Key 150
      </button>
      <button onClick={() => api.current?.scrollIntoView({ index: 0, align: 'top' })}>
        First row
      </button>
      <button onClick={() => setEmpty(!empty)}>Toggle empty</button>
      <button onClick={() => setHeader(!header)}>Toggle header</button>
      <div style={{ width: 540 }}>
        <Table
          ref={api}
          data={empty ? [] : rows}
          columns={columns}
          pagination={false}
          rowSelection={{ showCheckedAll: true }}
          summary
          virtualListProps={
            query.has('normal') ? undefined : { height: 220, itemSize: 48, buffer: 100 }
          }
          scroll={{ x: 1040, y: 220 }}
          stickyHeader={query.has('sticky') ? 12 : false}
          scrollbar={!query.has('native')}
          showHeader={header}
        />
      </div>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
