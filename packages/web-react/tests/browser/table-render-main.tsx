import { StrictMode, useCallback, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Table } from '../../src/table/index.js';
import '../../styles/table.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [custom, setCustom] = useState(true);
  const [tick, setTick] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const [snapshot, setSnapshot] = useState('');
  const lifecycle = useRef<string[]>([]);
  const header = useRef<HTMLElement | null>(null);
  const record = (name: string) => setEvents((old) => [...old, name]);
  const captureHeader = useCallback((element: HTMLElement | null) => {
    header.current = element;
    if (element) {
      lifecycle.current.push(`mount:${element.tagName}`);
      return () => {
        lifecycle.current.push('cleanup');
        header.current = null;
      };
    }
  }, []);
  const manual = (
    <>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Manual heading</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>Manual content</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </>
  );
  const manualMode = query.has('manual') || query.has('implicit');
  return (
    <>
      <button onClick={() => setCustom(!custom)}>Toggle custom</button>
      <button onClick={() => setTick((n) => n + 1)}>Rerender</button>
      <button
        onClick={() =>
          setSnapshot(`${header.current?.tagName ?? 'none'}:${lifecycle.current.join('|')}`)
        }
      >
        Inspect refs
      </button>
      <output data-testid="events">{events.join(',')}</output>
      <output data-testid="refs">{snapshot}</output>
      <output>{tick}</output>
      <Table
        data={[
          { key: 1, name: 'Ada', age: 30 },
          { key: 2, name: 'Lin', age: 40 },
        ]}
        pagination={manualMode ? true : false}
        loading={manualMode}
        columnResizable
        showHeader={!manualMode}
        footer={manualMode ? 'Manual footer' : undefined}
        columns={[
          {
            dataIndex: 'name',
            title: 'Name',
            width: 180,
            bodyCellStyle: { color: 'rgb(1, 2, 3)' },
          },
          { dataIndex: 'age', title: 'Age', width: 100 },
        ]}
        renderThead={
          custom ? () => <section data-testid="custom-head" className="custom-head" /> : undefined
        }
        renderTbody={custom ? () => <article data-testid="custom-body" /> : undefined}
        renderTr={
          custom
            ? ({ record: row, rowIndex }) => (
                <section
                  className="custom-row"
                  data-row={String(row?.key)}
                  data-index={rowIndex}
                  onClick={() => record('custom-row')}
                />
              )
            : undefined
        }
        renderTh={
          custom
            ? ({ column }) => (
                <article
                  className="custom-th"
                  data-column={column.dataIndex}
                  ref={column.dataIndex === 'name' ? captureHeader : undefined}
                  style={{ backgroundColor: 'rgb(4, 5, 6)' }}
                />
              )
            : undefined
        }
        renderTd={
          custom
            ? ({ record: row, column, rowIndex }) => (
                <article
                  className="custom-td"
                  data-cell={`${row.key}:${column.dataIndex}:${rowIndex}`}
                  onClick={() => record('custom-cell')}
                  style={{ borderTopWidth: 7, color: 'rgb(9, 9, 9)' }}
                />
              )
            : undefined
        }
        onCellClick={() => record('cell')}
        onRowClick={() => record('row')}
        renderContent={query.has('manual') && custom ? () => manual : undefined}
      >
        {query.has('implicit') && custom ? manual : undefined}
      </Table>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
