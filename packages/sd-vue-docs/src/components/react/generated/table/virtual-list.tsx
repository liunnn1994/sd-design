/** @jsxImportSource react */
import type {
  TableColumnData,
  TableData,
  TableExpandable,
  TableInstance,
  TableRowSelection,
} from '@sdata/web-react';

import { Button, Radio, RadioGroup, Table } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [mode, setMode] = useState<'estimated' | 'fixed' | 'dynamic'>('estimated');
  const [tableHeight, setTableHeight] = useState<280 | 360 | 480>(360);
  const [stickyHeader, setStickyHeader] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const tableRef = useRef<ComponentRef<typeof Table> | null>(null);
  const toolbarRowClass = 'sd:mb-3 sd:flex sd:flex-wrap sd:items-center sd:gap-3';
  const quickActionClass = 'sd:mb-3 sd:flex sd:flex-wrap sd:gap-2';
  const checkClass =
    'sd:inline-flex sd:items-center sd:gap-2 sd:text-[13px] sd:text-[var(--color-text-2)]';
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'name', fixed: 'left', width: 160 },
    { title: '地址', dataIndex: 'address', width: 260 },
    { title: '邮箱', dataIndex: 'email', width: 280 },
    { title: '备注', dataIndex: 'note', width: 320 },
  ];
  const [data, setData] = useState<TableData[]>(
    Array(1200)
      .fill(null)
      .map((_, index) => ({
        key: String(index + 1),
        name: `用户 ${index + 1}`,
        address: `${index + 1} Park Road, London`,
        email: `user.${index + 1}@example.com`,
        note:
          index % 4 === 0
            ? '这是一条更长的备注，用来观察表格在虚拟滚动、固定列和横向滚动并存时的表现。'
            : '普通备注',
        expand: `展开内容 ${index + 1}：用于确认展开行在虚拟模式下仍能正确显示。`,
      })),
  );
  const rowSelection: TableRowSelection = { type: 'checkbox', showCheckedAll: true };
  const expandable: TableExpandable = { title: '展开', width: 88 };
  const helperText = (() => {
    if (mode === 'estimated') {
      return 'estimatedSize 适合常规表格场景：给出一个接近真实行高的估值，例如 44，可让首次滚动和定位更平滑。';
    }
    if (mode === 'fixed') {
      return 'itemSize 适合所有行高完全一致的表格。这里固定为 48px，可以最直接地观察滚动定位与性能。';
    }
    return 'minItemSize 适合可能出现展开内容或更长文本的场景。这里设置为 56px，它允许行高增长，同时保留共享 VirtualList 的滚动能力。';
  })();
  const virtualListProps = (() => {
    if (mode === 'estimated') {
      return { height: tableHeight, estimatedSize: 44, buffer: 20 };
    }
    if (mode === 'fixed') {
      return { height: tableHeight, itemSize: 48, fixedSize: true, buffer: 20 };
    }
    return { height: tableHeight, minItemSize: 56, estimatedSize: 56, buffer: 20 };
  })();
  const scrollTableToRow = async (row: number) => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    tableRef.current?.scrollIntoView({ index: Math.max(row - 1, 0), align: 'top' });
  };
  const expandAndScrollToRow = async (row: number) => {
    setExpandedKeys([String(row)]);
    await scrollTableToRow(row);
  };

  return (
    <>
      <div>
        <div className={toolbarRowClass}>
          <RadioGroup
            value={mode}
            onValueChange={(next) => setMode(next as typeof mode)}
            type={'button'}
          >
            <Radio value={'estimated'}>{'estimatedSize'}</Radio>
            <Radio value={'fixed'}>{'itemSize'}</Radio>
            <Radio value={'dynamic'}>{'minItemSize'}</Radio>
          </RadioGroup>
          <RadioGroup
            value={tableHeight}
            onValueChange={(next) => setTableHeight(next as typeof tableHeight)}
            type={'button'}
          >
            <Radio value={280}>{'高 280'}</Radio>
            <Radio value={360}>{'高 360'}</Radio>
            <Radio value={480}>{'高 480'}</Radio>
          </RadioGroup>
        </div>
        <div className={toolbarRowClass}>
          <label className={checkClass}>
            <input
              checked={stickyHeader}
              onChange={(event) => setStickyHeader(event.currentTarget.checked)}
              type={'checkbox'}
            />
            <span>{'开启 sticky header'}</span>
          </label>
        </div>
        <div className={'sd:mb-3 sd:text-[var(--color-text-2)] sd:text-xs sd:leading-[1.6]'}>
          {formatValue(helperText)}
        </div>
        <div className={quickActionClass}>
          <Button
            size={'small'}
            onClick={() => {
              scrollTableToRow(1);
            }}
          >
            {'顶部'}
          </Button>
          <Button
            size={'small'}
            onClick={() => {
              scrollTableToRow(48);
            }}
          >
            {'第 48 行'}
          </Button>
          <Button
            size={'small'}
            onClick={() => {
              scrollTableToRow(240);
            }}
          >
            {'第 240 行'}
          </Button>
          <Button
            size={'small'}
            onClick={() => {
              expandAndScrollToRow(48);
            }}
          >
            {'展开第 48 行'}
          </Button>
        </div>
        <div>
          <Table
            ref={tableRef}
            columns={columns}
            data={data}
            rowSelection={rowSelection}
            expandable={expandable}
            expandedKeys={expandedKeys}
            onExpandedKeysChange={(next) => setExpandedKeys(next as typeof expandedKeys)}
            virtualListProps={virtualListProps}
            pagination={false}
            scrollbar={true}
            stickyHeader={stickyHeader ? 0 : false}
            scroll={{ x: 1120, y: tableHeight }}
          />
        </div>
      </div>
    </>
  );
}
