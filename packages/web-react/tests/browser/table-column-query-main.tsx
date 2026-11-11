import type { Sorter } from '@sdata/web-core/table/query';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useTableColumnFilter, useTableColumnSorter } from '../../src/table/use-column-query.js';

function Fixture() {
  const [field, setField] = useState('name');
  const [multiple, setMultiple] = useState(true);
  const [values, setValues] = useState(['initial']);
  const [sorter, setSorter] = useState<Sorter>();
  const [events, setEvents] = useState<string[]>([]);
  const record = (event: string) => setEvents((old) => [...old, event]);
  const filter = useTableColumnFilter(
    { dataIndex: field, filterable: { multiple } },
    {
      filters: { name: values, other: ['other'] },
      onFilterChange: (key, next, event) => {
        record(`filter:${key}:${next.join('|')}:${event.type}`);
        setValues(next);
      },
    },
  );
  const sort = useTableColumnSorter(
    { dataIndex: field, sortable: { sortDirections: ['ascend', 'descend'] } },
    {
      sorter,
      onSorterChange: (key, direction, event) => {
        record(`sort:${key}:${direction}:${event.type}`);
        setSorter(direction ? { field: key, direction } : undefined);
      },
    },
  );
  return (
    <>
      <output data-testid="filter">
        {String(filter.filterPopupVisible)}:{String(filter.isFilterActive)}:
        {String(filter.isMultipleFilter)}:{filter.columnFilterValue.join('|')}
      </output>
      <output data-testid="sort">
        {sort.sortOrder || 'none'}:{sort.nextSortOrder || 'none'}:{String(sort.hasAscendBtn)}:
        {String(sort.hasDescendBtn)}
      </output>
      <output data-testid="events">{events.join(',')}</output>
      <button onClick={(event) => sort.handleClickSorter(event.nativeEvent)}>Sort</button>
      <button onClick={() => filter.handleFilterPopupVisibleChange(true)}>Open filter</button>
      <button onClick={() => filter.handleCheckboxFilterChange(['one', 'two'])}>Checkbox</button>
      <button onClick={() => filter.handleRadioFilterChange('single')}>Radio</button>
      <button onClick={(event) => filter.handleFilterConfirm(event.nativeEvent)}>Confirm</button>
      <button onClick={(event) => filter.handleFilterReset(event.nativeEvent)}>Reset</button>
      <button onClick={() => setMultiple(false)}>Single filter</button>
      <button onClick={() => setValues(['external'])}>External</button>
      <button onClick={() => setField('other')}>Change column</button>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
