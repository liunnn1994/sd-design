import type { CSSProperties } from 'react';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { TableDataWithRaw, TableOperationColumn } from '../../src/table/types.js';

import { TableContext } from '../../src/table/context.js';
import { OperationTd, OperationTh } from '../../src/table/operation.js';
import { Tr } from '../../src/table/row.js';
import { useTableRowSelection } from '../../src/table/use-row-selection.js';
import '../../styles/table.scss';

const parent: TableDataWithRaw = {
  key: 'parent',
  raw: { key: 'parent' },
  isLeaf: false,
  children: [
    { key: 1, raw: { key: 1 }, isLeaf: true },
    { key: 2, raw: { key: 2 }, isLeaf: true, disabled: true },
  ],
};
function Fixture() {
  const [radio, setRadio] = useState(false);
  const [custom, setCustom] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const selection = useTableRowSelection({
    defaultSelectedKeys: ['off-page'],
    currentAllRowKeys: ['parent', 1, 2],
    currentAllEnabledRowKeys: [1],
    rowSelection: { type: radio ? 'radio' : 'checkbox' },
  });
  const operations: TableOperationColumn[] = [
    {
      name: radio ? 'selection-radio' : 'selection-checkbox',
      title: 'Rows',
      width: 50,
      fixed: true,
      isLastLeftFixed: true,
      render: custom ? (record) => <strong>Custom:{String(record.key)}</strong> : undefined,
    },
    { name: 'expand', width: 40, fixed: true },
    { name: 'drag-handle', width: 40 },
  ];
  return (
    <>
      <button onClick={() => setRadio(!radio)}>Radio</button>
      <button onClick={() => setCustom(!custom)}>Custom</button>
      <output>
        {JSON.stringify(selection.selectedRowKeys)}:{clicks}:{String(expanded)}
      </output>
      <TableContext.Provider
        value={{
          currentSelectedRowKeys: selection.currentSelectedRowKeys,
          currentAllEnabledRowKeys: [1],
          checkStrictly: false,
          onSelectAll: selection.handleSelectAll,
          onSelect: selection.handleSelect,
          onSelectAllLeafs: selection.handleSelectAllLeafs,
        }}
      >
        <div
          className="sd-table sd-table-size-large"
          style={{ 'width': 300, '--sd-table-grid-template': '50px 40px 40px' } as CSSProperties}
        >
          <div className="sd-table-element" style={{ gridTemplateColumns: '50px 40px 40px' }}>
            <Tr>
              <OperationTh
                operationColumn={operations[0]!}
                operations={operations}
                selectAll={!radio}
              />
            </Tr>
            <Tr onClick={() => setClicks((n) => n + 1)} data-testid="parent">
              {operations.map((operation) => (
                <OperationTd
                  key={operation.name}
                  operationColumn={operation}
                  operations={operations}
                  record={parent}
                  selectedRowKeys={selection.selectedRowKeys}
                  hasExpand
                  renderExpandBtn={() => (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpanded(!expanded);
                      }}
                    >
                      Expand
                    </button>
                  )}
                  dragHandleIcon={<span>Drag</span>}
                />
              ))}
            </Tr>
            <Tr data-testid="disabled">
              <OperationTd
                operationColumn={operations[0]!}
                operations={operations}
                record={parent.children![1]!}
                selectedRowKeys={selection.selectedRowKeys}
              />
            </Tr>
            <Tr data-testid="summary">
              <OperationTd
                operationColumn={operations[0]!}
                operations={operations}
                record={parent}
                selectedRowKeys={selection.selectedRowKeys}
                summary
                rowSpan={2}
              />
            </Tr>
          </div>
        </div>
      </TableContext.Provider>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
