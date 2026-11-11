import type { MenuItemInstance as ItemSubpath } from '@sdata/web-react/menu';
import type { SwitchChangeHandler as ChangeSubpath } from '@sdata/web-react/switch';

import {
  Drawer,
  ConfigProvider,
  Ellipsis,
  Menu,
  MenuItem,
  SubMenu,
  NumberFlow,
  Scrollbar,
  Switch,
  type ConfigProviderTable,
  type EllipsisInstance,
  type MenuItemInstance,
  type MenuSubMenuInstance,
  type NumberFlowStyle,
  type ScrollbarInstance,
  type SwitchChangeHandler,
  type SwitchValue,
  type TriggerPosition,
  type ButtonInstance,
  type CalendarInstance,
  type ListInstance,
  type DrawerMethod,
} from '@sdata/web-react';
import { useRef } from 'react';

const position: TriggerPosition = 'bottom';
const table: ConfigProviderTable = { stripe: true };
const style: NumberFlowStyle = { 'color': 'red', '--number-flow-mask-height': '0.2em' };
const change: SwitchChangeHandler = (value: SwitchValue, event) => {
  event.currentTarget.disabled = value === false;
};
const subpathChange: ChangeSubpath = change;
// @ts-expect-error Switch event handlers receive a button event.
const wrongChange: SwitchChangeHandler = (_value, _event: KeyboardEvent) => {};
// @ts-expect-error Custom CSS properties must contain a CSS value.
const wrongStyle: NumberFlowStyle = { '--number-flow-mask-height': false };
void [position, table, wrongChange, wrongStyle];

function instanceConsumer(button: ButtonInstance, calendar: CalendarInstance, list: ListInstance) {
  button.focus();
  // @ts-expect-error Native button/anchor refs have no calendar controls.
  button.move(1);
  void [calendar, list];
}
const drawerMethod: DrawerMethod = Drawer;
void [instanceConsumer, drawerMethod];

export function PublicTypeConsumer() {
  const ellipsis = useRef<EllipsisInstance>(null);
  const item = useRef<MenuItemInstance>(null);
  const nativeItem = useRef<HTMLDivElement>(null);
  const sub = useRef<MenuSubMenuInstance>(null);
  const scrollbar = useRef<ScrollbarInstance>(null);
  const subpathItem: ItemSubpath | null = item.current;
  subpathItem?.refItemElement?.focus();
  ellipsis.current?.triggerRef?.focus();
  sub.current?.menuItemKeys.map((key) => key.toUpperCase());
  scrollbar.current?.update();
  return (
    <>
      <Ellipsis ref={ellipsis}>Content</Ellipsis>
      <Menu>
        <SubMenu ref={sub} itemKey="group">
          <MenuItem ref={item}>Item</MenuItem>
        </SubMenu>
        <MenuItem ref={nativeItem}>Native ref</MenuItem>
      </Menu>
      <ConfigProvider
        themeMode="dark"
        className="local"
        style={{ padding: 4 }}
        aria-label="Theme"
        onClick={(event) => event.currentTarget.focus()}
      />
      <Scrollbar ref={scrollbar}>Content</Scrollbar>
      <NumberFlow value={1} style={style} />
      <Switch onChange={subpathChange} />
    </>
  );
}
