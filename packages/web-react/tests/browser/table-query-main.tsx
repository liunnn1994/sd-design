import type { QueryColumn } from '@sdata/web-core/table/query';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useTablePagination } from '../../src/table/use-pagination.js';
import { useTableFilter, useTableSorter } from '../../src/table/use-query.js';

function Fixture() {
  const [controlled, setControlled] = useState(
    new URLSearchParams(location.search).has('controlled'),
  );
  const [defaults, setDefaults] = useState('initial');
  const [events, setEvents] = useState<string[]>([]);
  const record = (value: string) => setEvents((old) => [...old, value]);
  const columns: QueryColumn[] = [
    {
      dataIndex: 'first',
      filterable: { defaultFilteredValue: [defaults], filteredValue: controlled ? [] : undefined },
      sortable: {
        defaultSortOrder: defaults === 'initial' ? 'ascend' : 'descend',
        sortOrder: controlled ? '' : undefined,
      },
    },
    {
      dataIndex: 'second',
      filterable: { defaultFilteredValue: ['keep'] },
      sortable: { sortOrder: controlled ? 'descend' : undefined },
    },
  ];
  const filters = useTableFilter(columns, (field, values) =>
    record(`filter:${field}:${values.join('|')}`),
  );
  const sorter = useTableSorter(columns, (field, direction) =>
    record(`sort:${field}:${direction}`),
  );
  const page = useTablePagination({
    pagination: {
      defaultCurrent: 2,
      defaultPageSize: 5,
      current: controlled ? 7 : undefined,
      pageSize: controlled ? 20 : undefined,
    },
    onPageChange: (value) => record(`page:${value}`),
    onPageSizeChange: (value) => record(`size:${value}`),
  });
  return (
    <>
      <output data-testid="filters">{JSON.stringify(filters.filters)}</output>
      <output data-testid="sorter">{JSON.stringify(sorter.sorter) || 'none'}</output>
      <output data-testid="page">
        {page.page}:{page.pageSize}
      </output>
      <output data-testid="events">{events.join(',')}</output>
      <button
        onClick={() => {
          filters.setFilters({ first: ['edited'], second: ['retained'] });
          sorter.setSorter({ field: 'first', direction: 'descend' });
        }}
      >
        Edit
      </button>
      <button onClick={() => filters.resetFilters('first')}>Reset first</button>
      <button onClick={() => filters.clearFilters()}>Clear filters</button>
      <button onClick={() => sorter.resetSorters()}>Reset sorters</button>
      <button onClick={() => sorter.clearSorters()}>Clear sorters</button>
      <button onClick={() => setDefaults('changed')}>Change defaults</button>
      <button onClick={() => setControlled(!controlled)}>Toggle controlled</button>
      <button onClick={() => page.handlePageChange(3)}>Page</button>
      <button onClick={() => page.handlePageSizeChange(15)}>Size</button>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
