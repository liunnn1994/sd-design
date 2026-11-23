import { useState } from 'react';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { Pagination } from '../../src/pagination/index.js';
export function PaginationFixture() {
  const [current, setCurrent] = useState(3);
  const [total, setTotal] = useState(100);
  const [size, setSize] = useState(10);
  const [disabled, setDisabled] = useState(false);
  const [simple, setSimple] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const log = (text: string) => setEvents((old) => [...old, text]);
  return (
    <section data-testid="pagination-fixture">
      <Pagination
        data-testid="pager"
        total={total}
        defaultCurrent={3}
        showTotal
        showPageSize
        pageSizeProps={{ disabled: false, allowClear: true }}
        showJumper
        showMore
        disabled={disabled}
        simple={simple}
        onCurrentChange={(next) => log(`update:${next}`)}
        onChange={(next) => log(`change:${next}`)}
        onPageSizeValueChange={(next) => log(`size-update:${next}`)}
        onPageSizeChange={(next) => log(`size:${next}`)}
      />
      <Pagination
        data-testid="pager-controlled"
        total={total}
        current={current}
        pageSize={size}
        showPageSize
        showJumper
        onChange={(next) => log(`rejected:${next}`)}
        onPageSizeChange={(next) => log(`size-rejected:${next}`)}
      />
      <ConfigProvider
        size="small"
        pagination={{
          defaultPageSize: 20,
          showTotal: true,
          showJumper: true,
          showPageSize: true,
          pageSizeOptions: [20, 50],
          bufferSize: 1,
        }}
      >
        <Pagination
          data-testid="pager-provider"
          total={200}
          renderTotal={({ total }) => `Rows ${total}`}
          renderPageItem={({ page }) => `P${page}`}
          renderPageItemStep={({ type }) => type}
          pageItemEllipsis="More"
          jumperPrepend="Jump"
          jumperAppend="page"
        />
        <Pagination
          data-testid="pager-optout"
          total={200}
          showTotal={false}
          showJumper={false}
          showPageSize={false}
          defaultPageSize={10}
        />
      </ConfigProvider>
      <Pagination
        data-testid="pager-accepted"
        total={100}
        current={current}
        onCurrentChange={setCurrent}
        pageSize={size}
        onPageSizeValueChange={setSize}
        showPageSize
        pageSizeOptions={[5, 10, 20]}
        onChange={(next) => log(`accepted:${next}`)}
      />
      <ConfigProvider pagination={{ autoAdjust: false }}>
        <Pagination
          data-testid="pager-no-adjust"
          total={total}
          defaultCurrent={8}
          showPageSize
          pageSizeOptions={[5, 10, 20]}
        />
      </ConfigProvider>
      <Pagination
        data-testid="pager-empty"
        total={0}
        showJumper
        onChange={(next) => log(`empty:${next}`)}
      />
      <Pagination data-testid="pager-hidden" total={8} hideOnSinglePage />
      <button onClick={() => setDisabled((value) => !value)}>Pagination disabled</button>
      <button onClick={() => setSimple((value) => !value)}>Pagination simple</button>
      <button onClick={() => setTotal(15)}>Pagination shrink</button>
      <button onClick={() => setCurrent(7)}>Pagination external current</button>
      <button onClick={() => setSize(20)}>Pagination external size</button>
      <output data-testid="pager-events">{events.join('|')}</output>
    </section>
  );
}
