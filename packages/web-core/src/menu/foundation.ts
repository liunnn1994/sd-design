import type { MenuMode } from './types.js';

import { isNumber } from '../_utils/is.js';
import { KEYBOARD_KEY, isActivationKey } from '../_utils/keyboard.js';

export interface MenuAdapter {
  readonly collapsed: boolean;
  setCollapsed(value: boolean): void;
  onCollapsed(value: boolean, reason: 'clickTrigger' | 'responsive'): void;
  setSelected(value: string[]): void;
  onSelected(value: string[], key: string): void;
  open(key: string, level: number): string[];
  setOpen(value: string[]): void;
  onOpen(value: string[], key: string): void;
}
export function createMenuFoundation(adapter: MenuAdapter) {
  function collapse(value: boolean, reason: 'clickTrigger' | 'responsive') {
    if (value === adapter.collapsed) return;
    adapter.setCollapsed(value);
    adapter.onCollapsed(value, reason);
  }
  function select(key: string) {
    adapter.setSelected([key]);
    adapter.onSelected([key], key);
  }
  function open(key: string, level: number) {
    const keys = adapter.open(key, level);
    adapter.setOpen(keys);
    adapter.onOpen(keys, key);
  }
  return {
    collapse,
    select,
    open,
    toggleCollapse: () => collapse(!adapter.collapsed, 'clickTrigger'),
  };
}

export function getMenuFocusTarget(mode: MenuMode, key: string, current: number, length: number) {
  const horizontal = mode === 'horizontal';
  const forward = key === (horizontal ? KEYBOARD_KEY.ARROW_RIGHT : KEYBOARD_KEY.ARROW_DOWN);
  const backward = key === (horizontal ? KEYBOARD_KEY.ARROW_LEFT : KEYBOARD_KEY.ARROW_UP);
  if (!length || (!forward && !backward && key !== KEYBOARD_KEY.HOME && key !== KEYBOARD_KEY.END))
    return undefined;
  if (key === KEYBOARD_KEY.HOME) return 0;
  if (key === KEYBOARD_KEY.END) return length - 1;
  return current < 0 ? 0 : forward ? Math.min(current + 1, length - 1) : Math.max(current - 1, 0);
}
export function isMenuNavigationKey(mode: MenuMode, key: string) {
  return getMenuFocusTarget(mode, key, 0, 1) !== undefined;
}
export function isMenuPopup(
  popup: boolean | ((level: number) => boolean),
  level: number,
  collapsed: boolean | undefined,
  inTrigger: boolean | undefined,
  mode: MenuMode | undefined,
) {
  const force = !!(typeof popup === 'function' ? popup(level) : popup);
  return force || collapsed || inTrigger || mode !== 'vertical';
}
export function hasMenuSelectedDescendant(selected: string[], submenus: string[], items: string[]) {
  return (
    selected.some((key) => submenus.includes(key)) || selected.some((key) => items.includes(key))
  );
}
export function activateMenuItem(
  event: MouseEvent,
  disabled: boolean,
  select: () => void,
  notify: (event: MouseEvent) => void,
) {
  if (disabled) return;
  select();
  notify(event);
}
export function activateMenuItemKey(event: KeyboardEvent, activate: (event: MouseEvent) => void) {
  if (isActivationKey(event)) {
    event.preventDefault();
    activate(event as unknown as MouseEvent);
  }
}
let menuId = 0;
export function generateMenuId(prefix = '') {
  return `${prefix}${++menuId}`;
}

export interface MenuPopupActivation {
  readonly key: string;
  readonly level: number;
  readonly selectable: boolean;
  onSubmenu: ((key: string, level: number) => void) | undefined;
  onSelect: ((key: string) => void) | undefined;
}
export function activatePopupMenu(adapter: MenuPopupActivation) {
  const { onSubmenu, onSelect } = adapter;
  if (onSubmenu) onSubmenu(adapter.key, adapter.level);
  if (adapter.selectable && onSelect) onSelect(adapter.key);
}
export function selectPopupMenuItem(
  key: string,
  onSelect: ((key: string) => void) | undefined,
  close: (value: boolean) => void,
) {
  if (onSelect) onSelect(key);
  close(false);
}
export function getMenuPopupMaxHeight(maxHeight: number | boolean | undefined) {
  if (isNumber(maxHeight)) return { maxHeight: `${maxHeight}px` };
  return maxHeight ? {} : { maxHeight: 'unset' };
}
