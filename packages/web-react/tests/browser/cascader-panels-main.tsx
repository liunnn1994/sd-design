import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { TagProps } from '../../src/tag/index.js';

import { CascaderColumn } from '../../src/cascader/column.js';
import { CascaderContext } from '../../src/cascader/context.js';
import { CascaderSearchPanel } from '../../src/cascader/search-panel.js';
import { useCascaderOptions } from '../../src/cascader/use-options.js';
import { useCascaderSelectedPath } from '../../src/cascader/use-selected-path.js';
import { useCascaderSelection } from '../../src/cascader/use-selection.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import '../../../web-core/styles/cascader/style/index.scss';
import '../../styles/checkbox.scss';
import '../../styles/radio.scss';
import '../../styles/ellipsis.scss';
import '../../styles/scrollbar.scss';
import '../../styles/empty.scss';
import '../../styles/spin.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const search = query.has('search');
  const virtual = query.has('virtual');
  const [count, setCount] = useState(virtual ? 500 : 2);
  const [loading, setLoading] = useState(false);
  const [local, setLocal] = useState(false);
  const [global, setGlobal] = useState(false);
  const data = useCascaderOptions<TagProps>({
    options: count
      ? [
          {
            value: 'root',
            label: 'Root',
            children: Array.from({ length: count }, (_, index) => ({
              value: index,
              label: `Item ${index}`,
            })),
          },
        ]
      : [],
  });
  const path = useCascaderSelectedPath({
    ...data,
    filteredOptions: [...data.leafOptionSet],
    expandChild: false,
  });
  const selection = useCascaderSelection({}, { ...data, ...path });
  return (
    <ConfigProvider
      renderEmpty={global ? ({ component }) => <span>Global {component}</span> : undefined}
    >
      <button onClick={() => setCount(0)}>Empty</button>
      <button onClick={() => setCount(3)}>Replace</button>
      <button onClick={() => setLocal(true)}>Local</button>
      <button onClick={() => setGlobal(true)}>Global</button>
      <button onClick={() => setLoading((value) => !value)}>Loading</button>
      <CascaderContext
        value={{
          valueMap: selection.valueMap,
          onClickOption: selection.foundation.click,
          setActiveKey: path.setActiveKey,
          setSelectedPath: path.setSelectedPath,
          loadOption: data.loadOption,
          isLoading: data.isLoading,
          ellipsis: false,
          expandTrigger: 'click',
        }}
      >
        {search ? (
          <CascaderSearchPanel
            data-testid="search"
            options={[...data.leafOptionSet]}
            loading={loading}
            spinProps={{ tip: 'Fetching' }}
            activeKey={path.activeKey}
            pathLabel
            empty={local ? 'Local empty' : undefined}
          />
        ) : (
          <div className="sd-cascader-panel" data-testid="panel">
            {path.displayColumns.map((column, level) => (
              <CascaderColumn
                key={level}
                column={column}
                level={level}
                totalLevel={data.totalLevel}
                selectedPath={path.selectedPath}
                activeKey={path.activeKey}
                empty={local ? 'Local empty' : undefined}
                virtualListProps={
                  virtual
                    ? { height: 160, itemSize: 36, fixedSize: true, keyField: 'key' }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </CascaderContext>
      <output data-testid="value">{JSON.stringify(selection.value)}</output>
    </ConfigProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
