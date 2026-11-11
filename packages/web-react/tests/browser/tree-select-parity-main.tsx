import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Cascader, ConfigProvider, TreeSelect, type TreeSelectProps } from '../../src/index.js';
import '../../styles/cascader.scss';
import '../../styles/tree-select.scss';
import '../../styles/config-provider.scss';

const options = [
  {
    key: 'root',
    title: 'Root',
    children: [{ key: 'leaf', title: 'A long team label '.repeat(12) }],
  },
];

function Fixture() {
  const [ellipsis, setEllipsis] = useState<TreeSelectProps['ellipsis']>();
  const [nested, setNested] = useState<TreeSelectProps['ellipsis']>();
  const [local, setLocal] = useState(false);
  const [specific, setSpecific] = useState(true);
  const [providerTip, setProviderTip] = useState('provider');
  const query = new URLSearchParams(location.search);
  const loading = query.has('loading');
  return (
    <>
      <button onClick={() => setEllipsis(false)}>Plain</button>
      <button onClick={() => setEllipsis(true)}>Ellipsis</button>
      <button onClick={() => setEllipsis('performant-ellipsis')}>Performant</button>
      <button onClick={() => setEllipsis(undefined)}>Default</button>
      <button onClick={() => setNested(false)}>Nested plain</button>
      <button onClick={() => setNested(true)}>Nested ellipsis</button>
      <button onClick={() => setLocal(!local)}>Local spin</button>
      <button onClick={() => setSpecific(!specific)}>Specific spin</button>
      <button onClick={() => setProviderTip('updated')}>Update provider</button>
      <ConfigProvider
        spinProps={{ tip: 'global', size: 11 }}
        cascaderSpinProps={specific ? { tip: `cascader ${providerTip}`, size: 23 } : undefined}
        treeSelectSpinProps={specific ? { tip: `tree ${providerTip}`, size: 29 } : undefined}
      >
        <div style={{ display: 'flex', gap: 160, marginTop: 30 }}>
          <TreeSelect
            style={{ width: 220 }}
            popupVisible
            loading={loading}
            data={options}
            ellipsis={ellipsis}
            treeProps={{ ellipsis: nested, defaultExpandAll: true }}
            spinProps={local ? { tip: 'tree local', dot: true } : undefined}
          />
          {loading && (
            <Cascader
              style={{ width: 220 }}
              popupVisible
              loading
              allowSearch
              inputValue={query.has('columns') ? '' : 'team'}
              options={[]}
              spinProps={local ? { tip: 'cascader local', dot: true } : undefined}
            />
          )}
        </div>
      </ConfigProvider>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
