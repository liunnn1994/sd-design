import type { CascaderOption } from '@sdata/web-core/cascader/types';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useCascaderOptions } from '../../src/cascader/use-options.js';

function Fixture() {
  const mode = new URLSearchParams(location.search).get('mode');
  const [options, setOptions] = useState<CascaderOption[]>(
    mode === 'fields'
      ? [
          {
            code: { id: 'root' },
            text: 'Root',
            nodes: [{ code: { id: 'child' }, text: 'Child', blocked: true }],
          },
        ]
      : mode === 'paths'
        ? [
            { value: 'a-b', children: [{ value: 'c' }] },
            { value: 'a', children: [{ value: 'b-c' }] },
            { value: 'a%2Db', children: [{ value: 'c' }] },
          ]
        : [{ value: 'branch', isLeaf: false }],
  );
  const [strict, setStrict] = useState(false);
  const [enabled, setEnabled] = useState(mode !== 'paths' && mode !== 'fields');
  const [calls, setCalls] = useState(0);
  const [version, setVersion] = useState(0);
  const callbacks = useRef<((children?: CascaderOption[]) => void)[]>([]);
  const data = useCascaderOptions({
    options,
    checkStrictly: strict,
    valueKey: 'id',
    fieldNames:
      mode === 'fields'
        ? { value: 'code', label: 'text', children: 'nodes', disabled: 'blocked' }
        : undefined,
    loadMore: enabled
      ? (_option, done) => {
          callbacks.current.push(done);
          setCalls((count) => count + 1);
        }
      : undefined,
  });
  return (
    <>
      <button onClick={() => setStrict(!strict)}>Strict</button>
      <button onClick={() => setEnabled(!enabled)}>Loader</button>
      <button onClick={() => data.loadOption(data.options[0]!)}>Load</button>
      <button
        onClick={() =>
          callbacks.current.shift()?.([{ value: 'child', label: 'Loaded', isLeaf: true }])
        }
      >
        Complete
      </button>
      <button
        onClick={() => setOptions([{ value: 'branch', label: 'Replacement', isLeaf: false }])}
      >
        Replace
      </button>
      <button onClick={() => setOptions([])}>Remove</button>
      <button
        onClick={() => {
          options[0]!.children = [{ value: 'direct', isLeaf: true }];
          setVersion(version + 1);
        }}
      >
        Mutate
      </button>
      <output data-testid="calls">{calls}</output>
      <output data-testid="keys">{[...data.optionMap.keys()].join(',')}</output>
      <output data-testid="leaves">{[...data.leafOptionMap.keys()].join(',')}</output>
      <output data-testid="depth">{data.totalLevel}</output>
      <output data-testid="loading">
        {String(data.options[0] ? data.isLoading(data.options[0]) : false)}
      </output>
      <output data-testid="nodes">
        {JSON.stringify(
          [...data.optionMap.values()].map((node) => ({
            key: node.key,
            label: node.label,
            disabled: node.disabled,
            selectionDisabled: node.selectionDisabled,
            pathValue: node.pathValue,
          })),
        )}
      </output>
      <output data-testid="values">{JSON.stringify([...data.leafOptionValueMap])}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
