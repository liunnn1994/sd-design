import type {
  CascaderOption,
  CascaderOptionInfo,
  CascaderLazyLoadOptions,
} from '@sdata/web-core/cascader/types';

import { DEFAULT_FIELD_NAMES, getOptionInfos } from '@sdata/web-core/cascader/data';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useCascaderLazyLoad } from '../../src/cascader/use-lazy-load.js';
import { useCascaderSelectedPath } from '../../src/cascader/use-selected-path.js';

function State({
  options,
  fail,
  request,
  applied,
}: {
  options: CascaderOption[];
  fail: boolean;
  request(done: (children?: CascaderOption[]) => void): void;
  applied(): void;
}) {
  const [cache, setCache] = useState<CascaderLazyLoadOptions>({});
  const [search, setSearch] = useState(false);
  const [expand, setExpand] = useState(false);
  const optionMap = new Map<string, CascaderOptionInfo>();
  const roots = getOptionInfos(options, {
    optionMap,
    leafOptionMap: new Map(),
    leafOptionSet: new Set(),
    leafOptionValueMap: new Map(),
    totalLevel: { value: 1 },
    checkStrictly: { value: false },
    enabledLazyLoad: true,
    lazyLoadOptions: cache,
    valueKey: { value: 'value' },
    fieldNames: DEFAULT_FIELD_NAMES,
  });
  const path = useCascaderSelectedPath({
    options: roots,
    optionMap,
    filteredOptions: [...optionMap.values()].filter((node) => node.isLeaf),
    showSearchPanel: search,
    expandChild: expand,
  });
  const lazy = useCascaderLazyLoad(
    (_option, done) => {
      if (fail) return Promise.reject(new Error('load rejected'));
      request(done);
    },
    optionMap,
    (children, key) => {
      const source = optionMap.get(key)!.raw;
      setCache((previous) => ({ ...previous, [key]: { source, children } }));
      applied();
    },
  );
  return (
    <>
      <button onClick={() => path.setSelectedPath('a')}>Select A</button>
      <button
        onClick={() => {
          path.setSelectedPath();
          path.setActiveKey();
        }}
      >
        Reset
      </button>
      <button onClick={() => setSearch(!search)}>Search</button>
      <button onClick={() => setExpand(!expand)}>Expand</button>
      <button onClick={() => path.setActiveKey(path.getNextActiveNode('next')?.key)}>Next</button>
      <button onClick={() => path.setActiveKey(path.getNextActiveNode('preview')?.key)}>
        Previous
      </button>
      <button onClick={() => path.setActiveKey('a-two')}>Activate child</button>
      <button onClick={() => lazy.loadOption(optionMap.get('b')!)}>Load</button>
      <button
        onClick={() => {
          lazy.loadOption(optionMap.get('c')!);
          lazy.loadOption(optionMap.get('a-one')!);
        }}
      >
        Load guarded
      </button>
      <output data-testid="loading">{String(lazy.isLoading(optionMap.get('b')!))}</output>
      <output data-testid="columns">
        {path.displayColumns.map((column) => column.map((node) => node.key).join(',')).join('|')}
      </output>
      <output data-testid="path">{path.selectedPath.join(',')}</output>
      <output data-testid="active">{path.activeOption?.key ?? ''}</output>
      <output data-testid="children">
        {optionMap
          .get('b')
          ?.children?.map((node) => node.label)
          .join(',') ?? ''}
      </output>
    </>
  );
}
function Fixture() {
  const [mounted, setMounted] = useState(true);
  const [fail, setFail] = useState(new URLSearchParams(location.search).has('fail'));
  const [requests, setRequests] = useState(0);
  const [applied, setApplied] = useState(0);
  const callbacks = useRef<((children?: CascaderOption[]) => void)[]>([]);
  const [options, setOptions] = useState<CascaderOption[]>([
    {
      value: 'a',
      children: [
        { value: 'one', isLeaf: true, disabled: true },
        { value: 'two', isLeaf: true },
      ],
    },
    { value: 'b', isLeaf: false },
    { value: 'c', disabled: true, isLeaf: false },
  ]);
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Mount</button>
      <button onClick={() => setFail(false)}>Allow load</button>
      <button
        onClick={() =>
          setOptions((items) =>
            items.map((item) =>
              item.value === 'b' ? { value: 'b', label: 'Replacement', isLeaf: false } : item,
            ),
          )
        }
      >
        Replace
      </button>
      <button
        onClick={() =>
          callbacks.current.shift()?.([{ value: 'loaded', label: 'Loaded', isLeaf: true }])
        }
      >
        Complete oldest
      </button>
      <output data-testid="requests">{requests}</output>
      <output data-testid="applied">{applied}</output>
      {mounted && (
        <State
          options={options}
          fail={fail}
          request={(done) => {
            callbacks.current.push(done);
            setRequests((value) => value + 1);
          }}
          applied={() => setApplied((value) => value + 1)}
        />
      )}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
