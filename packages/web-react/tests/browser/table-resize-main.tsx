import type { CSSProperties } from 'react';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { TableContext } from '../../src/table/context.js';
import { Thead, Tr } from '../../src/table/row.js';
import { Th } from '../../src/table/th.js';
import { useTableColumnResize } from '../../src/table/use-column-resize.js';
import '../../styles/table.scss';

function Header({ onResize }: { onResize(width: number): void }) {
  const elements = useRef<Record<string, HTMLElement>>(Object.create(null));
  const resize = useTableColumnResize(elements.current, (_, width) => onResize(width));
  return (
    <TableContext.Provider
      value={{ resizingColumn: resize.resizingColumn, onThMouseDown: resize.handleThMouseDown }}
    >
      <div
        className="sd-table sd-table-size-large"
        style={
          {
            'width': 500,
            '--sd-table-grid-template': `${resize.columnWidth.name ?? 160}px`,
          } as CSSProperties
        }
      >
        <div
          className="sd-table-element"
          style={{ gridTemplateColumns: `${resize.columnWidth.name ?? 160}px` }}
        >
          <Thead>
            <Tr>
              <Th
                ref={(api) => {
                  const element = api?.getThElement();
                  if (element) elements.current.name = element;
                  else delete elements.current.name;
                }}
                column={{ dataIndex: 'name', title: 'Name' }}
                resizable
              />
            </Tr>
          </Thead>
        </div>
      </div>
    </TableContext.Provider>
  );
}
function Fixture() {
  const [mounted, setMounted] = useState(true);
  const [widths, setWidths] = useState<number[]>([]);
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Toggle header</button>
      <output>{widths.join(',')}</output>
      {mounted && <Header onResize={(width) => setWidths((old) => [...old, width])} />}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
