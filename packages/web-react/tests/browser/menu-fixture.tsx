import { Fragment, useRef, useState, type MouseEvent } from 'react';

import type { MenuItemInstance, MenuSubMenuInstance } from '../../src/menu/index.js';

import { SiderContext } from '../../src/layout';
import { Menu, MenuItem, MenuItemGroup, SubMenu } from '../../src/menu/index.js';

export function MenuFixture() {
  const itemRef = useRef<MenuItemInstance>(null);
  const clickEvent = useRef<MouseEvent<HTMLDivElement>>(null);
  const subMenuRef = useRef<MenuSubMenuInstance>(null);
  const modeRef = useRef<MenuSubMenuInstance>(null);
  const [refStatus, setRefStatus] = useState('');
  const [selected, setSelected] = useState('');
  const [requests, setRequests] = useState('');
  const [writeback, setWriteback] = useState(false);
  const [width, setWidth] = useState(240);
  const [longLabel, setLongLabel] = useState(false);
  const [rail, setRail] = useState(true);
  const [late, setLate] = useState(false);
  const [mode, setMode] = useState<'vertical' | 'pop'>('vertical');
  const [itemEvents, setItemEvents] = useState(0);
  const [initialScroll, setInitialScroll] = useState(false);
  return (
    <section>
      <button
        onClick={() => {
          const item = itemRef.current;
          const sub = subMenuRef.current;
          const modeItem = modeRef.current;
          setRefStatus(
            JSON.stringify({
              itemConnected: item?.isConnected,
              itemMatches: item?.refItemElement === item,
              selected: item?.isSelected,
              level: item?.level,
              contextSelected: item?.menuContext.selectedKeys,
              click: typeof item?.onClick,
              subConnected: sub?.isConnected,
              subKey: sub?.computedKey,
              itemKeys: sub?.menuItemKeys,
              subKeys: sub?.subMenuKeys,
              childSelected: sub?.isChildrenSelected,
              title: sub?.props.title,
              nativeAttribute: sub?.attrs['data-testid' as keyof typeof sub.attrs],
              popup: modeItem?.computedPopup,
              modeConnected: modeItem?.isConnected,
            }),
          );
        }}
      >
        Read menu refs
      </button>
      <button onClick={() => itemRef.current?.click()}>Click menu ref</button>
      <button
        onClick={() => {
          if (clickEvent.current) itemRef.current?.onClick(clickEvent.current);
        }}
      >
        Activate menu ref
      </button>
      <output data-testid="menu-ref-status">{refStatus}</output>
      <output data-testid="menu-selection">{selected}</output>
      <output data-testid="menu-requests">{requests}</output>
      <output data-testid="menu-item-events">{itemEvents}</output>
      <button onClick={() => setWriteback(!writeback)}>Allow menu writeback</button>
      <button onClick={() => setWidth(width === 240 ? 1000 : 240)}>Resize horizontal menu</button>
      <button onClick={() => setLongLabel(!longLabel)}>Resize growing menu item</button>
      <button onClick={() => setRail(!rail)}>Toggle menu rail</button>
      <button onClick={() => setLate(!late)}>Toggle late menu</button>
      <button onClick={() => setMode(mode === 'vertical' ? 'pop' : 'vertical')}>
        Toggle menu mode
      </button>
      <button onClick={() => setInitialScroll(!initialScroll)}>Mount selected menu</button>
      <Menu
        data-testid="menu-basic"
        style={{ width: 260 }}
        accordion
        autoOpenSelected
        defaultSelectedKeys={['nested']}
        onMenuItemClick={setSelected}
        showCollapseButton
        ellipsis
        levelIndent={18}
      >
        <MenuItem
          ref={itemRef}
          itemKey="home"
          icon={<i>H</i>}
          onClick={(event) => {
            clickEvent.current = event;
            setItemEvents((value) => value + 1);
          }}
        >
          Menu Home
        </MenuItem>
        <MenuItem itemKey="disabled" disabled>
          Menu Disabled
        </MenuItem>
        <SubMenu
          ref={subMenuRef}
          data-testid="menu-ref-sub"
          itemKey="first"
          title="Menu First"
          icon={<i>F</i>}
        >
          <MenuItemGroup title="Menu Group">
            <MenuItem itemKey="nested">Menu Nested</MenuItem>
          </MenuItemGroup>
        </SubMenu>
        <SubMenu itemKey="second" title="Menu Second">
          <MenuItem itemKey="other">Menu Other</MenuItem>
        </SubMenu>
      </Menu>
      <Menu
        data-testid="menu-controlled"
        style={{ width: 260 }}
        selectedKeys={writeback ? [selected] : []}
        openKeys={writeback ? ['controlled'] : []}
        onSelectedKeysChange={(keys) => {
          setSelected(keys[0]);
          setRequests(`select:${keys}`);
        }}
        onOpenKeysChange={(keys) => setRequests(`open:${keys}`)}
      >
        <MenuItem itemKey="controlled-item">Controlled Menu Item</MenuItem>
        <SubMenu itemKey="controlled" title="Controlled Menu Branch">
          <MenuItem itemKey="controlled-child">Controlled Child</MenuItem>
        </SubMenu>
      </Menu>
      <Menu
        data-testid="menu-popup"
        mode={mode}
        style={{ width: 260 }}
        triggerProps={{ trigger: 'click' }}
        onMenuItemClick={setSelected}
      >
        <SubMenu itemKey="popup" title="Popup Menu Branch" popup selectable popupMaxHeight={100}>
          <SubMenu itemKey="popup-inner" title="Popup Menu Inner">
            <MenuItem itemKey="popup-leaf">Popup Menu Leaf</MenuItem>
          </SubMenu>
        </SubMenu>
        <SubMenu ref={modeRef} itemKey="mode" title="Mode Menu Branch">
          <MenuItem itemKey="mode-leaf">Mode Menu Leaf</MenuItem>
        </SubMenu>
      </Menu>
      <Menu
        data-testid="menu-horizontal"
        mode="horizontal"
        style={{ width }}
        defaultSelectedKeys={['horizontal-a']}
        onMenuItemClick={setSelected}
        triggerProps={{ trigger: 'click' }}
      >
        <Fragment>
          <MenuItem key="horizontal-a">Horizontal Alpha</MenuItem>
          <MenuItem itemKey="horizontal-b">Horizontal Beta</MenuItem>
        </Fragment>
        <MenuItem itemKey="horizontal-c">Horizontal Gamma</MenuItem>
        <MenuItem itemKey="horizontal-d">Horizontal Delta</MenuItem>
      </Menu>
      <Menu
        data-testid="menu-content-width"
        mode="horizontal"
        style={{ width: 400 }}
        triggerProps={{ trigger: 'click' }}
        onMenuItemClick={setSelected}
      >
        <MenuItem itemKey="growing">
          {longLabel ? 'A menu item with much longer content '.repeat(3) : 'A'}
        </MenuItem>
        <MenuItem itemKey="remaining">B</MenuItem>
      </Menu>
      <Menu data-testid="menu-dynamic" autoOpen style={{ width: 260 }}>
        <SubMenu itemKey="existing" title="Existing Branch">
          <MenuItem itemKey="existing-leaf">Existing Leaf</MenuItem>
        </SubMenu>
        {late && (
          <SubMenu itemKey="late-menu" title="Late Branch">
            <MenuItem itemKey="late-menu-leaf">Late Leaf</MenuItem>
          </SubMenu>
        )}
      </Menu>
      <SiderContext.Provider
        value={{ siderCollapsed: false, siderRail: rail, siderRailWidth: 80, theme: 'dark' }}
      >
        <Menu data-testid="menu-sider" style={{ width: 260 }}>
          <MenuItem itemKey="rail" icon={<i>R</i>}>
            Rail Menu Item
          </MenuItem>
        </Menu>
      </SiderContext.Provider>
      <Menu
        data-testid="menu-responsive"
        breakpoint="md"
        style={{ width: 260 }}
        onCollapse={(value, reason) => setRequests(`${reason}:${value}`)}
      >
        <MenuItem itemKey="responsive">Responsive Menu</MenuItem>
      </Menu>
      <Menu
        data-testid="menu-scroll"
        autoScrollIntoView
        scrollConfig={{ behavior: 'instant' }}
        style={{ height: 100, width: 260, overflow: 'auto' }}
        selectedKeys={late ? ['scroll-19'] : []}
      >
        {Array.from({ length: 20 }, (_, index) => (
          <MenuItem key={index} itemKey={`scroll-${index}`}>
            Scroll Menu {index}
          </MenuItem>
        ))}
      </Menu>
      {initialScroll && (
        <Menu
          data-testid="menu-initial-scroll"
          autoOpenSelected
          autoScrollIntoView
          defaultSelectedKeys={['initial-19']}
          scrollConfig={{
            behavior: 'instant',
            boundary: (element: Element) => !element.matches('[data-testid="menu-initial-scroll"]'),
          }}
          style={{ height: 100, width: 260 }}
        >
          <SubMenu itemKey="initial-branch" title="Initial Branch">
            {Array.from({ length: 20 }, (_, index) => (
              <MenuItem key={index} itemKey={`initial-${index}`}>
                Initial Item {index}
              </MenuItem>
            ))}
          </SubMenu>
        </Menu>
      )}
    </section>
  );
}
