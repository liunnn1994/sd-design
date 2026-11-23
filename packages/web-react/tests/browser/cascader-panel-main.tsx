import type { CascaderModelValue, CascaderOption } from '@sdata/web-core/cascader/types';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { TagProps } from '../../src/tag/index.js';

import { CascaderPanel } from '../../src/cascader/panel.js';
import '../../../web-core/styles/cascader/style/index.scss';
import '../../styles/checkbox.scss';
import '../../styles/radio.scss';
import '../../styles/ellipsis.scss';
import '../../styles/scrollbar.scss';
import '../../styles/empty.scss';
import '../../styles/spin.scss';

const options: CascaderOption<TagProps>[] = [
  {
    value: 'root',
    label: 'Root',
    children: [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' },
    ],
  },
  { value: 'last', label: 'Last' },
];
const lazyOptions: CascaderOption<TagProps>[] = [{ value: 'lazy', label: 'Lazy', isLeaf: false }];
function Fixture() {
  const query = new URLSearchParams(location.search);
  const failure = query.get('failure');
  const attempts = useRef(0);
  const [value, setValue] = useState<CascaderModelValue>(
    query.has('controlled') ? 'one' : undefined,
  );
  const [accept, setAccept] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [hover, setHover] = useState(false);
  const [mounted, setMounted] = useState(true);
  return (
    <>
      <button onClick={() => setAccept(true)}>Accept</button>
      <button onClick={() => setValue(undefined)}>Release</button>
      <button onClick={() => setHover(true)}>Hover</button>
      <button onClick={() => setMounted(false)}>Unmount</button>
      {mounted && (
        <CascaderPanel
          data-testid="panel"
          tabIndex={0}
          options={query.has('lazy') ? lazyOptions : options}
          loadMore={
            query.has('lazy')
              ? (_, done) => {
                  if (attempts.current++ === 0) {
                    if (failure === 'throw') throw new Error('Load failed');
                    if (failure === 'reject') return Promise.reject(new Error('Load failed'));
                  }
                  setTimeout(() => done([{ value: 'loaded', label: 'Loaded', isLeaf: true }]), 100);
                }
              : undefined
          }
          value={value}
          multiple={query.has('multiple')}
          pathMode={query.has('path')}
          checkStrictly={query.has('strict')}
          ellipsis={false}
          expandTrigger={hover ? 'hover' : 'click'}
          onValueChange={(next) => {
            setEvents((items) => [...items, `update:${JSON.stringify(next)}`]);
            if (accept) setValue(next);
          }}
          onChange={(next) => setEvents((items) => [...items, `change:${JSON.stringify(next)}`])}
        />
      )}
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
