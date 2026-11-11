import { useRef, useState } from 'react';

import {
  ConfigProvider,
  Tabs,
  TabPane,
  type ScrollPosition,
  type TabKey,
  type TabsPosition,
  type TabsType,
} from '../../src/index';

function CacheBody({ name, value }: { name: string; value: number }) {
  const [count, setCount] = useState(0);
  return (
    <div data-testid={`tabs-cache-${name}`}>
      <span>
        {name}:{value}:{count}
      </span>
      <button onClick={() => setCount(count + 1)}>Count {name}</button>
    </div>
  );
}
function WrappedPane({ id }: { id: string }) {
  return (
    <TabPane paneKey={id} title={`Wrapped ${id}`}>
      {id === 'w1' ? (
        <Tabs>
          <TabPane paneKey="nested" title="Nested tab">
            Nested panel
          </TabPane>
        </Tabs>
      ) : (
        id
      )}
    </TabPane>
  );
}
export function TabsFixture() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [controlled, setControlled] = useState<TabKey>(0);
  const [allow, setAllow] = useState(false);
  const [editable, setEditable] = useState(['e1', 'e2']);
  const next = useRef(3);
  const [cacheValue, setCacheValue] = useState(0);
  const [cacheScroll, setCacheScroll] = useState(false);
  const [wrapped, setWrapped] = useState(['w1', 'w2']);
  const [rtl, setRtl] = useState(false);
  const [wide, setWide] = useState(false);
  const [vertical, setVertical] = useState(false);
  const [position, setPosition] = useState<TabsPosition>('top');
  const [type, setType] = useState<TabsType>('capsule');
  const [customScroll, setCustomScroll] = useState(true);
  const [alignment, setAlignment] = useState<ScrollPosition>('auto');
  const [compact, setCompact] = useState(false);
  const log = (value: string) => setEvents((old) => [...old, value]);
  return (
    <section>
      <button onClick={() => setMounted(!mounted)}>
        {mounted ? 'Unmount Tabs' : 'Mount Tabs'}
      </button>
      <output data-testid="tabs-events">{events.join('|')}</output>
      {mounted && (
        <ConfigProvider rtl={rtl}>
          <button onClick={() => setEvents([])}>Clear Tabs events</button>
          <button onClick={() => setAllow(true)}>Allow Tabs writeback</button>
          <button onClick={() => setCacheValue(cacheValue + 1)}>Update hidden Tabs content</button>
          <button onClick={() => setCacheScroll(!cacheScroll)}>Toggle cached Tabs scrolling</button>
          <button onClick={() => setWrapped([...wrapped].reverse())}>Reverse wrapped Tabs</button>
          <button
            onClick={() =>
              setWrapped((value) =>
                value.includes('w3') ? value.filter((id) => id !== 'w3') : [...value, 'w3'],
              )
            }
          >
            Toggle wrapped Tabs
          </button>
          <button onClick={() => setRtl(!rtl)}>Toggle Tabs RTL</button>
          <button onClick={() => setWide(!wide)}>Resize Tabs navigation</button>
          <button onClick={() => setVertical(!vertical)}>Toggle vertical Tabs</button>
          <button onClick={() => setCustomScroll(!customScroll)}>Toggle Tabs scrollbar</button>
          <button onClick={() => setCompact(!compact)}>Toggle Tabs header and content</button>
          <select
            aria-label="Tabs alignment"
            value={alignment}
            onChange={(event) =>
              setAlignment(
                event.target.value === '24' ? 24 : (event.target.value as ScrollPosition),
              )
            }
          >
            {['auto', 'start', 'center', 'end', '24'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Tabs position"
            value={position}
            onChange={(event) => setPosition(event.target.value as TabsPosition)}
          >
            {['top', 'bottom', 'left', 'right'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Tabs type"
            value={type}
            onChange={(event) => setType(event.target.value as TabsType)}
          >
            {['line', 'card', 'card-gutter', 'text', 'rounded', 'capsule'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <Tabs
            data-testid="tabs-basic"
            defaultActiveKey={0}
            onActiveKeyChange={(key) => log(`update:${typeof key}:${key}`)}
            onChange={(key) => log(`change:${typeof key}:${key}`)}
            onTabClick={(key) => log(`click:${typeof key}:${key}`)}
            extra={<button onClick={() => log('extra')}>Tabs extra</button>}
          >
            <TabPane paneKey={0} title="Basic zero">
              Basic panel zero
            </TabPane>
            <TabPane paneKey={1} title="Basic disabled" disabled>
              Disabled panel
            </TabPane>
            <TabPane paneKey={2} title="Basic two">
              Basic panel two
            </TabPane>
            <TabPane paneKey={3} title="Basic three">
              Basic panel three
            </TabPane>
          </Tabs>
          <Tabs
            data-testid="tabs-controlled"
            activeKey={controlled}
            onActiveKeyChange={(key) => {
              log(`request:${typeof key}:${key}`);
              if (allow) setControlled(key);
            }}
          >
            <TabPane paneKey={0} title="Controlled number">
              Number panel
            </TabPane>
            <TabPane paneKey="0" title="Controlled string">
              String panel
            </TabPane>
          </Tabs>
          <Tabs
            data-testid="tabs-edit"
            editable
            showAddButton
            autoSwitch
            onAdd={() => {
              const id = `e${next.current++}`;
              setEditable((value) => [...value, id]);
            }}
            onDelete={(key) => {
              log(`delete:${key}`);
              setEditable((value) => value.filter((id) => id !== key));
            }}
          >
            {editable.map((id) => (
              <TabPane key={id} title={`Editable ${id}`} closable={id !== 'e2'}>
                {id}
              </TabPane>
            ))}
          </Tabs>
          <Tabs data-testid="tabs-cache" fullHeight={cacheScroll} style={{ height: 180 }}>
            <TabPane paneKey="a" title="Cache A">
              <CacheBody name="a" value={cacheValue} />
            </TabPane>
            <TabPane paneKey="b" title="Cache B">
              <CacheBody name="b" value={cacheValue} />
            </TabPane>
          </Tabs>
          <Tabs data-testid="tabs-lazy" lazyLoad destroyOnHide>
            <TabPane paneKey="a" title="Lazy A">
              <input aria-label="Lazy input A" />
            </TabPane>
            <TabPane paneKey="b" title="Lazy B">
              <input aria-label="Lazy input B" />
            </TabPane>
          </Tabs>
          <Tabs data-testid="tabs-wrapped">
            {wrapped.map((id) => (
              <WrappedPane key={id} id={id} />
            ))}
          </Tabs>
          <Tabs
            data-testid="tabs-overflow"
            style={{ width: wide ? 2000 : 300, height: 240 }}
            direction={vertical ? 'vertical' : 'horizontal'}
            scrollPosition={alignment}
          >
            {Array.from({ length: 9 }, (_, id) => (
              <TabPane key={id} paneKey={id} title={`Overflow tab ${id} extended`}>
                {id}
              </TabPane>
            ))}
          </Tabs>
          <Tabs
            data-testid="tabs-style"
            type={type}
            position={position}
            animation
            fullHeight
            scrollbar={customScroll}
            headerPadding={!compact}
            hideContent={compact}
            justify={compact}
            style={{ height: 220, width: 340 }}
          >
            <TabPane paneKey="short" title="Short">
              <div style={{ height: 500 }}>Long scrollable panel</div>
            </TabPane>
            <TabPane paneKey="long" title="A substantially longer title">
              Second styled panel
            </TabPane>
          </Tabs>
          <Tabs data-testid="tabs-hover" trigger="hover">
            <TabPane paneKey="a" title="Hover A">
              Hover panel A
            </TabPane>
            <TabPane paneKey="b" title="Hover B">
              Hover panel B
            </TabPane>
          </Tabs>
        </ConfigProvider>
      )}
    </section>
  );
}
