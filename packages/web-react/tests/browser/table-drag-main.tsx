import { mapRawTableData } from '@sdata/web-core/table/data';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { TableData } from '../../src/table/types.js';

import { Table } from '../../src/table/table.js';
import '../../styles/table.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [data, setData] = useState<TableData[]>(() => {
    const rows: TableData[] = Array.from({ length: query.has('virtual') ? 200 : 6 }, (_, key) => ({
      key,
      name: `Row ${key}`,
    }));
    if (query.has('nested'))
      rows[0]!.children = [
        { key: 'a', name: 'Child A' },
        { key: 'b', name: 'Child B' },
      ];
    return rows;
  });
  const [mounted, setMounted] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [count, setCount] = useState(0);
  const [result, setResult] = useState('');
  useEffect(() => {
    const unmount = () => setMounted(false);
    const disable = () => setEnabled(false);
    window.addEventListener('table-unmount', unmount);
    window.addEventListener('table-disable', disable);
    return () => {
      window.removeEventListener('table-unmount', unmount);
      window.removeEventListener('table-disable', disable);
    };
  }, []);
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Toggle mount</button>
      <output data-testid="count">{count}</output>
      <output data-testid="result">{result}</output>
      {mounted && (
        <Table
          data={data}
          columns={[{ dataIndex: 'name', title: 'Name' }]}
          draggable={enabled ? {} : undefined}
          pagination={query.has('page') ? { defaultCurrent: 2, defaultPageSize: 2 } : false}
          defaultExpandAllRows={query.has('nested')}
          expandable={
            query.has('details')
              ? {
                  defaultExpandedRowKeys: [0],
                  expandedRowRender: (row) => <span>Details {row.key}</span>,
                }
              : undefined
          }
          virtualListProps={
            query.has('virtual') ? { height: 240, itemSize: 40, fixedSize: true } : undefined
          }
          onChange={(page, extra, all) => {
            setCount((n) => n + 1);
            setResult(
              JSON.stringify({
                type: extra.type,
                target: extra.dragTarget?.key,
                page: page.map((row) => row.key),
                all: all.map((row) => row.key),
                children: page[0]?.children?.map((row) => row.key),
              }),
            );
            if (!query.has('readonly')) setData(mapRawTableData(all));
          }}
        />
      )}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
