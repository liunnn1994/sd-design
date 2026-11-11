import type { TreeSelectValue } from '@sdata/web-core/tree-select/types';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useTreeSelectSelection } from '../../src/tree-select/use-selection.js';
import { useTreeData } from '../../src/tree/use-tree-data.js';
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [value, setValue] = useState<TreeSelectValue | undefined>(
    query.has('controlled') ? 0 : undefined,
  );
  const [disabled, setDisabled] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [input, setInput] = useState('search');
  const [visible, setVisible] = useState(true);
  const model = useTreeData({
    selectable: true,
    checkable: true,
    treeData: [
      {
        key: 'root',
        title: 'Root',
        children: [
          { key: 0, title: 'Zero' },
          { key: 'two', title: 'Two' },
        ],
      },
    ],
  });
  const record = (name: string) => setEvents((old) => [...old, name]);
  const state = useTreeSelectSelection(
    {
      value,
      defaultValue: query.has('fallback') ? { value: 'missing', label: 'Saved' } : 0,
      multiple: query.has('multiple'),
      labelInValue: query.has('label'),
      showPath: query.has('path'),
      disabled,
      readonly: query.has('readonly'),
      inputValue: input,
      onValueChange: (next) => record(`value:${JSON.stringify(next)}`),
      onChange: (next) => record(`change:${JSON.stringify(next)}`),
      onClear: () => record('clear'),
    },
    {
      nodes: model.key2TreeNode,
      setInputValue: setInput,
      setVisible,
      onFormChange: () => record('form'),
    },
  );
  return (
    <>
      <button onClick={() => state.foundation.select(['two'])}>Select two</button>
      <button onClick={() => state.foundation.select([0, 'two'])}>Select both</button>
      <button onClick={() => state.foundation.remove(0)}>Remove zero</button>
      <button onClick={() => state.foundation.clear()}>Clear</button>
      <button onClick={() => setValue('two')}>External two</button>
      <button onClick={() => setValue(undefined)}>Release</button>
      <button onClick={() => setDisabled(!disabled)}>Disabled</button>
      <output data-testid="keys">{JSON.stringify(state.selectedKeys)}</output>
      <output data-testid="values">{JSON.stringify(state.selectedValues)}</output>
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="input">{input}</output>
      <output data-testid="visible">{String(visible)}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
