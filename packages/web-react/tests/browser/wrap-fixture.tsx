import { useRef, useState } from 'react';

import type { WrapClampExposed } from '../../src/clamp/index';

import { WrapClamp } from '../../src/clamp/index';

const initialItems = Array.from({ length: 12 }, (_, id) => ({ id, label: `Item ${id + 1}` }));
export function WrapFixture() {
  const [items, setItems] = useState(initialItems);
  const [wide, setWide] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [requests, setRequests] = useState(0);
  const [clamped, setClamped] = useState(false);
  const ref = useRef<WrapClampExposed>(null);
  return (
    <section>
      <WrapClamp
        data-testid="wrap"
        ref={ref}
        items={items}
        itemKey="id"
        maxLines={2}
        expanded={expanded}
        onExpandedChange={setExpanded}
        onClampChange={setClamped}
        style={{ width: wide ? 460 : 220 }}
        renderItem={({ item }) => (
          <span style={{ display: 'inline-block', width: 60, height: 24 }}>{item.label}</span>
        )}
        after={({ expanded, hiddenItems, toggle }) => (
          <button type="button" onClick={toggle} style={{ height: 24 }}>
            {expanded ? '折叠项目' : `还有 ${hiddenItems.length} 项`}
          </button>
        )}
      />
      <output data-testid="wrap-clamped">{String(clamped)}</output>
      <button onClick={() => setWide(!wide)}>改变项目宽度</button>
      <button onClick={() => setItems(items.length > 2 ? initialItems.slice(0, 2) : initialItems)}>
        改变项目数量
      </button>
      <button onClick={() => ref.current?.expand()}>展开所有项目</button>
      <button onClick={() => setItems([...items].reverse())}>反转项目顺序</button>
      <button onClick={() => ref.current?.collapse()}>收起所有项目</button>
      <WrapClamp
        data-testid="wrap-controlled"
        items={initialItems}
        itemKey={(item) => item.id}
        maxHeight={48}
        expanded={false}
        onExpandedChange={() => setRequests(requests + 1)}
        style={{ width: 180 }}
        renderItem={({ item }) => (
          <span style={{ display: 'inline-block', width: 60, height: 24 }}>{item.label}</span>
        )}
        after={({ toggle }) => (
          <button type="button" onClick={toggle} style={{ height: 24 }}>
            拒绝展开
          </button>
        )}
      />
      <output data-testid="wrap-requests">{requests}</output>
    </section>
  );
}
