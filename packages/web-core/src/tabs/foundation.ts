import type { TabItem, TabKey } from './types.js';

import { isUndefined } from '../_utils/is.js';
import { KEYBOARD_KEY } from '../_utils/keyboard.js';

export function createTabsFoundation<T extends TabItem>(adapter: {
  readonly registry: Map<number, T>;
  readonly order: number[];
  readonly keys: TabKey[];
  readonly value: TabKey | undefined;
  readonly inner: TabKey | undefined;
  readonly active: TabKey | undefined;
  readonly autoSwitch: boolean;
  setInner(key: TabKey): void;
  onChange(key: TabKey): void;
  onClick(key: TabKey, event: Event): void;
  onAdd(event: Event): void;
  onDelete(key: TabKey, event: Event): void;
  defer(callback: () => void): void;
}) {
  function getSorted() {
    const result: T[] = [];
    adapter.order.forEach((id) => {
      const data = adapter.registry.get(id);
      if (data) result.push(data);
    });
    return result;
  }
  function getActive() {
    const key = adapter.value ?? adapter.inner;
    return isUndefined(key) ? adapter.keys[0] : key;
  }
  function getActiveIndex() {
    const index = adapter.keys.indexOf(adapter.active!);
    return index === -1 ? 0 : index;
  }
  function change(key: TabKey) {
    if (key !== adapter.active) {
      adapter.setInner(key);
      adapter.onChange(key);
    }
  }
  function click(key: TabKey, event: Event) {
    change(key);
    adapter.onClick(key, event);
  }
  function add(event: Event) {
    adapter.onAdd(event);
    if (adapter.autoSwitch) adapter.defer(() => change(adapter.keys[adapter.keys.length - 1]));
  }
  function remove(key: TabKey, event: Event) {
    adapter.onDelete(key, event);
  }
  return {
    getSorted,
    getActive,
    getActiveIndex,
    change,
    click,
    add,
    remove,
    register(id: number, data: T) {
      adapter.registry.set(id, data);
    },
    unregister(id: number) {
      adapter.registry.delete(id);
    },
  };
}

export function getTabNavigationTarget(
  tabs: readonly TabItem[],
  active: TabKey | undefined,
  direction: 'horizontal' | 'vertical',
  rtl: boolean,
  key: string,
): { key: TabKey } | undefined {
  const enabled = tabs.filter((tab) => !tab.disabled);
  if (!enabled.length) return undefined;
  const length = enabled.length;
  const current = Math.max(
    0,
    enabled.findIndex((tab) => tab.key === active),
  );
  let next = current;
  if (direction === 'vertical') {
    if (key === KEYBOARD_KEY.ARROW_DOWN) next = current + 1;
    else if (key === KEYBOARD_KEY.ARROW_UP) next = current - 1;
    else if (key === KEYBOARD_KEY.HOME) next = 0;
    else if (key === KEYBOARD_KEY.END) next = length - 1;
    else return undefined;
  } else {
    if (key === KEYBOARD_KEY.ARROW_RIGHT) next = rtl ? current - 1 : current + 1;
    else if (key === KEYBOARD_KEY.ARROW_LEFT) next = rtl ? current + 1 : current - 1;
    else if (key === KEYBOARD_KEY.HOME) next = 0;
    else if (key === KEYBOARD_KEY.END) next = length - 1;
    else return undefined;
  }
  next = ((next % length) + length) % length;
  return { key: enabled[next].key };
}
export function activateTab(
  tab: TabItem,
  event: Event,
  notify: (key: TabKey, event: Event) => void,
) {
  if (!tab.disabled) notify(tab.key, event);
}
export function activateTabKey(event: KeyboardEvent, activate: (event: Event) => void) {
  if (event.key === KEYBOARD_KEY.ENTER) activate(event);
  else if (event.key === KEYBOARD_KEY.SPACE) {
    event.preventDefault();
    activate(event);
  }
}
export function syncTabPane(
  active: boolean,
  destroy: boolean | undefined,
  mounted: boolean,
  setMounted: (value: boolean) => void,
) {
  if (active) {
    if (!mounted) setMounted(true);
  } else if (destroy) setMounted(false);
}
