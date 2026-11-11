import { createCascaderKeyboard } from '@sdata/web-core/cascader/keyboard';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useCascaderOptions } from '../../src/cascader/use-options.js';
import { useCascaderSelectedPath } from '../../src/cascader/use-selected-path.js';
import { useCascaderSelection } from '../../src/cascader/use-selection.js';

function Fixture() {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState(false);
  const [strict, setStrict] = useState(false);
  const [prevented, setPrevented] = useState(false);
  const data = useCascaderOptions({
    checkStrictly: strict,
    options: [
      { value: 'locked', disabled: true },
      {
        value: 'root',
        children: [{ value: 'disabled', disabled: true }, { value: 'one' }, { value: 'two' }],
      },
      { value: 'last' },
    ],
  });
  const path = useCascaderSelectedPath({
    ...data,
    filteredOptions: [...data.leafOptionSet],
    showSearchPanel: search,
    expandChild: false,
  });
  const selection = useCascaderSelection(
    { multiple: true, checkStrictly: strict },
    { ...data, ...path },
  );
  const keydown = createCascaderKeyboard({
    getPopupVisible: () => visible,
    getActiveOption: () => path.activeOption,
    getCheckStrictly: () => strict,
    getValues: () => selection.valueMap,
    getSearchPanel: () => search,
    next: path.getNextActiveNode,
    load: data.loadOption,
    select: selection.foundation.click,
    setSelectedPath: path.setSelectedPath,
    setActiveKey: path.setActiveKey,
    setPopupVisible: setVisible,
  });
  return (
    <>
      <input
        aria-label="Keyboard"
        onKeyDown={(event) => {
          keydown(event.key, event);
          setPrevented(event.defaultPrevented);
        }}
      />
      <button onClick={() => setSearch(true)}>Search</button>
      <button onClick={() => setStrict(true)}>Strict</button>
      <button onClick={() => path.setActiveKey('locked')}>Locked</button>
      <output data-testid="active">{path.activeKey}</output>
      <output data-testid="value">{JSON.stringify(selection.value)}</output>
      <output data-testid="visible">{String(visible)}</output>
      <output data-testid="prevented">{String(prevented)}</output>
      <output data-testid="columns">{path.displayColumns.length}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
