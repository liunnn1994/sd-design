import type { TreeNodeKey } from '@sdata/web-core/tree/types';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useTreeCheckedState } from '../../src/tree/use-checked-state.js';
import { useTreeData } from '../../src/tree/use-tree-data.js';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const [controlled, setControlled] = useState<TreeNodeKey[] | undefined>(
    query.has('controlled') ? ['one'] : undefined,
  );
  const [strict, setStrict] = useState(query.has('strict'));
  const [onlyLeaf, setOnlyLeaf] = useState(false);
  const [extended, setExtended] = useState(false);
  const [half, setHalf] = useState<TreeNodeKey[] | undefined>(
    query.has('half') ? ['external-half'] : undefined,
  );
  const [, rerender] = useState(0);
  const data = useTreeData({
    checkable: true,
    treeData: [
      {
        key: 'root',
        children: [
          { key: 'one' },
          { key: 'two' },
          { key: 'locked', disabled: true },
          ...(extended ? [{ key: 'three' }] : []),
        ],
      },
    ],
  });
  const state = useTreeCheckedState({
    defaultCheckedKeys: query.has('parent') ? ['root'] : ['one'],
    checkedKeys: controlled,
    halfCheckedKeys: half,
    key2TreeNode: data.key2TreeNode,
    checkStrictly: strict,
    onlyCheckLeaf: onlyLeaf,
  });
  return (
    <>
      <button onClick={() => rerender((value) => value + 1)}>Rerender</button>
      <button onClick={() => state.setCheckedState(['two'], ['root'])}>Local two</button>
      <button onClick={() => setControlled(['two'])}>External two</button>
      <button onClick={() => setControlled([])}>External empty</button>
      <button onClick={() => setControlled(undefined)}>Release</button>
      <button onClick={() => state.setCheckedState(['root'], [], true)}>Reinitialize parent</button>
      <button onClick={() => setControlled(['root'])}>Control parent</button>
      <button onClick={() => setStrict(true)}>Strict</button>
      <button onClick={() => setOnlyLeaf(true)}>Only leaf</button>
      <button onClick={() => setExtended(true)}>Extend</button>
      <button onClick={() => setHalf(['updated-half'])}>Update half</button>
      <output data-testid="checked">{JSON.stringify(state.checkedKeys)}</output>
      <output data-testid="half">{JSON.stringify(state.indeterminateKeys)}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
