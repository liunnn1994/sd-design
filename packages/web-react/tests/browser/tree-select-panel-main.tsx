import type { TreeNodeKey } from '@sdata/web-core/tree/types';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { TreeSelectPanel } from '../../src/tree-select/panel.js';
import '../../styles/tree-select.scss';
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [keys, setKeys] = useState<TreeNodeKey[]>([]);
  return (
    <>
      <div className="sd-tree-select-popup" style={{ width: 300 }}>
        <TreeSelectPanel
          selectedKeys={keys}
          showCheckable={query.has('check')}
          onChange={query.has('controlled') ? undefined : setKeys}
          treeProps={{
            data: [
              {
                key: 0,
                title: 'Root',
                children: [
                  { key: 'one', title: 'One' },
                  { key: 'locked', title: 'Locked', disabled: true },
                ],
              },
            ],
            checkable: query.has('check'),
            defaultExpandAll: !query.has('collapsed'),
            virtualListProps: query.has('virtual') ? { height: 180, itemSize: 32 } : undefined,
          }}
        />
      </div>
      <output>{JSON.stringify(keys)}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
