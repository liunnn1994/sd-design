import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useTreeSelectFilter } from '../../src/tree-select/use-filter.js';
import { useTreeSelectInteraction } from '../../src/tree-select/use-interaction.js';
import { useTreeData } from '../../src/tree/use-tree-data.js';
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [events, setEvents] = useState<string[]>([]);
  const record = (value: string) => setEvents((old) => [...old, value]);
  const state = useTreeSelectInteraction(
    {
      allowSearch: true,
      readonly: query.has('readonly'),
      inputValue: query.has('controlled') ? '' : undefined,
      popupVisible: query.has('controlled') ? false : undefined,
      onInputValueChange: (value) => record(`input:${value}`),
      onSearch: (value) => record(`search:${value}`),
      onPopupVisibleChange: (value) => record(`popup:${value}`),
      onShowChange: (value) => record(`show:${value}`),
    },
    { blur: () => record('blur'), showReadonlyTip: () => record('tip') },
  );
  const data = useTreeData({
    fieldNames: { key: 'id', title: 'label' },
    treeData: [
      {
        id: 'root',
        label: 'Root',
        children: [
          { id: 'one', label: 'Alpha' },
          { id: 'two', label: 'Beta' },
        ],
      },
    ],
  });
  const filter = useTreeSelectFilter({
    searchValue: state.inputValue,
    nodes: data.flattenTreeData,
    fieldNames: { key: 'id' },
    disableFilter: query.has('nofilter'),
    filterMethod: query.has('custom') ? (keyword, node) => node.label.includes(keyword) : undefined,
  });
  return (
    <>
      <input
        aria-label="Search"
        value={state.inputValue}
        onChange={(event) => state.foundation.handleInputValueChange(event.target.value)}
      />
      <button onClick={() => state.foundation.setPanelVisible(true)}>Open</button>
      <button onClick={() => state.foundation.setPanelVisible(false)}>Close</button>
      <output data-testid="visible">{String(state.visible)}</output>
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="filtered">
        {JSON.stringify(
          data.flattenTreeData
            .filter((node) => filter.filterTreeNode?.(node.treeNodeData) ?? true)
            .map((node) => node.key),
        )}
      </output>
      <output data-testid="empty">{String(filter.isEmptyFilterResult)}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
