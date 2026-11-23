import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { CascaderModelValue, CascaderOption } from '../../src/cascader/index.js';

import { Cascader } from '../../src/cascader/index.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import '../../styles/cascader.scss';

const normal: CascaderOption[] = [
  {
    value: 'root',
    label: 'Root',
    children: [
      { value: 'one', label: 'One', code: 'A' },
      { value: 'two', label: 'Two', code: 'B' },
    ],
  },
];
const mapped: CascaderOption[] = [
  {
    id: { key: 'r' },
    name: 'Mapped root',
    nodes: [{ id: { key: 'child' }, name: 'Mapped child' }],
  },
];
const large: CascaderOption[] = [
  {
    value: 'root',
    label: 'Root',
    children: Array.from({ length: 500 }, (_, index) => ({ value: index, label: `Item ${index}` })),
  },
];
const flat = Array.from({ length: 100 }, (_, value) => ({ value, label: `Option ${value}` }));
const virtualList = { height: 160, itemSize: 36, fixedSize: true };
function Fixture() {
  const query = new URLSearchParams(location.search);
  const failure = query.get('failure');
  const [value, setValue] = useState<CascaderModelValue>(undefined);
  const [source, setSource] = useState<CascaderOption[]>([
    { value: 'root', label: 'Old root', isLeaf: false },
  ]);
  const [mounted, setMounted] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [virtualEnabled, setVirtualEnabled] = useState(false);
  const [separator, setSeparator] = useState(' / ');
  const [readonly, setReadonly] = useState(false);
  const requests = useRef<((children?: CascaderOption[]) => void)[]>([]);
  const [calls, setCalls] = useState(0);
  return (
    <ConfigProvider virtualListProps={query.has('virtual') ? virtualList : undefined}>
      <button onClick={() => setSource([{ value: 'root', label: 'New root', isLeaf: false }])}>
        Replace source
      </button>
      <button
        onClick={() => requests.current[0]?.([{ value: 'old', label: 'Old child', isLeaf: true }])}
      >
        Resolve old
      </button>
      <button
        onClick={() => requests.current[1]?.([{ value: 'new', label: 'New child', isLeaf: true }])}
      >
        Resolve new
      </button>
      <button onClick={() => setMounted(false)}>Unmount</button>
      <button onClick={() => setDisabled(true)}>Disable</button>
      <button onClick={() => setVirtualEnabled(!virtualEnabled)}>Toggle virtualization</button>
      <button onClick={() => setSeparator(' > ')}>Change separator</button>
      <button onClick={() => setReadonly(!readonly)}>Toggle readonly</button>
      {mounted && (
        <Cascader
          options={
            query.has('mapped')
              ? mapped
              : query.has('virtual')
                ? large
                : query.has('virtual-toggle')
                  ? flat
                  : query.has('lazy')
                    ? source
                    : normal
          }
          value={value}
          onValueChange={setValue}
          disabled={disabled}
          readonly={readonly}
          separator={separator}
          {...(query.has('virtual-toggle')
            ? { virtualListProps: virtualEnabled ? virtualList : undefined }
            : {})}
          allowSearch
          allowClear
          pathMode={query.has('mapped')}
          fieldNames={
            query.has('mapped') ? { value: 'id', label: 'name', children: 'nodes' } : undefined
          }
          valueKey={query.has('mapped') ? 'key' : undefined}
          filterOption={query.has('filter') ? (input, raw) => raw.code === input : undefined}
          searchOptionOnlyLabel={query.has('filter')}
          loadMore={
            query.has('lazy')
              ? (_, done) => {
                  requests.current.push(done);
                  setCalls(requests.current.length);
                  if (requests.current.length === 1) {
                    if (failure === 'throw') throw new Error('Load failed');
                    if (failure === 'reject') return Promise.reject(new Error('Load failed'));
                  }
                }
              : undefined
          }
          popupContainer="#popup-host"
          triggerProps={query.has('updates') ? { clickOutsideToClose: false } : undefined}
          style={{ width: 260 }}
          inputAttrs={{ 'aria-label': 'Data choice' }}
        />
      )}
      <div id="popup-host" />
      <output data-testid="value">{JSON.stringify(value)}</output>
      <output data-testid="calls">{calls}</output>
    </ConfigProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
