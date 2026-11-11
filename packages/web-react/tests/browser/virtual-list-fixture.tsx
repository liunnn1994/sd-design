import { useRef, useState } from 'react';

import { VirtualList, type VirtualListRef } from '../../src/_shared/virtual-list';

const initial = Array.from({ length: 200 }, (_, key) => ({
  key: `row-${key}`,
  label: `Row ${key}`,
}));
export function VirtualListFixture() {
  const list = useRef<VirtualListRef>(null);
  const [items, setItems] = useState(initial);
  const [horizontal, setHorizontal] = useState(false);
  const [dynamic, setDynamic] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [track, setTrack] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [report, setReport] = useState('');
  const record = (name: string) => setEvents((events) => [...events, name]);
  return (
    <section data-testid="virtual-list-fixture">
      <button onClick={() => list.current?.scrollTo({ key: 'row-90', align: 'top' })}>
        Virtual jump key
      </button>
      <button onClick={() => list.current?.scrollToPosition(180)}>Virtual pixels</button>
      <button onClick={() => list.current?.scrollToBottom()}>Virtual bottom</button>
      <button onClick={() => setHorizontal(!horizontal)}>Virtual axis</button>
      <button onClick={() => setDynamic(!dynamic)}>Virtual dynamic</button>
      <button onClick={() => setItems(items.length ? [] : initial)}>Virtual empty</button>
      <button onClick={() => setItems([...items].reverse())}>Virtual reverse</button>
      <button onClick={() => setTrack(!track)}>Virtual track</button>
      <button onClick={() => setMounted(!mounted)}>Virtual mount</button>
      <button
        onClick={() => {
          const current = list.current;
          if (!current) return;
          const cache = current.cacheSnapshot();
          setReport(
            JSON.stringify({
              cache: Boolean(cache),
              restored: current.restoreCache(cache),
              index: current.findItemIndex(2700),
              offset: current.getItemOffset(90),
              size: current.getItemSize(90),
              dynamic: current.getDynamicItemSize(items[90], 90),
            }),
          );
        }}
      >
        Virtual inspect
      </button>
      <output data-testid="virtual-report">{report}</output>
      <output data-testid="virtual-events">{events.join('|')}</output>
      {mounted && (
        <VirtualList
          ref={list}
          items={items}
          height={120}
          style={{ width: 180 }}
          direction={horizontal ? 'horizontal' : 'vertical'}
          itemSize={dynamic ? undefined : 30}
          fixedSize={!dynamic}
          estimatedSize={40}
          keyField={dynamic ? (item) => item.key : 'key'}
          minItemSize={20}
          listTag="ul"
          itemTag="li"
          listAttrs={{ 'aria-label': 'Virtual rows', 'style': { margin: 0, padding: 0 } }}
          listStyle={{ listStyle: 'none' }}
          listClass={track ? 'track-list' : 'embed-list'}
          itemClass="virtual-row"
          scrollbar={{ type: track ? 'track' : 'embed' }}
          empty={<span>No virtual items</span>}
          onScroll={() => record('scroll')}
          onScrollEnd={() => record('end')}
          onReachBottom={() => record('bottom')}
        >
          {({ item, index, active }) => (
            <div
              data-virtual-index={index}
              data-active={String(active)}
              style={{ width: horizontal ? 30 : undefined, height: dynamic ? 50 : 30 }}
            >
              {item.label}
            </div>
          )}
        </VirtualList>
      )}
    </section>
  );
}
