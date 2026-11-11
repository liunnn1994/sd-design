import type { MenuCollectorOptions } from '@sdata/web-core/menu/collector';
import type { ReactNode } from 'react';

import { useContext, useLayoutEffect, useState } from 'react';

import { MenuCollectorContext, useMenuCollector } from '../../src/menu/use-menu-collector';

function Collector({
  name,
  type,
  itemKey,
  children,
}: {
  name: string;
  type: MenuCollectorOptions['type'];
  itemKey?: string;
  children?: ReactNode;
}) {
  const store = useMenuCollector({ type, key: itemKey });
  return (
    <MenuCollectorContext.Provider value={store.value}>
      <output data-collector={name}>{JSON.stringify(store.data)}</output>
      {children}
    </MenuCollectorContext.Provider>
  );
}

function Item({ itemKey }: { itemKey: string }) {
  const collector = useContext(MenuCollectorContext);
  useLayoutEffect(() => {
    collector?.context.collectMenuItem(itemKey);
    return () => collector?.context.removeMenuItem(itemKey);
  }, [collector, itemKey]);
  return null;
}

export function MenuCollectorFixture() {
  const [leaf, setLeaf] = useState(true);
  const [branch, setBranch] = useState(true);
  const [key, setKey] = useState('branch');
  const [late, setLate] = useState(false);
  return (
    <section data-testid="menu-collector-fixture">
      <button onClick={() => setLeaf(!leaf)}>Toggle collected leaf</button>
      <button onClick={() => setBranch(!branch)}>Toggle collected branch</button>
      <button onClick={() => setKey(key === 'branch' ? 'renamed' : 'branch')}>
        Rename collected branch
      </button>
      <button onClick={() => setLate(!late)}>Toggle late submenu</button>
      <Collector name="root" type="menu">
        {branch && (
          <Collector name="branch" type="subMenu" itemKey={key}>
            <Collector name="popup" type="popupMenu">
              <Collector name="nested" type="subMenu" itemKey="nested">
                {leaf && <Item itemKey="leaf" />}
              </Collector>
              {late && (
                <Collector name="late" type="subMenu" itemKey="late">
                  <Item itemKey="late-leaf" />
                </Collector>
              )}
            </Collector>
          </Collector>
        )}
        <Collector name="isolated" type="menu">
          <Item itemKey="independent" />
        </Collector>
      </Collector>
    </section>
  );
}
